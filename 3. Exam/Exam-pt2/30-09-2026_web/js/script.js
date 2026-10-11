"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  document.querySelectorAll("[data-calculator]").forEach(initializeCalculator);

  const ageCalculator = document.querySelector(".age-calculator");
  if (ageCalculator) {
    initializeAgeCalculator(ageCalculator);
    initializeUnixEasterEgg();
  }
});

/* Global / Navigation */
function initializeNavigation() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const isCurrent = link.getAttribute("href") === currentPage;
    if (isCurrent) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    }
  });
}

/* Standard and Scientific Calculators */
function initializeCalculator(calculator) {
  const display = calculator.querySelector("[data-display]");
  const isScientific = calculator.dataset.calculator === "scientific";
  const angleToggle = calculator.querySelector('[data-action="toggle-angle"]');
  let expression = "";
  let hasError = false;
  let justEvaluated = false;
  let useDegrees = true;

  function render(value = expression || "0") {
    display.textContent = value;
  }

  function append(value) {
    if (hasError || (justEvaluated && beginsNewExpression(value))) {
      expression = "";
      hasError = false;
    }
    justEvaluated = false;
    if (expression.length + value.length > 160) return;
    expression += value;
    render();
  }

  function clear() {
    expression = "";
    hasError = false;
    justEvaluated = false;
    render();
  }

  function removeLast() {
    if (hasError) {
      clear();
      return;
    }
    justEvaluated = false;
    expression = expression.slice(0, -1);
    render();
  }

  function calculate() {
    try {
      const result = evaluateExpression(expression, isScientific, useDegrees);
      expression = formatNumber(result);
      hasError = false;
      justEvaluated = true;
      render(expression);
    } catch {
      hasError = true;
      justEvaluated = false;
      render("Error");
    }
  }

  calculator.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || !calculator.contains(button)) return;
    const action = button.dataset.action;
    if (action === "clear") clear();
    else if (action === "delete") removeLast();
    else if (action === "equals") calculate();
    else if (action === "toggle-angle") {
      useDegrees = !useDegrees;
      angleToggle.textContent = useDegrees ? "DEG" : "RAD";
      angleToggle.setAttribute("aria-label", `Trigonometric mode: ${useDegrees ? "degrees" : "radians"}. Activate to change.`);
    } else if (button.dataset.input !== undefined) append(button.dataset.input);
  });

  document.addEventListener("keydown", (event) => {
    if (isEditableTarget(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^[0-9.+\-*/%()]$/.test(event.key)) {
      event.preventDefault();
      append(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
      event.preventDefault();
      calculate();
    } else if (event.key === "Backspace") {
      event.preventDefault();
      removeLast();
    } else if (event.key === "Escape") {
      clear();
    }
  });
}

function beginsNewExpression(value) {
  return /^[0-9.(a-z]/i.test(value);
}

function evaluateExpression(source, isScientific, useDegrees) {
  if (!source.trim()) throw new Error("Enter an expression.");
  const tokens = tokenize(source);
  let position = 0;

  function peek() {
    return tokens[position];
  }

  function consume(expected) {
    const token = peek();
    if (expected !== undefined && token !== expected) throw new Error("Unexpected token.");
    position += 1;
    return token;
  }

  function parseExpression() {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const operator = consume();
      const right = parseTerm();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  function parseTerm() {
    let value = parsePostfix();
    while (peek() === "*" || peek() === "/") {
      const operator = consume();
      const right = parsePostfix();
      if (operator === "/" && right === 0) throw new Error("Cannot divide by zero.");
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  }

  function parseUnary() {
    if (peek() === "+") {
      consume("+");
      return parseUnary();
    }
    if (peek() === "-") {
      consume("-");
      return -parseUnary();
    }
    return parsePower();
  }

  function parsePower() {
    let value = parsePrimary();
    if (peek() === "^") {
      consume("^");
      value = Math.pow(value, parseUnary());
    }
    return value;
  }

  function parsePrimary() {
    const token = consume();
    if (typeof token === "number") return token;

    if (token === "(") {
      const value = parseExpression();
      consume(")");
      return value;
    }

    if (typeof token === "string" && isScientific) {
      if (token === "pi") return Math.PI;
      if (token === "e") return Math.E;
      if (["sin", "cos", "tan", "log", "ln", "sqrt"].includes(token)) {
        consume("(");
        const argument = parseExpression();
        consume(")");
        return applyFunction(token, argument, useDegrees);
      }
    }
    throw new Error("Invalid expression.");
  }

  function parsePostfix() {
    let value = parseUnary();
    while (peek() === "%") {
      consume("%");
      value /= 100;
    }
    return value;
  }

  const result = parseExpression();
  if (position !== tokens.length || !Number.isFinite(result)) throw new Error("Invalid result.");
  return result;
}

function tokenize(source) {
  const tokens = [];
  const pattern = /\s*([0-9]*\.?[0-9]+(?:e[+-]?[0-9]+)?|[a-z]+|[()+\-*/%^])/iy;
  let position = 0;
  while (position < source.length) {
    pattern.lastIndex = position;
    const match = pattern.exec(source);
    if (!match || match[0].length === 0) throw new Error("Invalid character.");
    const raw = match[1];
    if (/^[0-9]/.test(raw) || /^\./.test(raw)) {
      const value = Number(raw);
      if (!Number.isFinite(value)) throw new Error("Invalid number.");
      tokens.push(value);
    } else if (/^[a-z]+$/i.test(raw)) {
      tokens.push(raw.toLowerCase());
    } else {
      tokens.push(raw);
    }
    position = pattern.lastIndex;
  }
  return tokens;
}

function applyFunction(name, value, useDegrees) {
  if (name === "sin") return Math.sin(useDegrees ? value * Math.PI / 180 : value);
  if (name === "cos") return Math.cos(useDegrees ? value * Math.PI / 180 : value);
  if (name === "tan") {
    const angle = useDegrees ? value * Math.PI / 180 : value;
    if (Math.abs(Math.cos(angle)) < 1e-12) throw new Error("Tangent is undefined at this angle.");
    return Math.tan(angle);
  }
  if (name === "log" || name === "ln") {
    if (value <= 0) throw new Error("Logarithms require a positive number.");
    return name === "log" ? Math.log10(value) : Math.log(value);
  }
  if (name === "sqrt") {
    if (value < 0) throw new Error("Square roots require a non-negative number.");
    return Math.sqrt(value);
  }
  throw new Error("Unsupported function.");
}

function formatNumber(value) {
  if (!Number.isFinite(value)) throw new Error("Invalid result.");
  const rounded = Number(value.toPrecision(12));
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function isEditableTarget(target) {
  return target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

/* Age Calculator */
function initializeAgeCalculator(form) {
  const dateInput = form.querySelector("#date-of-birth");
  const message = form.querySelector("[data-age-message]");
  const results = document.querySelector("[data-age-results]");
  let birthDate = null;
  let ageTimer = null;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "";
    const parsedDate = parseBirthDate(dateInput.value);
    if (!parsedDate) {
      message.textContent = dateInput.value ? "Enter a valid date of birth." : "Please choose your date of birth.";
      dateInput.setAttribute("aria-invalid", "true");
      return;
    }
    if (parsedDate.getTime() > startOfToday().getTime()) {
      message.textContent = "Date of birth cannot be in the future.";
      dateInput.setAttribute("aria-invalid", "true");
      return;
    }
    dateInput.removeAttribute("aria-invalid");
    birthDate = parsedDate;
    results.hidden = false;
    updateAgeResults(birthDate, results);
    window.clearInterval(ageTimer);
    ageTimer = window.setInterval(() => updateAgeResults(birthDate, results), 1000);
  });
}

function parseBirthDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = createLocalDate(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function addMonthsClamped(date, months) {
  const targetMonthIndex = date.getMonth() + months;
  const targetYear = date.getFullYear() + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
  return createLocalDate(targetYear, targetMonth, Math.min(date.getDate(), lastDay));
}

function createLocalDate(year, month, day) {
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month, day);
  return date;
}

function calendarAge(birthDate, now) {
  let years = now.getFullYear() - birthDate.getFullYear();
  if (addMonthsClamped(birthDate, years * 12) > now) years -= 1;
  const yearAnchor = addMonthsClamped(birthDate, years * 12);
  let months = (now.getFullYear() - yearAnchor.getFullYear()) * 12 +
    now.getMonth() - yearAnchor.getMonth();
  if (addMonthsClamped(yearAnchor, months) > now) months -= 1;
  const monthAnchor = addMonthsClamped(yearAnchor, months);
  const today = createLocalDate(now.getFullYear(), now.getMonth(), now.getDate());
  const anchorDate = createLocalDate(monthAnchor.getFullYear(), monthAnchor.getMonth(), monthAnchor.getDate());
  const days = Math.round((today.getTime() - anchorDate.getTime()) / 86400000);
  return { years, months, days };
}

function updateAgeResults(birthDate, results) {
  const now = new Date();
  const age = calendarAge(birthDate, now);
  const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - birthDate.getTime()) / 1000));
  const elapsedDays = Math.floor(elapsedSeconds / 86400);
  const calendar = {
    "[data-age-years]": age.years,
    "[data-age-months]": age.months,
    "[data-age-days]": age.days,
    "[data-total-years]": age.years,
    "[data-total-months]": age.years * 12 + age.months,
    "[data-total-weeks]": Math.floor(elapsedDays / 7),
    "[data-total-days]": elapsedDays,
    "[data-total-hours]": Math.floor(elapsedSeconds / 3600),
    "[data-total-minutes]": Math.floor(elapsedSeconds / 60),
    "[data-total-seconds]": elapsedSeconds
  };
  for (const [selector, value] of Object.entries(calendar)) {
    results.querySelector(selector).textContent = value.toLocaleString();
  }

  const unixSeconds = String(Math.floor(Date.now() / 1000));
  results.querySelector("[data-unix-seconds]").textContent = Number(unixSeconds).toLocaleString();
  const timestamp = document.querySelector("[data-unix-timestamp]");
  if (timestamp && !document.querySelector("[data-unix-panel]").hidden) {
    timestamp.textContent = unixSeconds;
  }
}

/* Unix Time Easter Egg */
function initializeUnixEasterEgg() {
  const results = document.querySelector("[data-age-results]");
  const secondsCard = results.querySelector("[data-seconds-card]");
  const panel = document.querySelector("[data-unix-panel]");
  let clickCount = 0;
  let clickResetTimer = null;
  let typedSequence = "";

  function revealUnixPanel() {
    panel.hidden = false;
    panel.querySelector("[data-unix-timestamp]").textContent = String(Math.floor(Date.now() / 1000));
  }

  secondsCard.addEventListener("click", () => {
    clickCount += 1;
    window.clearTimeout(clickResetTimer);
    if (clickCount >= 3) {
      revealUnixPanel();
      clickCount = 0;
    } else {
      clickResetTimer = window.setTimeout(() => { clickCount = 0; }, 1800);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (isEditableTarget(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
    if (!/^[a-z]$/i.test(event.key)) {
      typedSequence = "";
      return;
    }
    typedSequence = (typedSequence + event.key.toLowerCase()).slice(-4);
    if (typedSequence === "unix") {
      revealUnixPanel();
      typedSequence = "";
    }
  });
}
