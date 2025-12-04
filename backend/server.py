from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Player(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    playerId: str
    coins: int = 0
    unlockedSkins: List[int] = Field(default_factory=lambda: [0])  # Skin 0 is default
    selectedSkin: int = 0
    questionLevel: int = 1
    questionsAnswered: int = 0
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PlayerCreate(BaseModel):
    playerId: str

class PlayerUpdate(BaseModel):
    coins: Optional[int] = None
    unlockedSkins: Optional[List[int]] = None
    selectedSkin: Optional[int] = None
    questionLevel: Optional[int] = None
    questionsAnswered: Optional[int] = None

class Question(BaseModel):
    question: str
    correctAnswer: int
    options: List[int]
    level: int
    operation: str

class AnswerRequest(BaseModel):
    playerId: str
    selectedAnswer: int
    correctAnswer: int
    level: int

class PurchaseRequest(BaseModel):
    playerId: str
    skinId: int


def generate_question(level: int) -> Question:
    """Generate a math question based on difficulty level"""
    
    # Determine operation and range based on level
    if level <= 5:
        # Addition (levels 1-5)
        num1 = random.randint(level * 2, level * 5 + 10)
        num2 = random.randint(level, level * 3 + 5)
        correct = num1 + num2
        question_text = f"{num1} + {num2}"
        operation = "addition"
    elif level <= 10:
        # Subtraction (levels 6-10)
        num1 = random.randint(level * 3, level * 5 + 20)
        num2 = random.randint(level, num1 - 1)
        correct = num1 - num2
        question_text = f"{num1} - {num2}"
        operation = "subtraction"
    elif level <= 15:
        # Multiplication (levels 11-15)
        num1 = random.randint(2, level - 5)
        num2 = random.randint(2, min(12, level - 3))
        correct = num1 * num2
        question_text = f"{num1} × {num2}"
        operation = "multiplication"
    else:
        # Division (level 16+)
        num2 = random.randint(2, min(12, level - 10))
        result = random.randint(2, level - 5)
        num1 = num2 * result
        correct = result
        question_text = f"{num1} ÷ {num2}"
        operation = "division"
    
    # Generate wrong options
    options = [correct]
    while len(options) < 3:
        # Generate plausible wrong answers
        if operation == "addition":
            wrong = correct + random.choice([-3, -2, -1, 1, 2, 3])
        elif operation == "subtraction":
            wrong = correct + random.choice([-5, -3, -1, 1, 3, 5])
        elif operation == "multiplication":
            wrong = correct + random.choice([-num2, -1, 1, num2])
        else:  # division
            wrong = correct + random.choice([-2, -1, 1, 2])
        
        if wrong > 0 and wrong not in options:
            options.append(wrong)
    
    random.shuffle(options)
    
    return Question(
        question=question_text,
        correctAnswer=correct,
        options=options,
        level=level,
        operation=operation
    )


# Routes
@api_router.get("/")
async def root():
    return {"message": "SlingMath API"}

@api_router.post("/player", response_model=Player)
async def create_or_get_player(input: PlayerCreate):
    """Create new player or return existing one"""
    existing = await db.players.find_one({"playerId": input.playerId}, {"_id": 0})
    
    if existing:
        # Convert ISO strings back to datetime
        if isinstance(existing.get('createdAt'), str):
            existing['createdAt'] = datetime.fromisoformat(existing['createdAt'])
        if isinstance(existing.get('updatedAt'), str):
            existing['updatedAt'] = datetime.fromisoformat(existing['updatedAt'])
        return Player(**existing)
    
    # Create new player
    player = Player(playerId=input.playerId)
    doc = player.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    doc['updatedAt'] = doc['updatedAt'].isoformat()
    
    await db.players.insert_one(doc)
    return player

@api_router.get("/player/{player_id}", response_model=Player)
async def get_player(player_id: str):
    """Get player data"""
    player = await db.players.find_one({"playerId": player_id}, {"_id": 0})
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Convert ISO strings back to datetime
    if isinstance(player.get('createdAt'), str):
        player['createdAt'] = datetime.fromisoformat(player['createdAt'])
    if isinstance(player.get('updatedAt'), str):
        player['updatedAt'] = datetime.fromisoformat(player['updatedAt'])
    
    return Player(**player)

@api_router.put("/player/{player_id}", response_model=Player)
async def update_player(player_id: str, update: PlayerUpdate):
    """Update player data"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updatedAt'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.players.update_one(
        {"playerId": player_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    
    return await get_player(player_id)

@api_router.get("/question/{level}", response_model=Question)
async def get_question(level: int):
    """Generate a math question for the given level"""
    return generate_question(level)

@api_router.post("/answer")
async def submit_answer(answer: AnswerRequest):
    """Process answer and reward coins"""
    player = await db.players.find_one({"playerId": answer.playerId}, {"_id": 0})
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    is_correct = answer.selectedAnswer == answer.correctAnswer
    
    # Update player data
    update_data = {
        "questionsAnswered": player['questionsAnswered'] + 1,
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    if is_correct:
        update_data['coins'] = player['coins'] + 5  # 5 coins per correct answer
        update_data['questionLevel'] = player['questionLevel'] + 1  # Increase difficulty
    
    await db.players.update_one(
        {"playerId": answer.playerId},
        {"$set": update_data}
    )
    
    return {
        "correct": is_correct,
        "coinsEarned": 5 if is_correct else 0,
        "newLevel": update_data.get('questionLevel', player['questionLevel']),
        "totalCoins": update_data.get('coins', player['coins'])
    }

@api_router.post("/purchase")
async def purchase_skin(purchase: PurchaseRequest):
    """Purchase a skin"""
    player = await db.players.find_one({"playerId": purchase.playerId}, {"_id": 0})
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Check if already owned
    if purchase.skinId in player['unlockedSkins']:
        raise HTTPException(status_code=400, detail="Skin already owned")
    
    # Skin prices
    skin_prices = {
        0: 0,   # Clássico (free)
        1: 50,  # Fogo
        2: 50,  # Gelo
        3: 50,  # Ouro
        4: 50,  # Arco-íris
        5: 75   # Espelho
    }
    
    skin_price = skin_prices.get(purchase.skinId, 50)
    
    # Check if enough coins
    if player['coins'] < skin_price:
        raise HTTPException(status_code=400, detail="Not enough coins")
    
    # Purchase skin
    new_skins = player['unlockedSkins'] + [purchase.skinId]
    new_coins = player['coins'] - skin_price
    
    await db.players.update_one(
        {"playerId": purchase.playerId},
        {"$set": {
            "unlockedSkins": new_skins,
            "coins": new_coins,
            "selectedSkin": purchase.skinId,
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "success": True,
        "newCoins": new_coins,
        "unlockedSkins": new_skins
    }

@api_router.post("/select-skin/{player_id}/{skin_id}")
async def select_skin(player_id: str, skin_id: int):
    """Select a skin to use"""
    player = await db.players.find_one({"playerId": player_id}, {"_id": 0})
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    if skin_id not in player['unlockedSkins']:
        raise HTTPException(status_code=400, detail="Skin not owned")
    
    await db.players.update_one(
        {"playerId": player_id},
        {"$set": {
            "selectedSkin": skin_id,
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "selectedSkin": skin_id}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()