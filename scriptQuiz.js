// Get DOM elements to access and manipulate them
const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const questionsCont = document.getElementById("question-container");
const questionTitle = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const resultContainer = document.getElementById("result-container");
const resultMessage = document.getElementById("result-message");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("time-left");
const restartBtn = document.createElement("button");  // Create a new button for restart the quiz

restartBtn.id = "restart-btn";
restartBtn.classList.add("restart-btn", "btn");
restartBtn.innerText = "Restart";

startBtn.addEventListener("click", startQuizBtn);
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  setNextQuestionBtn();
});
restartBtn.addEventListener("click", restartQuiz); // Add event listener for the restart button

// Variables for quiz state
let shuffledQuestions, currentQuestionIndex;
let correctAnswersCount = 0;
let selected = false;
let timer;
const maxTime = 30;  // Maximum time for each question in seconds

// Start quiz function
async function startQuizBtn() {
  startBtn.classList.add("hide"); // Hide the start button
  const questions = await fetchQuestions();   // Fetch questions from JSON file
  shuffledQuestions = questions.sort(() => Math.random() - 0.5);   // To appear questions randomly
  currentQuestionIndex = 0;   // Reset current question index
  correctAnswersCount = 0;   // Reset correct answers count
  selected = false; // Reset selected flag
  questionsCont.classList.remove("hide"); // Show the question container
  setNextQuestionBtn();   // Set up the first question
}

// Function to fetch questions from JSON file
async function fetchQuestions() {
  const response = await fetch('questions.json'); // Fetch JSON file
  return await response.json(); // Return parsed JSON data
}


function setNextQuestionBtn() {
  reSetStateOfQuestions(); // Reset state of questions
  showCurrentQuestions(shuffledQuestions[currentQuestionIndex]);   // Display the current question
  startTimerForEachQuestion();
}


function showCurrentQuestions(question) {
  questionTitle.innerText = question.question; // Set question title from the JSON file

  question.answers.forEach((answer) => {
    const button = document.createElement("button");  // Create answer button
    button.innerText = answer.text;
    button.classList.add("btn");

    if (answer.correctAnswer) {
      button.dataset.correct = answer.correctAnswer; // Set data attribute for correct answer
    }
    button.addEventListener("click", selectAnswersHandler); // Add click event listener
    answerButtons.appendChild(button); // Append button to answer buttons container
  });
}

// Function to reset state of questions
function reSetStateOfQuestions() {
  nextBtn.classList.add("hide"); // Hide the next button
  selected = false; // Reset selected flag
  clearInterval(timer); // Clear timer interval

  // Remove all answer buttons
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

// Function to handle answer selection
function selectAnswersHandler(event) {
  if (selected) return;  // Prevent multiple selections
  selected = true;  // Set selected flag
  clearInterval(timer); // Stop the timer

  const getSelectedBtn = event.target;
  const correct = getSelectedBtn.dataset.correct;
  if (correct) correctAnswersCount++; // Increment correct answers count if correct

  setStatusClass(document.body, correct); // Apply CSS class based on correctness
  Array.from(answerButtons.children).forEach((button) => {
    setStatusClass(button, button.dataset.correct); // Update CSS class for all answer buttons
    button.disabled = true; // Disable all answer buttons
  });

  if (shuffledQuestions.length > currentQuestionIndex + 1) {
    nextBtn.classList.remove("hide");
  } else {
    showQuizResult();  // Display quiz result if all questions are answered
  }
}

// Function to apply CSS class based on correctness
function setStatusClass(element, correct) {
  clearStatusClass(element);  // Clear previous status classes for the element
  if (correct) {
    element.classList.add("correct");
  } else {
    element.classList.add("wrong");
  }
}

// Function to clear CSS status classes
function clearStatusClass(element) {
  element.classList.remove("correct");
  element.classList.remove("wrong");
}

function startTimerForEachQuestion() {
  let timeLeft = maxTime;
  timerDisplay.textContent = String(timeLeft);

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = String(timeLeft);  // Update displayed time left

    if (timeLeft <= 0) {
      clearInterval(timer);  // Stop timer if time is up
      selectAnswersHandler({ target: document.createElement("button") });
    }
  }, 1000);
}


function showQuizResult() {
  clearInterval(timer);
  questionsCont.classList.add("hide");  // Hide question container
  resultContainer.classList.remove("hide");  // Show result container

  const passed = correctAnswersCount >= shuffledQuestions.length / 2;  // Check if quiz is passed
  resultMessage.innerText = passed ? "You Passed!" : "You Failed!";  // Display result message
  scoreDisplay.innerText = `You got ${correctAnswersCount} out of ${shuffledQuestions.length} correct`;


  if (passed) {
    document.body.classList.add("pass");
    document.body.classList.remove("fail");
  } else {
    document.body.classList.add("fail");
    document.body.classList.remove("pass");
  }

  resultContainer.appendChild(restartBtn);  // Show the restart button in the result container
}

function restartQuiz() {
  document.body.classList.remove("pass", "fail");   // Remove pass and fail classes from body
  resultContainer.classList.add("hide");      // Hide result container
  startBtn.classList.remove("hide");    // Show start button
}
