/* =========================================================
   LIFEOS — MAIN JAVASCRIPT
   Frontend only
   ========================================================= */


/* -------------------- MOBILE NAVIGATION -------------------- */

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", isOpen);
    });


    // Close menu after clicking a navigation link
    const navLinks = mainNav.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}


/* -------------------- THEME TOGGLE -------------------- */

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");

        const icon = themeToggle.querySelector(".theme-icon");

        if (document.body.classList.contains("dark-theme")) {
            if (icon) icon.textContent = "☀";
            themeToggle.setAttribute("aria-label", "Switch to light theme");
        } else {
            if (icon) icon.textContent = "◐";
            themeToggle.setAttribute("aria-label", "Switch to dark theme");
        }
    });
}


/* -------------------- LIFE TIPS -------------------- */

const lifeTip = document.getElementById("lifeTip");
const newTip = document.getElementById("newTip");

const lifeTips = [
    "Never share an OTP, PIN or password with anyone — even if they claim to be from your bank.",

    "Before buying something online, compare the price, seller reputation and return policy.",

    "A strong password is long, unique and different for every important account.",

    "When an email or message creates urgency and asks you to click a link, slow down and verify it first.",

    "Writing down your top three priorities for the day can make a busy day much easier to manage.",

    "Before accepting a job offer, understand the role, salary, working hours and important terms.",

    "Keep important documents backed up in more than one safe place.",

    "If something sounds too good to be true online, take a moment to verify it before acting.",

    "Learn the difference between a need and a want before making a large purchase.",

    "When faced with a difficult decision, list your options and consider the consequences of each one."
];

let currentTip = 0;

if (newTip && lifeTip) {
    newTip.addEventListener("click", () => {

        currentTip = (currentTip + 1) % lifeTips.length;

        lifeTip.style.opacity = "0";

        setTimeout(() => {
            lifeTip.textContent = lifeTips[currentTip];
            lifeTip.style.opacity = "1";
        }, 180);
    });
}


/* -------------------- SMOOTH ANCHOR LINKS -------------------- */

const anchorLinks = document.querySelectorAll('a[href^="#"]');

anchorLinks.forEach((link) => {

    link.addEventListener("click", (event) => {

        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }

        const target = document.querySelector(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

});


/* -------------------- SCROLL REVEAL -------------------- */

const revealElements = document.querySelectorAll(
    ".feature-card, .category-card, .tip-card, .cta-card"
);

const revealObserver = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("revealed");

                revealObserver.unobserve(entry.target);
            }

        });

    },
    {
        threshold: 0.12
    }
);

revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
});


/* -------------------- BUDGET CALCULATOR -------------------- */

const calculateBudget = document.getElementById("calculateBudget");
const incomeInput = document.getElementById("income");
const expensesInput = document.getElementById("expenses");
const remainingAmount = document.getElementById("remainingAmount");
const budgetMessage = document.getElementById("budgetMessage");

if (
    calculateBudget &&
    incomeInput &&
    expensesInput &&
    remainingAmount &&
    budgetMessage
) {
    calculateBudget.addEventListener("click", () => {

        const income = Number(incomeInput.value);
        const expenses = Number(expensesInput.value);

        if (income <= 0 || expenses < 0) {
            remainingAmount.textContent = "₹0";
            budgetMessage.textContent =
                "Please enter valid income and expense amounts.";
            return;
        }

        const remaining = income - expenses;

        remainingAmount.textContent =
            `₹${Math.abs(remaining).toLocaleString("en-IN")}`;

        if (remaining > 0) {
            budgetMessage.textContent =
                "Good — you have money left after your planned expenses.";
        }

        else if (remaining === 0) {
            budgetMessage.textContent =
                "Your income and expenses are exactly balanced.";
        }

        else {
            budgetMessage.textContent =
                `You're spending ₹${Math.abs(remaining).toLocaleString("en-IN")} more than your income.`;
        }
    });
}


/* -------------------- SPOT THE SCAM -------------------- */

const scamOptions = document.querySelectorAll(".scam-option");
const scamResult = document.getElementById("scamResult");

if (scamOptions.length > 0 && scamResult) {

    scamOptions.forEach((option) => {

        option.addEventListener("click", () => {

            const answer = option.dataset.answer;

            if (answer === "scam") {

                scamResult.innerHTML = `
                    <strong>Correct. This is suspicious.</strong><br>
                    The message creates urgency, asks for sensitive
                    information and tells you to enter an OTP through
                    a link. Don't click the link. Verify the request
                    through the organisation's official channel.
                `;

            } else {

                scamResult.innerHTML = `
                    <strong>Not quite.</strong><br>
                    This message has several warning signs: urgency,
                    a suspicious link and a request for sensitive
                    information. Treat it as suspicious and verify
                    independently.
                `;

            }

        });

    });
}


/* =========================================
   CAREER QUIZ
========================================= */

const careerOptions = document.querySelectorAll(".career-option");
const careerQuizResult = document.getElementById("careerQuizResult");

if (careerOptions.length > 0 && careerQuizResult) {
    careerOptions.forEach((option) => {
        option.addEventListener("click", () => {
            const answer = option.dataset.careerAnswer;

            if (answer === "correct") {
                careerQuizResult.innerHTML = `
                    <strong>Correct.</strong><br>
                    Being honest while explaining how you would
                    find the answer shows self-awareness,
                    problem-solving ability and professionalism.
                `;
            } else {
                careerQuizResult.innerHTML = `
                    <strong>Not quite.</strong><br>
                    Making up an answer or avoiding the question
                    can damage trust. A better approach is to be
                    honest and explain how you would find the
                    right answer.
                `;
            }
        });
    });
}


/* =========================================
   MIND QUIZ
========================================= */

const mindOptions = document.querySelectorAll(".mind-option");
const mindQuizResult = document.getElementById("mindQuizResult");

if (mindOptions.length > 0 && mindQuizResult) {
    mindOptions.forEach((option) => {
        option.addEventListener("click", () => {
            const answer = option.dataset.mindAnswer;

            if (answer === "correct") {
                mindQuizResult.innerHTML = `
                    <strong>Correct.</strong><br>
                    Breaking a large task into smaller actions and
                    protecting focused time makes the work easier
                    to start and easier to manage.
                `;
            } else {
                mindQuizResult.innerHTML = `
                    <strong>Not quite.</strong><br>
                    Waiting for pressure or constantly checking your
                    phone makes focused work harder. Start by breaking
                    the task down and reducing distractions.
                `;
            }
        });
    });
}


/* -------------------- CURRENT YEAR -------------------- */

const yearElements = document.querySelectorAll(".current-year");

yearElements.forEach((element) => {
    element.textContent = new Date().getFullYear();
});