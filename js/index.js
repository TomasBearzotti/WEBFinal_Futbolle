"use strict";

var API_BASE = "https://futbolle-daw-uai-2026.onrender.com/api/players";
var API_SEARCH_BASE = API_BASE + "/search";
var MAX_ATTEMPTS = 8;
var SEARCH_DELAY = 250;
var HISTORY_KEY = "futbolle-history";
var THEME_KEY = "futbolle-theme";
var DEFAULT_THEME = "light";
var HISTORY_PAGE_SIZE = 5;
var SOUND_WIN_URL = "sonidos/mixkit-achievement-bell-600.wav";
var SOUND_LOSE_URL = "sonidos/mixkit-losing-bleeps-2026.wav";
var state = {
  playerName: "",
  difficulty: "facil",
  secretPlayer: null,
  guessedNames: {},
  guesses: [],
  attemptsUsed: 0,
  attemptsLeft: MAX_ATTEMPTS,
  gameStarted: false,
  gameFinished: false,
  timerSeconds: 0,
  timerId: null,
  searchTimerId: null,
  searchTerm: "",
  history: [],
  historySort: "date",
  historyPage: 0,
  selectedView: "game",
  theme: DEFAULT_THEME,
  score: 0,
};

var dom = {};

window.addEventListener("DOMContentLoaded", onDomReady);

function onDomReady() {
  cacheDom();
  bindEvents();
  loadThemeFromStorage();
  loadHistoryFromStorage();
  setActiveView("game");
  openStartModal();
  setFormEnabled(false);
  renderBoard();
  updateStaticLabels();
  updateScoreDisplay();
}

function cacheDom() {
  dom.body = document.body;
  dom.gameView = document.getElementById("game-view");
  dom.contactView = document.getElementById("contact-view");
  dom.btnGameView = document.getElementById("btn-game-view");
  dom.btnContactView = document.getElementById("btn-contact-view");
  dom.btnTheme = document.getElementById("btn-theme");
  dom.btnHistory = document.getElementById("btn-history");
  dom.btnRestart = document.getElementById("btn-restart");
  dom.humanPlayerLabel = document.getElementById("human-player-label");
  dom.difficultyLabel = document.getElementById("difficulty-label");
  dom.attemptsLeftLabel = document.getElementById("attempts-left-label");
  dom.timerLabel = document.getElementById("timer-label");
  dom.scoreLabel = document.getElementById("score-label");
  dom.guessForm = document.getElementById("guess-form");
  dom.playerSearch = document.getElementById("player-search");
  dom.playerSuggestions = document.getElementById("player-suggestions");
  dom.btnSubmitGuess = document.getElementById("btn-submit-guess");
  dom.attemptsList = document.getElementById("attempts-list");
  dom.emptyBoard = document.getElementById("empty-board");
  dom.secretPhotoBox = document.getElementById("secret-photo-box");
  dom.secretPhoto = document.getElementById("secret-photo");
  dom.secretHints = document.getElementById("secret-hints");
  dom.secretStatus = document.getElementById("secret-status");
  dom.startModal = document.getElementById("start-modal");
  dom.startForm = document.getElementById("start-form");
  dom.humanName = document.getElementById("human-name");
  dom.difficultySelect = document.getElementById("difficulty-select");
  dom.messageModal = document.getElementById("message-modal");
  dom.messageModalTitle = document.getElementById("message-modal-title");
  dom.messageModalBody = document.getElementById("message-modal-body");
  dom.messageModalActions = document.getElementById("message-modal-actions");
  dom.messageModalClose = document.getElementById("message-modal-close");
  dom.contactForm = document.getElementById("contact-form");
  dom.contactName = document.getElementById("contact-name");
  dom.contactEmail = document.getElementById("contact-email");
  dom.contactMessage = document.getElementById("contact-message");
  dom.contactFeedback = document.getElementById("contact-feedback");
  dom.btnSubmitContact = document.getElementById("contact-submit");
}

function bindEvents() {
  dom.btnGameView.addEventListener("click", handleGameViewClick);
  dom.btnContactView.addEventListener("click", handleContactViewClick);
  dom.btnTheme.addEventListener("click", handleThemeToggle);
  dom.btnHistory.addEventListener("click", handleHistoryOpen);
  dom.btnRestart.addEventListener("click", handleRestartClick);
  dom.guessForm.addEventListener("submit", handleGuessSubmit);
  dom.playerSearch.addEventListener("input", handlePlayerSearchInput);
  dom.playerSearch.addEventListener("keydown", handlePlayerSearchKeydown);
  dom.startForm.addEventListener("submit", handleStartSubmit);
  dom.messageModalClose.addEventListener("click", handleMessageClose);
  dom.messageModal.addEventListener("click", handleMessageBackdropClick);
  dom.contactForm.addEventListener("submit", handleContactSubmit);
  window.addEventListener("keydown", handleEscapeKeydown);
}

function updateStaticLabels() {
  state.attemptsLeft = MAX_ATTEMPTS;
  dom.attemptsLeftLabel.textContent = String(state.attemptsLeft);
  dom.timerLabel.textContent = formatSeconds(state.timerSeconds);
  dom.humanPlayerLabel.textContent = state.playerName || "Sin definir";
  dom.difficultyLabel.textContent = getDifficultyLabel(state.difficulty);
  updateDifficultyStatus();
  updateScoreDisplay();
}

function loadThemeFromStorage() {
  var savedTheme;

  savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_KEY);
  } catch (error) {
    savedTheme = null;
  }
  if (savedTheme !== "dark" && savedTheme !== "light") {
    savedTheme = DEFAULT_THEME;
  }
  applyTheme(savedTheme);
}

function applyTheme(themeName) {
  state.theme = themeName;
  dom.body.classList.remove("theme-light", "theme-dark");
  dom.body.classList.add(themeName === "dark" ? "theme-dark" : "theme-light");
  dom.btnTheme.textContent =
    themeName === "dark" ? "Modo claro" : "Modo oscuro";
  try {
    localStorage.setItem(THEME_KEY, themeName === "dark" ? "dark" : "light");
  } catch (error) {
    return;
  }
}

function loadHistoryFromStorage() {
  var rawHistory;

  rawHistory = "[]";
  try {
    rawHistory = localStorage.getItem(HISTORY_KEY) || "[]";
  } catch (error) {
    rawHistory = "[]";
  }
  try {
    state.history = JSON.parse(rawHistory);
  } catch (parseError) {
    state.history = [];
  }
}

function saveHistoryToStorage() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
  } catch (error) {
    return;
  }
}

function setActiveView(viewName) {
  state.selectedView = viewName;
  if (viewName === "contact") {
    dom.gameView.classList.add("hidden");
    dom.contactView.classList.remove("hidden");
  } else {
    dom.contactView.classList.add("hidden");
    dom.gameView.classList.remove("hidden");
  }
  dom.btnGameView.classList.toggle("button-active", viewName === "game");
  dom.btnContactView.classList.toggle("button-active", viewName === "contact");
  dom.btnGameView.setAttribute(
    "aria-pressed",
    viewName === "game" ? "true" : "false",
  );
  dom.btnContactView.setAttribute(
    "aria-pressed",
    viewName === "contact" ? "true" : "false",
  );
}

function handleGameViewClick() {
  setActiveView("game");
}

function handleContactViewClick() {
  setActiveView("contact");
}

function handleThemeToggle() {
  if (state.theme === "dark") {
    applyTheme("light");
    return;
  }
  applyTheme("dark");
}

function handleHistoryOpen() {
  openHistoryModal();
}

function handleRestartClick() {
  if (!state.secretPlayer) {
    openStartModal();
    return;
  }
  resetRound();
  loadSecretForRound();
}

function handlePlayerSearchInput() {
  var currentValue;
  var normalizedValue;

  currentValue = trimValue(dom.playerSearch.value);
  normalizedValue = normalizeName(currentValue);
  state.searchTerm = currentValue;
  if (state.searchTimerId) {
    window.clearTimeout(state.searchTimerId);
  }
  if (normalizedValue.length < 2) {
    renderSuggestionList([]);
    return;
  }
  state.searchTimerId = window.setTimeout(fetchPlayerSuggestions, SEARCH_DELAY);
}

function handlePlayerSearchKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    handleGuessSubmit(event);
  }
}

function handleStartSubmit(event) {
  var humanName;
  var difficulty;

  event.preventDefault();
  humanName = trimValue(dom.humanName.value);
  difficulty = dom.difficultySelect.value;
  if (!validateHumanName(humanName)) {
    showModalMessage(
      "Validación",
      "El nombre debe tener al menos 3 caracteres alfanuméricos.",
      [],
    );
    return;
  }
  state.playerName = humanName;
  state.difficulty = difficulty;
  dom.humanPlayerLabel.textContent = state.playerName;
  dom.difficultyLabel.textContent = getDifficultyLabel(state.difficulty);
  loadSecretForRound();
}

function handleGuessSubmit(event) {
  var guessName;
  var normalizedGuessName;

  event.preventDefault();
  if (state.gameFinished || !state.secretPlayer) {
    return;
  }
  guessName = trimValue(dom.playerSearch.value);
  normalizedGuessName = normalizeName(guessName);
  if (!guessName) {
    showModalMessage(
      "Intento vacío",
      "Escribí un nombre válido antes de registrar el intento.",
      [],
    );
    return;
  }
  if (normalizedGuessName.length < 2) {
    showModalMessage(
      "Nombre muy corto",
      "Ingresá al menos 2 caracteres para buscar un jugador.",
      [],
    );
    return;
  }
  searchAndValidateGuess(guessName);
}

function handleMessageClose() {
  hideMessageModal();
}

function handleMessageBackdropClick(event) {
  if (event.target === dom.messageModal) {
    hideMessageModal();
  }
}

function handleEscapeKeydown(event) {
  if (
    event.key === "Escape" &&
    !dom.messageModal.classList.contains("hidden")
  ) {
    hideMessageModal();
  }
}

function handleContactSubmit(event) {
  var nameValue;
  var emailValue;
  var messageValue;
  var mailtoLink;

  event.preventDefault();
  nameValue = trimValue(dom.contactName.value);
  emailValue = trimValue(dom.contactEmail.value);
  messageValue = trimValue(dom.contactMessage.value);
  if (!validateContactName(nameValue)) {
    dom.contactFeedback.textContent =
      "El nombre debe ser alfanumérico y no puede quedar vacío.";
    return;
  }
  if (!validateContactEmail(emailValue)) {
    dom.contactFeedback.textContent = "Ingresá un mail válido.";
    return;
  }
  if (messageValue.length <= 5) {
    dom.contactFeedback.textContent =
      "El mensaje debe tener más de 5 caracteres.";
    return;
  }
  mailtoLink = buildMailtoLink(nameValue, emailValue, messageValue);
  dom.contactFeedback.textContent =
    "Abriendo tu cliente de correo predeterminado...";
  window.location.href = mailtoLink;
}

function validateHumanName(nameValue) {
  return /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ ]{3,}$/.test(nameValue);
}

function validateContactName(nameValue) {
  return (
    /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(nameValue) && nameValue.length > 0
  );
}

function validateContactEmail(emailValue) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
}

function buildMailtoLink(nameValue, emailValue, messageValue) {
  var subject;
  var body;

  subject = encodeURIComponent("Contacto Futbolle");
  body = encodeURIComponent(
    "Nombre: " +
      nameValue +
      "\nMail: " +
      emailValue +
      "\nMensaje: " +
      messageValue,
  );
  return (
    "mailto:Tomas.ariaskarle@uai.edu.ar?subject=" + subject + "&body=" + body
  );
}

function trimValue(value) {
  return String(value || "")
    .replace(/^\s+|\s+$/g, "")
    .replace(/\s+/g, " ");
}

function loadSecretForRound() {
  setFormEnabled(false);
  fetchSecretPlayer();
}

function fetchSecretPlayer() {
  fetch(API_BASE + "/random")
    .then(handleSecretFetchResponse)
    .catch(handleSecretFetchError);
}

function handleSecretFetchResponse(response) {
  if (!response.ok) {
    throw new Error("No se pudo obtener el jugador secreto.");
  }
  return response.json().then(handleSecretJson);
}

function handleSecretJson(playerData) {
  playerData.name = cleanPlayerName(playerData.name);

  state.secretPlayer = playerData;
  prepareNewRoundView();
  if (dom.startModal.classList.contains("modal-visible")) {
    hideStartModal();
  }
  setFormEnabled(true);
  updateSecretPanel();
  updateDifficultyStatus();
  hideMessageModal();
}

function handleSecretFetchError(error) {
  setFormEnabled(false);
  showModalMessage(
    "Error de red",
    "No se pudo obtener el jugador secreto. Revisá tu conexión y volvé a intentar.",
    [{ label: "Reintentar", action: "retry-secret" }],
  );
  state.secretPlayer = null;
  if (!state.gameStarted) {
    openStartModal();
  }
}

function renderBoard() {
  var row;
  var index;

  dom.attemptsList.innerHTML = "";
  if (state.guesses.length === 0) {
    dom.attemptsList.appendChild(dom.emptyBoard);
    dom.emptyBoard.classList.remove("hidden");
    return;
  }
  dom.emptyBoard.classList.add("hidden");
  for (index = 0; index < state.guesses.length; index += 1) {
    row = buildGuessRow(
      state.guesses[index].guess,
      state.guesses[index].comparison,
    );
    dom.attemptsList.appendChild(row);
  }
}

function registerGuess(playerData) {
  var normalizedName;
  var comparison;

  if (state.gameFinished || !state.secretPlayer) {
    return;
  }
  normalizedName = normalizeName(playerData.name);
  if (state.guessedNames[normalizedName]) {
    showModalMessage(
      "Intento repetido",
      "Ya habías probado ese jugador en esta partida.",
      [],
    );
    return;
  }
  state.guessedNames[normalizedName] = true;
  startTimerIfNeeded();
  state.attemptsUsed += 1;
  state.attemptsLeft = Math.max(0, MAX_ATTEMPTS - state.attemptsUsed);
  comparison = comparePlayers(playerData, state.secretPlayer);
  state.guesses.unshift({
    guess: playerData,
    comparison: comparison,
  });
  renderBoard();
  updateStatsAfterGuess();
  updateSecretPanel();
  if (comparison.isExactMatch) {
    finishGame(true);
    return;
  }
  if (state.attemptsLeft <= 0) {
    finishGame(false);
    return;
  }
  dom.playerSearch.value = "";
  renderSuggestionList([]);
  updateDifficultyStatus();
  updateScoreDisplay();
}

function fetchPlayerSuggestions() {
  var url =
    API_SEARCH_BASE + "?q=" + encodeURIComponent(state.searchTerm) + "&limit=8";

  fetch(url)
    .then(handleSuggestionFetchResponse)
    .catch(handleSuggestionFetchError);
}

function handleSuggestionFetchResponse(response) {
  if (!response.ok) {
    throw new Error("No se pudieron cargar las sugerencias.");
  }
  return response.json().then(handleSuggestionJson);
}

function handleSuggestionJson(players) {
  var suggestions;
  var index;
  var playerName;

  suggestions = [];
  for (index = 0; index < players.length; index += 1) {
    playerName = cleanPlayerName(players[index].name);

    if (suggestions.indexOf(playerName) === -1) {
      suggestions.push(playerName);
    }
  }
  renderSuggestionList(suggestions);
}

function handleSuggestionFetchError(error) {
  showModalMessage(
    "Error de red",
    "No se pudieron cargar las sugerencias del buscador.",
    [],
  );
}

function renderSuggestionList(suggestions) {
  var option;
  var index;

  dom.playerSuggestions.innerHTML = "";
  for (index = 0; index < suggestions.length; index += 1) {
    option = document.createElement("option");
    option.value = suggestions[index];
    dom.playerSuggestions.appendChild(option);
  }
}

function searchAndValidateGuess(guessName) {
  fetch(
    API_SEARCH_BASE +
      "?q=" +
      encodeURIComponent(normalizeName(guessName)) +
      "&limit=8",
  )
    .then(handleGuessFetchResponse)
    .catch(handleGuessFetchError);
}

function handleGuessFetchResponse(response) {
  if (!response.ok) {
    throw new Error("No se pudo validar el jugador.");
  }
  return response.json().then(handleGuessJson);
}

function handleGuessJson(players) {
  var normalizedGuess;
  var foundPlayer;
  var index;
  var cleanName;

  normalizedGuess = normalizeName(dom.playerSearch.value);
  foundPlayer = null;

  for (index = 0; index < players.length; index += 1) {
    cleanName = cleanPlayerName(players[index].name);

    if (normalizeName(cleanName) === normalizedGuess) {
      players[index].name = cleanName;
      foundPlayer = players[index];
      break;
    }
  }

  if (!foundPlayer) {
    showModalMessage(
      "Jugador inválido",
      "El nombre no coincide exactamente con un jugador del dataset.",
      [],
    );
    return;
  }
  registerGuess(foundPlayer);
}

function handleGuessFetchError(error) {
  showModalMessage("Error de red", "No se pudo validar el intento.", []);
}

function buildGuessRow(playerData, comparison) {
  var row;

  row = document.createElement("div");
  row.className = "board-row";

  row.appendChild(
    buildCell(
      playerData.name,
      "cell cell-name" + (comparison.isExactMatch ? " hint-good" : ""),
    ),
  );
  row.appendChild(
    buildImageCell(
      playerData.nationality,
      playerData.flag,
      buildHintClass(comparison.nationality),
      "Nacionalidad",
    ),
  );

  row.appendChild(
    buildImageCell(
      playerData.club,
      playerData.clubLogo,
      buildHintClass(comparison.club),
      "Club",
    ),
  );
  row.appendChild(
    buildCell(
      playerData.position,
      buildHintClass(comparison.position),
      undefined,
      "Posición",
    ),
  );
  row.appendChild(
    buildCell(
      String(playerData.age),
      buildNumericHintClass(comparison.age),
      buildNumericSymbol(comparison.age),
      "Edad",
    ),
  );
  row.appendChild(
    buildCell(
      String(playerData.overall),
      buildNumericHintClass(comparison.overall),
      buildNumericSymbol(comparison.overall),
      "Overall",
    ),
  );
  row.appendChild(
    buildCell(
      String(playerData.heightCm),
      buildNumericHintClass(comparison.height),
      buildNumericSymbol(comparison.height),
      "Altura (cm)",
    ),
  );

  return row;
}

function buildCell(value, className, symbol, labelText) {
  var cell;

  cell = document.createElement("div");
  cell.className = className;
  cell.textContent = value;
  if (symbol) {
    cell.textContent = value + " " + symbol;
  }
  if (labelText) {
    cell.dataset.label = labelText;
  }
  cell.title = String(value);
  return cell;
}

function buildImageCell(textValue, imageUrl, className, labelText) {
  var cell;
  var contentWrap;
  var img;
  var textSpan;

  cell = document.createElement("div");
  cell.className = className;
  cell.classList.add("cell-with-image");
  if (labelText) {
    cell.dataset.label = labelText;
  }

  contentWrap = document.createElement("div");
  contentWrap.className = "cell-content";

  img = document.createElement("img");
  img.src = imageUrl;
  img.alt = textValue;
  img.className = "cell-icon";

  textSpan = document.createElement("span");
  textSpan.textContent = textValue;
  textSpan.title = String(textValue);

  contentWrap.appendChild(img);
  contentWrap.appendChild(textSpan);
  cell.appendChild(contentWrap);

  return cell;
}

function buildHintClass(resultValue) {
  if (resultValue === "good") {
    return "cell hint-good";
  }
  return "cell hint-bad";
}

function buildNumericHintClass(resultValue) {
  if (resultValue === "good") {
    return "cell hint-good";
  }
  if (resultValue === "high" || resultValue === "low") {
    return "cell hint-neutral";
  }
  return "cell hint-bad";
}

function buildNumericSymbol(resultValue) {
  if (resultValue === "high") {
    return "▲";
  }
  if (resultValue === "low") {
    return "▼";
  }
  if (resultValue === "good") {
    return "✓";
  }
  return "";
}

function updateStatsAfterGuess() {
  dom.attemptsLeftLabel.textContent = String(state.attemptsLeft);
  dom.timerLabel.textContent = formatSeconds(state.timerSeconds);
  updateDifficultyStatus();
  updateScoreDisplay();
}

function startTimerIfNeeded() {
  if (state.gameStarted) {
    return;
  }
  state.gameStarted = true;
  state.timerSeconds = 0;
  updateTimerLabel();
  state.timerId = window.setInterval(handleTimerTick, 1000);
}

function handleTimerTick() {
  state.timerSeconds += 1;
  updateTimerLabel();
  updateDifficultyStatus();
}

function updateTimerLabel() {
  dom.timerLabel.textContent = formatSeconds(state.timerSeconds);
}

function formatSeconds(totalSeconds) {
  var minutes;
  var seconds;

  minutes = Math.floor(totalSeconds / 60);
  seconds = totalSeconds % 60;
  return padNumber(minutes) + ":" + padNumber(seconds);
}

function padNumber(numberValue) {
  if (numberValue < 10) {
    return "0" + numberValue;
  }
  return String(numberValue);
}

function updateDifficultyStatus() {
  var hintHtml;
  var extraHints;

  hintHtml = "";
  extraHints = [];
  if (!state.secretPlayer) {
    dom.secretPhotoBox.classList.add("secret-hidden");
    dom.secretHints.innerHTML = "";
    dom.secretStatus.textContent = "Esperando el jugador secreto.";
    return;
  }
  if (state.difficulty === "facil") {
    dom.secretPhotoBox.classList.remove("secret-hidden");
    dom.secretPhoto.src = state.secretPlayer.photo;
    dom.secretPhoto.alt = "Foto del jugador secreto";
    dom.secretPhoto.style.filter = "blur(" + calculateBlurValue() + "px)";
    dom.secretStatus.textContent =
      "La foto se va revelando con cada intento fallido.";
    dom.secretHints.innerHTML = "";
    return;
  }
  if (state.difficulty === "medio") {
    dom.secretPhotoBox.classList.add("secret-hidden");
    extraHints = buildMediumHints();
    hintHtml = renderHintList(extraHints);
    dom.secretHints.innerHTML = hintHtml;
    dom.secretStatus.textContent =
      "Las pistas adicionales aparecen a medida que se agotan intentos.";
    return;
  }
  dom.secretPhotoBox.classList.add("secret-hidden");
  dom.secretHints.innerHTML = "";
  dom.secretStatus.textContent =
    "Modo difícil: no hay pistas extra, solo el feedback de cada intento.";
}

function calculateBlurValue() {
  var blurValue;

  blurValue = 16 - state.guesses.length * 2;
  if (blurValue < 0) {
    blurValue = 0;
  }
  return blurValue;
}

function revealSecretPhoto() {
  if (!state.secretPlayer) {
    return;
  }
  dom.secretPhotoBox.classList.remove("secret-hidden");
  dom.secretPhoto.src = state.secretPlayer.photo;
  dom.secretPhoto.alt = "Foto del jugador secreto revelada";
  dom.secretPhoto.style.filter = "none";
}

function buildMediumHints() {
  var hints;

  hints = [];
  if (state.attemptsLeft <= 7) {
    hints.push("Overall aproximado: " + state.secretPlayer.overall);
  }
  if (state.attemptsLeft <= 5) {
    hints.push("Edad aproximada: " + state.secretPlayer.age);
  }
  if (state.attemptsLeft <= 3) {
    hints.push("Altura aproximada: " + state.secretPlayer.heightCm + " cm");
  }
  if (state.attemptsLeft <= 2) {
    hints.push("Pie preferido: " + state.secretPlayer.preferredFoot);
  }
  if (hints.length === 0) {
    hints.push("Cada intento suma una pista extra en este nivel.");
  }
  return hints;
}

function renderHintList(hints) {
  var html;
  var index;

  html = "";
  for (index = 0; index < hints.length; index += 1) {
    html += '<div class="hint-pill">' + escapeHtml(hints[index]) + "</div>";
  }
  return html;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function updateSecretPanel() {
  updateDifficultyStatus();
}

function playSound(soundUrl) {
  var audio;

  if (!soundUrl) {
    return;
  }
  try {
    audio = new Audio(soundUrl);
    audio.play().catch(function () {
      return;
    });
  } catch (error) {
    return;
  }
}

function finishGame(didWin) {
  var secretName;
  var resultLabel;

  state.gameFinished = true;
  stopTimer();
  revealSecretPhoto();
  state.score = didWin ? calculateScore() : 0;
  updateScoreDisplay();
  secretName = state.secretPlayer ? state.secretPlayer.name : "Desconocido";
  resultLabel = didWin ? "Victoria" : "Derrota";
  storeHistoryRecord(resultLabel, secretName, didWin);
  if (didWin) {
    playSound(SOUND_WIN_URL);
    showWinModal();
    return;
  }
  playSound(SOUND_LOSE_URL);
  showLoseModal();
}

function calculateScore() {
  var baseScore;
  var bonusScore;
  var attemptsPenalty;
  var totalScore;

  baseScore = getBaseScoreByDifficulty(state.difficulty);
  attemptsPenalty = Math.max(0, state.attemptsUsed - 1) * 10;
  bonusScore = getTimeBonus(state.timerSeconds);
  totalScore = baseScore - attemptsPenalty + bonusScore;
  if (totalScore < 10) {
    totalScore = 10;
  }
  return totalScore;
}

function getBaseScoreByDifficulty(difficultyValue) {
  if (difficultyValue === "medio") {
    return 80;
  }
  if (difficultyValue === "dificil") {
    return 100;
  }
  return 60;
}

function getTimeBonus(totalSeconds) {
  if (totalSeconds < 60) {
    return 20;
  }
  if (totalSeconds < 120) {
    return 10;
  }
  return 0;
}

function storeHistoryRecord(resultLabel, secretName, didWin) {
  var record;

  record = {
    playerName: state.playerName,
    result: resultLabel,
    attempts: state.attemptsUsed,
    duration: state.timerSeconds,
    dateTime: new Date().toISOString(),
    secretName: secretName,
    difficulty: getDifficultyLabel(state.difficulty),
    score: didWin ? state.score : 0,
  };
  state.history.unshift(record);
  saveHistoryToStorage();
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function showWinModal() {
  showModalMessage(
    "Ganaste",
    buildWinContent(),
    [
      { label: "Nueva partida", action: "restart-round" },
      { label: "Ver historial", action: "open-history" },
    ],
    true,
  );
}

function showLoseModal() {
  showModalMessage(
    "Perdiste",
    buildLoseContent(),
    [
      { label: "Nueva partida", action: "restart-round" },
      { label: "Ver historial", action: "open-history" },
    ],
    true,
  );
}

function buildWinContent() {
  var summaryHtml;

  summaryHtml =
    "<p>Adivinaste a " +
    escapeHtml(state.secretPlayer.name) +
    " en " +
    state.attemptsUsed +
    " intento(s).</p><p>Duración: " +
    formatSeconds(state.timerSeconds) +
    ".</p><p>Puntaje: " +
    state.score +
    ".</p>";
  return summaryHtml + buildSecretRevealHtml();
}

function buildLoseContent() {
  var summaryHtml;

  summaryHtml =
    "<p>Se terminó la partida. El jugador secreto era " +
    escapeHtml(state.secretPlayer.name) +
    ".</p><p>Duración: " +
    formatSeconds(state.timerSeconds) +
    ".</p><p>Puntaje: 0.</p>";
  return summaryHtml + buildSecretRevealHtml();
}

function buildSecretRevealHtml() {
  var player;
  var statsHtml;

  player = state.secretPlayer;
  if (!player) {
    return "";
  }
  statsHtml =
    buildRevealStatHtml("Nacionalidad", player.nationality, player.flag) +
    buildRevealStatHtml("Club", player.club, player.clubLogo) +
    buildRevealStatHtml("Posición", player.position) +
    buildRevealStatHtml("Edad", player.age) +
    buildRevealStatHtml("Overall", player.overall) +
    buildRevealStatHtml("Altura", player.heightCm + " cm") +
    buildRevealStatHtml("Pie preferido", player.preferredFoot);
  return (
    '<div class="secret-reveal">' +
    '<img class="secret-reveal-photo" src="' +
    player.photo +
    '" alt="Foto de ' +
    escapeHtml(player.name) +
    '" />' +
    '<div class="secret-reveal-info">' +
    '<h3 class="secret-reveal-name">' +
    escapeHtml(player.name) +
    "</h3>" +
    '<div class="secret-reveal-stats">' +
    statsHtml +
    "</div></div></div>"
  );
}

function buildRevealStatHtml(labelText, value, iconUrl) {
  var iconHtml;

  iconHtml = iconUrl
    ? '<img class="secret-reveal-icon" src="' + iconUrl + '" alt="" />'
    : "";
  return (
    '<div class="secret-reveal-stat">' +
    '<span class="secret-reveal-stat-label">' +
    escapeHtml(labelText) +
    "</span>" +
    '<span class="secret-reveal-stat-value">' +
    iconHtml +
    escapeHtml(String(value)) +
    "</span></div>"
  );
}

function showModalMessage(titleText, bodyText, actions, isHtml) {
  var actionButtons;
  var index;
  var contentHtml;

  contentHtml = bodyText;
  if (!isHtml) {
    contentHtml = "<p>" + bodyText.replace(/\n/g, "</p><p>") + "</p>";
  }
  dom.messageModalTitle.textContent = titleText;
  dom.messageModalBody.innerHTML = contentHtml;
  dom.messageModalActions.innerHTML = "";
  if (actions && actions.length > 0) {
    actionButtons = actions;
    for (index = 0; index < actionButtons.length; index += 1) {
      dom.messageModalActions.appendChild(
        createActionButton(
          actionButtons[index].label,
          actionButtons[index].action,
        ),
      );
    }
  }
  dom.messageModal.classList.remove("hidden");
  dom.messageModal.setAttribute("aria-hidden", "false");
  bindModalActionButtons();
}

function createActionButton(labelText, actionName) {
  var button;

  button = document.createElement("button");
  button.type = "button";
  button.className = "button button-primary";
  button.textContent = labelText;
  button.dataset.action = actionName;
  return button;
}

function bindModalActionButtons() {
  var buttons;
  var index;

  buttons = dom.messageModalActions.querySelectorAll("button");
  for (index = 0; index < buttons.length; index += 1) {
    buttons[index].onclick = handleModalActionClick;
  }
  buttons = dom.messageModalBody.querySelectorAll("button[data-action]");
  for (index = 0; index < buttons.length; index += 1) {
    buttons[index].onclick = handleModalActionClick;
  }
}

function handleModalActionClick(event) {
  var actionName;

  actionName = event.currentTarget.dataset.action;
  if (actionName === "restart-round") {
    hideMessageModal();
    resetRound();
    loadSecretForRound();
    return;
  }
  if (actionName === "open-history") {
    hideMessageModal();
    openHistoryModal();
    return;
  }
  if (actionName === "retry-secret") {
    hideMessageModal();
    loadSecretForRound();
    return;
  }
  if (actionName === "history-date") {
    state.historySort = "date";
    state.historyPage = 0;
    refreshHistoryModalBody();
    return;
  }
  if (actionName === "history-attempts") {
    state.historySort = "attempts";
    state.historyPage = 0;
    refreshHistoryModalBody();
    return;
  }
  if (actionName === "history-prev") {
    state.historyPage -= 1;
    refreshHistoryModalBody();
    return;
  }
  if (actionName === "history-next") {
    state.historyPage += 1;
    refreshHistoryModalBody();
    return;
  }
  hideMessageModal();
}

function hideMessageModal() {
  dom.messageModal.classList.add("hidden");
  dom.messageModal.setAttribute("aria-hidden", "true");
  dom.messageModalBody.innerHTML = "";
  dom.messageModalActions.innerHTML = "";
}

function openStartModal() {
  dom.startModal.classList.add("modal-visible");
  dom.startModal.classList.remove("hidden");
  dom.humanName.focus();
}

function hideStartModal() {
  dom.startModal.classList.remove("modal-visible");
  dom.startModal.classList.add("hidden");
}

function setFormEnabled(enabledValue) {
  dom.playerSearch.disabled = !enabledValue;
  dom.btnSubmitGuess.disabled = !enabledValue;
  dom.btnRestart.disabled = !enabledValue && !state.gameStarted;
}

function resetRound() {
  stopTimer();
  state.secretPlayer = null;
  state.guessedNames = {};
  state.guesses = [];
  state.attemptsUsed = 0;
  state.attemptsLeft = MAX_ATTEMPTS;
  state.gameStarted = false;
  state.gameFinished = false;
  state.timerSeconds = 0;
  state.score = 0;
  dom.playerSearch.value = "";
  renderSuggestionList([]);
  renderBoard();
  updateStaticLabels();
  updateDifficultyStatus();
  updateScoreDisplay();
}

function prepareNewRoundView() {
  resetBoardPlaceholder();
  dom.playerSearch.value = "";
  dom.contactFeedback.textContent = "";
  updateStaticLabels();
  updateDifficultyStatus();
  setFormEnabled(true);
  updateScoreDisplay();
}

function resetBoardPlaceholder() {
  dom.attemptsList.innerHTML = "";
  dom.emptyBoard.classList.remove("hidden");
  dom.attemptsList.appendChild(dom.emptyBoard);
}

function updateScoreDisplay() {
  dom.scoreLabel.textContent = String(state.score);
}

function getDifficultyLabel(difficultyValue) {
  if (difficultyValue === "medio") {
    return "Medio";
  }
  if (difficultyValue === "dificil") {
    return "Difícil";
  }
  return "Fácil";
}

function cleanPlayerName(nameValue) {
  return String(nameValue || "").replace(/^[0-9]+\s*/, "");
}

function normalizeName(value) {
  return trimValue(value).toLowerCase();
}

function comparePlayers(guessPlayer, secretPlayer) {
  var comparison;

  comparison = {
    isExactMatch: false,
    nationality:
      guessPlayer.nationality === secretPlayer.nationality ? "good" : "bad",
    club: guessPlayer.club === secretPlayer.club ? "good" : "bad",
    position: guessPlayer.position === secretPlayer.position ? "good" : "bad",
    age: compareNumeric(guessPlayer.age, secretPlayer.age),
    overall: compareNumeric(guessPlayer.overall, secretPlayer.overall),
    height: compareNumeric(guessPlayer.heightCm, secretPlayer.heightCm),
  };

  if (guessPlayer.id === secretPlayer.id) {
    comparison.isExactMatch = true;
  }

  return comparison;
}

function compareNumeric(guessValue, secretValue) {
  var gVal;
  var sVal;

  gVal = Number(guessValue);
  sVal = Number(secretValue);

  if (gVal === sVal) {
    return "good";
  }
  if (gVal < sVal) {
    return "high";
  }
  return "low";
}

function openHistoryModal() {
  state.historySort = "date";
  state.historyPage = 0;
  showModalMessage(
    "Historial de partidas",
    buildHistoryModalBody(),
    [
      { label: "Ordenar por fecha", action: "history-date" },
      { label: "Ordenar por intentos", action: "history-attempts" },
      { label: "Cerrar", action: "close-modal" },
    ],
    true,
  );
}

function getSortedHistory() {
  if (state.historySort === "attempts") {
    return sortHistoryByAttempts();
  }
  return sortHistoryByDate();
}

function buildHistoryModalBody() {
  var sortedHistory;
  var totalPages;
  var startIndex;
  var pageItems;
  var listHtml;

  sortedHistory = getSortedHistory();
  totalPages = Math.max(1, Math.ceil(sortedHistory.length / HISTORY_PAGE_SIZE));
  if (state.historyPage >= totalPages) {
    state.historyPage = totalPages - 1;
  }
  if (state.historyPage < 0) {
    state.historyPage = 0;
  }
  startIndex = state.historyPage * HISTORY_PAGE_SIZE;
  pageItems = sortedHistory.slice(startIndex, startIndex + HISTORY_PAGE_SIZE);
  listHtml = renderHistoryList(pageItems);
  return (
    '<div class="history-list">' +
    listHtml +
    "</div>" +
    buildHistoryPaginationHtml(
      state.historyPage,
      totalPages,
      sortedHistory.length,
    )
  );
}

function buildHistoryPaginationHtml(pageIndex, totalPages, totalItems) {
  if (totalItems === 0) {
    return "";
  }
  return (
    '<div class="history-pagination">' +
    '<button type="button" class="button button-secondary" data-action="history-prev"' +
    (pageIndex <= 0 ? " disabled" : "") +
    ">← Anterior</button>" +
    '<span class="history-page-indicator">Página ' +
    (pageIndex + 1) +
    " de " +
    totalPages +
    "</span>" +
    '<button type="button" class="button button-secondary" data-action="history-next"' +
    (pageIndex >= totalPages - 1 ? " disabled" : "") +
    ">Siguiente →</button>" +
    "</div>"
  );
}

function refreshHistoryModalBody() {
  dom.messageModalBody.innerHTML = buildHistoryModalBody();
  bindModalActionButtons();
}

function sortHistoryByDate() {
  var copy;

  copy = state.history.slice(0);
  copy.sort(function (firstItem, secondItem) {
    return (
      new Date(secondItem.dateTime).getTime() -
      new Date(firstItem.dateTime).getTime()
    );
  });
  return copy;
}

function sortHistoryByAttempts() {
  var copy;

  copy = state.history.slice(0);
  copy.sort(function (firstItem, secondItem) {
    return firstItem.attempts - secondItem.attempts;
  });
  return copy;
}

function renderHistoryList(historyList) {
  var output;
  var index;
  var item;

  output = "";
  if (historyList.length === 0) {
    return '<div class="history-item"><strong>No hay partidas guardadas todavía.</strong><span class="history-meta">Jugá una partida para registrar el resultado.</span></div>';
  }
  for (index = 0; index < historyList.length; index += 1) {
    item = historyList[index];
    output +=
      '<div class="history-item">' +
      "<strong>" +
      escapeHtml(item.playerName) +
      " - " +
      escapeHtml(item.result) +
      "</strong>" +
      '<span class="history-meta">Jugador: ' +
      escapeHtml(item.secretName) +
      " · Dificultad: " +
      escapeHtml(item.difficulty) +
      " · Intentos: " +
      item.attempts +
      " · Duración: " +
      formatSeconds(item.duration) +
      " · Puntaje: " +
      item.score +
      "</span>" +
      '<span class="history-meta">' +
      formatHistoryDate(item.dateTime) +
      "</span>" +
      "</div>";
  }
  return output;
}

function formatHistoryDate(dateValue) {
  var parsedDate;

  parsedDate = new Date(dateValue);
  return parsedDate.toLocaleString("es-AR");
}
