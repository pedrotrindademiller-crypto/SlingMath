import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import './QuestionModal.css';

const QuestionModal = ({ question, onAnswer, onClose }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      onAnswer(selectedAnswer);
      setSelectedAnswer(null);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="question-modal" data-testid="question-modal">
        <DialogHeader>
          <DialogTitle className="question-title">Questão Matemática</DialogTitle>
        </DialogHeader>

        <div className="question-content">
          <div className="question-level" data-testid="question-level">
            Nível {question.level}
          </div>

          <div className="question-text" data-testid="question-text">
            {question.question} = ?
          </div>

          <div className="options-container">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => setSelectedAnswer(option)}
                className={`option-button ${
                  selectedAnswer === option ? 'option-selected' : ''
                }`}
                variant={selectedAnswer === option ? 'default' : 'outline'}
                data-testid={`option-${index}`}
              >
                {option}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="submit-button"
            size="lg"
            data-testid="submit-answer-button"
          >
            Confirmar Resposta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionModal;