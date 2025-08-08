const quizData = [
    {
        question: "What is 'Hello' in Spanish?",
        options: ["Hola", "Adiós", "Gracias", "Por favor"],
        answer: "Hola"
    },
    {
        question: "What is 'Goodbye' in Spanish?",
        options: ["Hola", "Adiós", "Gracias", "Por favor"],
        answer: "Adiós"
    },
    {
        question: "What is 'Thank you' in Spanish?",
        options: ["Hola", "Adiós", "Gracias", "Por favor"],
        answer: "Gracias"
    },
    {
        question: "What is 'Please' in Spanish?",
        options: ["Hola", "Adiós", "Gracias", "Por favor"],
        answer: "Por favor"
    }
];

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');

let currentQuiz = 0;

function loadQuiz() {
    feedbackEl.textContent = '';
    const currentQuizData = quizData[currentQuiz];
    questionEl.textContent = currentQuizData.question;
    optionsEl.innerHTML = '';
    currentQuizData.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => checkAnswer(option));
        optionsEl.appendChild(button);
    });
}

function checkAnswer(answer) {
    const correctAnswer = quizData[currentQuiz].answer;
    if (answer === correctAnswer) {
        feedbackEl.textContent = 'Correct!';
        feedbackEl.className = 'correct';
    } else {
        feedbackEl.textContent = `Incorrect. The correct answer is ${correctAnswer}.`;
        feedbackEl.className = 'incorrect';
    }
    // Disable buttons after answering
    const buttons = optionsEl.getElementsByTagName('button');
    for (let button of buttons) {
        button.disabled = true;
    }
}

nextBtn.addEventListener('click', () => {
    currentQuiz++;
    if (currentQuiz < quizData.length) {
        loadQuiz();
    } else {
        questionEl.textContent = "You have completed the quiz!";
        optionsEl.innerHTML = '';
        feedbackEl.textContent = '';
        nextBtn.style.display = 'none';
    }
});

loadQuiz();
