// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDT6QJyFjZhjrCd-7d00IxFSlWqOBp2xY8",
  authDomain: "poison-and-save.firebaseapp.com",
  projectId: "poison-and-save",
  storageBucket: "poison-and-save.firebasestorage.app",
  messagingSenderId: "475847800468",
  appId: "1:475847800468:web:93605c30c6c6c775e2a681",
  measurementId: "G-VR6WKKB1DV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let room = "";
let player = "";
let timerInt;
let time = 5;

// CREATE ROOM
function createRoom() {
  player = playerName.value;
  room = Math.random().toString(36).substr(2, 5);

  db.ref("rooms/" + room).set({
    players: { [player]: true }
  });

  startGame();
}

// JOIN ROOM
function joinRoom() {
  player = playerName.value;
  room = roomId.value;

  db.ref(`rooms/${room}/players/${player}`).set(true);
  startGame();
}

// START GAME
function startGame() {
  menu.style.display = "none";
  game.style.display = "block";
  roomTitle.innerText = "Room: " + room;

  db.ref(`rooms/${room}/players`).on("value", snap => {
    if (!snap.val()) return;
    players.innerText =
      "Players: " + Object.keys(snap.val()).join(", ");
  });

  startRound();
}

// ROUND START
function startRound() {
  result.innerText = "";
  choices.style.display = "block";
  time = 5;
  timer.innerText = "⏱️ " + time;

  timerInt = setInterval(() => {
    time--;
    timer.innerText = "⏱️ " + time;
    if (time === 0) {
      clearInterval(timerInt);
      choices.style.display = "none";
    }
  }, 1000);
}

// PLAYER CHOICE
function choose(type) {
  db.ref(`rooms/${room}/choices/${player}`).set(type);
  choices.style.display = "none";
}

// LISTEN FOR RESULT
db.ref("rooms").on("value", snap => {
  if (!room) return;
  const data = snap.val()?.[room];
  if (!data || !data.players) return;

  const pCount = Object.keys(data.players).length;
  const cCount = Object.keys(data.choices || {}).length;

  if (pCount > 1 && pCount === cCount) {
    reveal(data.choices);
  }
});

// REVEAL + VIRAL TWIST
function reveal(choicesData) {
  clearInterval(timerInt);

  const choices = Object.values(choicesData);
  const twist = Math.random();

  let message = "";

  if (twist < 0.2) {
    message = "🎭 FAKE POISON! Everyone survives!";
  } else if (choices.includes("poison")) {
    message = "☠️ POISON! Someone betrayed!";
  } else {
    message = "❤️ SAVED! Pure trust!";
  }

  result.innerText = message;

  setTimeout(() => {
    db.ref(`rooms/${room}/choices`).remove();
    startRound();
  }, 3500);
}
