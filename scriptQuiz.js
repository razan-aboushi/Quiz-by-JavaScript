const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.createElement("button"); // Create a new button for restart
const questionsCont = document.getElementById("question-container");
const questionTitle = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const resultContainer = document.getElementById("result-container");
const resultMessage = document.getElementById("result-message");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("time-left");

restartBtn.id = "restart-btn";
restartBtn.classList.add("restart-btn", "btn");
restartBtn.innerText = "Restart";

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  setNextQuestion();
});
restartBtn.addEventListener("click", restartQuiz); 

let shuffledQuestions, currentQuestionIndex;
let correctAnswersCount = 0;
let selected = false;
let timer;
const maxTime = 30;

async function startQuiz() {
  startBtn.classList.add("hide");
  const questions = await fetchQuestions();
  shuffledQuestions = questions.sort(() => Math.random() - 0.5);
  currentQuestionIndex = 0;
  correctAnswersCount = 0;
  selected = false;
  questionsCont.classList.remove("hide");
  setNextQuestion();
}

async function fetchQuestions() {
  const response = await fetch('questions.json');
  const questions = await response.json();
  return questions;
}

function setNextQuestion() {
  reSetStateOfQuestions();
  showQuestions(shuffledQuestions[currentQuestionIndex]);
  startTimer();
}

function showQuestions(question) {
  questionTitle.innerText = question.question;

  question.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.innerText = answer.text;
    button.classList.add("btn");

    if (answer.correctAnswer) {
      button.dataset.correct = answer.correctAnswer;
    }
    button.addEventListener("click", selectAnswersHandler);
    answerButtons.appendChild(button);
  });
}

function reSetStateOfQuestions() {
  nextBtn.classList.add("hide");
  selected = false;
  clearInterval(timer);

  // Remove the original buttons inside the answer buttons container
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

function selectAnswersHandler(event) {
  if (selected) return;
  selected = true;
  clearInterval(timer); // Stop the timer
  const selectedBtn = event.target;
  const correct = selectedBtn.dataset.correct;
  if (correct) correctAnswersCount++;
  setStatusClass(document.body, correct);
  Array.from(answerButtons.children).forEach((button) => {
    setStatusClass(button, button.dataset.correct);
    button.disabled = true;
  });

  if (shuffledQuestions.length > currentQuestionIndex + 1) {
    nextBtn.classList.remove("hide");
  } else {
    showResult();
  }
}

function setStatusClass(element, correct) {
  clearStatusClass(element);
  if (correct) {
    element.classList.add("correct");
  } else {
    element.classList.add("wrong");
  }
}

function clearStatusClass(element) {
  element.classList.remove("correct");
  element.classList.remove("wrong");
}

function startTimer() {
  let timeLeft = maxTime;
  timerDisplay.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      selectAnswersHandler({ target: document.createElement("button") });
    }
  }, 1000);
}

function showResult() {
  clearInterval(timer);
  questionsCont.classList.add("hide");
  resultContainer.classList.remove("hide");

  const passed = correctAnswersCount >= shuffledQuestions.length / 2;
  resultMessage.innerText = passed ? "You Passed!" : "You Failed!";
  scoreDisplay.innerText = `You got ${correctAnswersCount} out of ${shuffledQuestions.length} correct`;

  if (passed) {
    document.body.classList.add("pass");
    document.body.classList.remove("fail");
  } else {
    document.body.classList.add("fail");
    document.body.classList.remove("pass");
  }

  resultContainer.appendChild(restartBtn); // Show the restart button in the result container
}

function restartQuiz() {
  document.body.classList.remove("pass", "fail");
  resultContainer.classList.add("hide");
  startBtn.classList.remove("hide");
}
