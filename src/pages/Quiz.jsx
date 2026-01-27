import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Quiz.css";



const quizzes = {
  python: {
    title: "Python Basics",
    questions: [
      {
        id: 1,
        question: "What is the correct way to create a list in Python?",
        options: ["list = [1, 2, 3]", "list = (1, 2, 3)", "list = {1, 2, 3}", "list = <1, 2, 3>"],
        correct: 0,
        explanation: "Square brackets [] are used to create a list in Python."
      },
      {
        id: 2,
        question: "Which keyword is used to create a function?",
        options: ["function", "func", "def", "define"],
        correct: 2,
        explanation: "'def' keyword is used to define a function in Python."
      },
      {
        id: 3,
        question: "What does len() function do?",
        options: ["Returns the length of an object", "Returns the type of object", "Deletes an object", "Converts to integer"],
        correct: 0,
        explanation: "len() returns the number of items in an object like strings, lists, etc."
      },
      {
        id: 4,
        question: "How do you insert a comment in Python?",
        options: ["// comment", "/* comment */", "# comment", "-- comment"],
        correct: 2,
        explanation: "# is used for single-line comments in Python."
      },
      {
        id: 5,
        question: "Which data type is immutable in Python?",
        options: ["List", "Dictionary", "Tuple", "Set"],
        correct: 2,
        explanation: "Tuples are immutable, meaning their values cannot be changed after creation."
      }
    ]
  },
  webdev: {
    title: "Web Development",
    questions: [
      {
        id: 1,
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
        correct: 0,
        explanation: "HTML stands for Hyper Text Markup Language, the standard markup language for web pages."
      },
      {
        id: 2,
        question: "Which tag is used for the largest heading?",
        options: ["<h6>", "<h1>", "<heading>", "<head>"],
        correct: 1,
        explanation: "<h1> is used for the most important heading on a page."
      },
      {
        id: 3,
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
        correct: 1,
        explanation: "CSS stands for Cascading Style Sheets, used to style web pages."
      },
      {
        id: 4,
        question: "Which JavaScript method is used to select an element by ID?",
        options: ["getElementByClass()", "getElementById()", "querySelector()", "selectElement()"],
        correct: 1,
        explanation: "getElementById() is used to select an element by its ID attribute."
      },
      {
        id: 5,
        question: "What is the correct way to declare a variable in JavaScript?",
        options: ["var x = 5;", "let x = 5;", "const x = 5;", "All of the above"],
        correct: 3,
        explanation: "var, let, and const are all valid ways to declare variables in JavaScript."
      }
    ]
  },
  general: {
    title: "General Knowledge",
    questions: [
      {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2,
        explanation: "Paris is the capital city of France."
      },
      {
        id: 2,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1,
        explanation: "Mars is known as the Red Planet due to its reddish appearance."
      },
      {
        id: 3,
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correct: 3,
        explanation: "The Pacific Ocean is the largest ocean covering about 46% of Earth's surface."
      },
      {
        id: 4,
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Jane Austen", "William Shakespeare", "Charles Dickens", "Mark Twain"],
        correct: 1,
        explanation: "William Shakespeare wrote the famous tragedy 'Romeo and Juliet'."
      },
      {
        id: 5,
        question: "What is the smallest country in the world?",
        options: ["Monaco", "Liechtenstein", "Vatican City", "San Marino"],
        correct: 2,
        explanation: "Vatican City is the smallest country in the world."
      }
    ]
  },
  ml: {
    title: "ML",
    questions: [
      {
        id: 1,
        question: "Which statement best describes the evolution of Machine Learning?",
        options: [
          "ML began with deep learning and then moved to symbolic AI",
          "ML evolved from rule-based systems to statistical learning and now deep learning",
          "ML started with hardware improvements only",
          "ML has not changed since its inception"
        ],
        correct: 1,
        explanation: "ML progressed from rule-based (symbolic) systems to statistical methods and, more recently, deep learning."
      },
      {
        id: 2,
        question: "Which of the following is a major paradigm of machine learning?",
        options: ["Imperative programming", "Supervised, Unsupervised, Reinforcement", "Web programming", "Relational algebra"],
        correct: 1,
        explanation: "The principal ML paradigms are supervised, unsupervised, and reinforcement learning."
      },
      {
        id: 3,
        question: "Learning by rote means:",
        options: [
          "Inferring general rules from examples",
          "Memorizing exact responses without generalization",
          "Optimizing a reward function",
          "Transforming features into vectors"
        ],
        correct: 1,
        explanation: "Rote learning stores specific examples or responses without deriving general rules."
      },
      {
        id: 4,
        question: "Learning by induction refers to:",
        options: [
          "Using a fixed rule to answer all problems",
          "Deriving general rules from observed examples",
          "Training by trial-and-error with rewards",
          "Hard-coding features"
        ],
        correct: 1,
        explanation: "Induction is the process of learning general rules or models from specific examples."
      },
      {
        id: 5,
        question: "Which best describes reinforcement learning?",
        options: [
          "Learning from labelled input-output pairs",
          "Learning from unlabelled data",
          "Learning by trial-and-error using rewards and penalties",
          "Learning by memorizing the dataset"
        ],
        correct: 2,
        explanation: "Reinforcement learning trains agents via rewards/penalties through interactions with an environment."
      },
      {
        id: 6,
        question: "Which is a common type of data used in ML?",
        options: ["Structured tabular data", "Unstructured text/images", "Time-series data", "All of the above"],
        correct: 3,
        explanation: "ML uses structured, unstructured, and time-series data among other types."
      },
      {
        id: 7,
        question: "In ML, 'matching' typically refers to:",
        options: [
          "Comparing inputs to known patterns or templates",
          "Adjusting learning rates",
          "Normalizing features",
          "Creating deployment pipelines"
        ],
        correct: 0,
        explanation: "Matching compares inputs to templates or stored examples (e.g., nearest neighbor, template matching)."
      },
      {
        id: 8,
        question: "Which stage comes first in a typical ML workflow?",
        options: ["Model Evaluation", "Feature Engineering", "Data Acquisition", "Model Deployment"],
        correct: 2,
        explanation: "Data acquisition (collecting data) is the initial stage before feature engineering and modeling."
      },
      {
        id: 9,
        question: "Feature engineering is the process of:",
        options: [
          "Designing the UI for ML apps",
          "Creating, selecting, and transforming input variables for the model",
          "Evaluating models on test data",
          "Deploying models to production"
        ],
        correct: 1,
        explanation: "Feature engineering builds and transforms input variables to improve model performance."
      },
      {
        id: 10,
        question: "Model selection involves:",
        options: [
          "Choosing the best model architecture and hyperparameters based on validation performance",
          "Only choosing the fastest model",
          "Selecting the largest dataset",
          "Always using linear regression"
        ],
        correct: 0,
        explanation: "Model selection chooses architectures and hyperparameters that perform best on validation data."
      },
      {
        id: 11,
        question: "Model evaluation metrics for classification commonly include:",
        options: ["Accuracy, Precision, Recall, F1-score", "MSE only", "PageRank", "BLEU score"],
        correct: 0,
        explanation: "Accuracy, precision, recall and F1 are standard classification metrics; MSE is for regression."
      },
      {
        id: 12,
        question: "A 'dataset' in ML is:",
        options: [
          "A collection of examples used for training, validation, or testing",
          "Only the training split",
          "A programming library",
          "A deployment environment"
        ],
        correct: 0,
        explanation: "A dataset contains examples (with or without labels) partitioned into training/validation/test sets."
      }
    ]
  }
};

export default function Quiz() {
  const navigate = useNavigate();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const startQuiz = (quizKey) => {
    setSelectedQuiz(quizKey);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setAnswers([]);
    setSelectedAnswer(null);
  };

  const handleAnswer = (optionIndex) => {
    setSelectedAnswer(optionIndex);
    const quiz = quizzes[selectedQuiz];
    const isCorrect = optionIndex === quiz.questions[currentQuestion].correct;

    if (isCorrect) {
      setScore(score + 1);
    }

    setAnswers([...answers, optionIndex]);
  };

  const nextQuestion = () => {
    const quiz = quizzes[selectedQuiz];
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setAnswers([]);
    setSelectedAnswer(null);
  };

  const getEmotionalFeedback = () => {
    const percentage = (score / quizzes[selectedQuiz].questions.length) * 100;
    if (percentage === 100) return "🎉 Perfect! Outstanding performance!";
    if (percentage >= 80) return "😊 Great job! You're doing well!";
    if (percentage >= 60) return "👍 Good effort! Keep practicing!";
    if (percentage >= 40) return "💪 Not bad! Review the topics and try again.";
    return "📚 Keep learning! Practice makes perfect!";
  };

  // Quiz Selection Screen
  if (!selectedQuiz) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <h1>📚 Quiz Center</h1>
          <p>Select a quiz to test your knowledge</p>
        </div>

        <div className="quiz-selection">
          {Object.entries(quizzes).map(([key, quiz]) => (
            <div key={key} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.questions.length} Questions</p>
              <button onClick={() => startQuiz(key)} className="start-btn">
                Start Quiz
              </button>
            </div>
          ))}
        </div>

        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
      </div>
    );
  }

  const quiz = quizzes[selectedQuiz];
  const question = quiz.questions[currentQuestion];

  // Results Screen
  if (showResults) {
    return (
      <div className="quiz-container">
        <div className="results-screen">
          <h2>Quiz Complete! 🎊</h2>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/ {quiz.questions.length}</span>
            </div>
          </div>
          <p className="emotional-feedback">{getEmotionalFeedback()}</p>
          <p className="percentage">
            {Math.round((score / quiz.questions.length) * 100)}% Correct
          </p>

          <div className="answer-review">
            <h3>Answer Review</h3>
            {quiz.questions.map((q, idx) => (
              <div key={idx} className={`review-item ${answers[idx] === q.correct ? "correct" : "incorrect"}`}>
                <p><strong>Q{idx + 1}: {q.question}</strong></p>
                <p className="explanation">📝 {q.explanation}</p>
                <p className={answers[idx] === q.correct ? "text-green" : "text-red"}>
                  {answers[idx] === q.correct ? "✅ Correct" : "❌ Incorrect"}
                </p>
              </div>
            ))}
          </div>

          <div className="results-buttons">
            <button onClick={restartQuiz} className="restart-btn">
              Try Another Quiz
            </button>
            <button onClick={() => navigate("/learning")} className="continue-btn">
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{quiz.title}</h2>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
        <p className="progress-text">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </p>
      </div>

      <div className="question-container">
        <h3 className="question">{question.question}</h3>

        <div className="options">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              className={`option-btn ${selectedAnswer === idx ? "selected" : ""}`}
              onClick={() => handleAnswer(idx)}
            >
              <span className="option-letter">{String.fromCharCode(65 + idx)}.</span>
              <span>{option}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-footer">
        <button
          onClick={nextQuestion}
          disabled={selectedAnswer === null}
          className="next-btn"
        >
          {currentQuestion === quiz.questions.length - 1 ? "Submit Quiz" : "Next Question"}
        </button>
        <button onClick={restartQuiz} className="cancel-btn">
          Exit Quiz
        </button>
      </div>
    </div>
  );
}