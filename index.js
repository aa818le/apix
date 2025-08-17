import express from "express";
import bodyParser from "body-parser";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";

// 🔑 Firebase config — sen berganidan oldim
const firebaseConfig = {
  apiKey: "AIzaSyB1_XCbC777hKwxlilhMeq5Hpty1dvDT1I",
  authDomain: "giper-8fd92.firebaseapp.com",
  databaseURL: "https://giper-8fd92-default-rtdb.firebaseio.com",
  projectId: "giper-8fd92",
  storageBucket: "giper-8fd92.appspot.com",
  messagingSenderId: "485740337398",
  appId: "1:485740337398:web:demo1234567890", // muhim emas
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const app = express();
app.use(bodyParser.json());

// 🔐 Helper → APK kutilgan format (Base64 JSON)
function encodeResponse(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64");
}

// 📌 REGISTER
app.post("/api/register", async (req, res) => {
  const { username, password, country, currency } = req.body;

  if (!username || !password) {
    return res.send(encodeResponse({ status: false, msg: "Check entered data" }));
  }

  const userRef = ref(db, "users/" + username);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    return res.send(encodeResponse({ status: false, msg: "User exists" }));
  }

  await set(userRef, {
    username,
    password,
    country: country || "UZ",
    currency: currency || "USD",
    balance: 1000,
  });

  res.send(encodeResponse({ status: true, msg: "Registered" }));
});

// 📌 LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.send(encodeResponse({ status: false, msg: "Check entered data" }));
  }

  const snapshot = await get(child(ref(db), "users/" + username));
  if (!snapshot.exists()) {
    return res.send(encodeResponse({ status: false, msg: "User not found" }));
  }

  const user = snapshot.val();
  if (user.password !== password) {
    return res.send(encodeResponse({ status: false, msg: "Wrong password" }));
  }

  res.send(
    encodeResponse({
      status: true,
      msg: "Login ok",
      balance: user.balance,
      currency: user.currency,
      country: user.country,
    })
  );
});

// 📌 BALANCE
app.get("/api/balance", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.send(encodeResponse({ status: false, msg: "No username" }));
  }

  const snapshot = await get(child(ref(db), "users/" + username));
  if (!snapshot.exists()) {
    return res.send(encodeResponse({ status: false, msg: "User not found" }));
  }

  const user = snapshot.val();
  res.send(encodeResponse({ status: true, balance: user.balance }));
});

// 📌 LOGOUT (dummy)
app.post("/api/logout", (req, res) => {
  res.send(encodeResponse({ status: true, msg: "Logged out" }));
});

// 📌 REFRESH (dummy)
app.post("/api/refresh", (req, res) => {
  res.send(encodeResponse({ status: true, token: "newToken123" }));
});

// 📌 TRANSACTIONS (mock)
app.get("/api/transactions", (req, res) => {
  res.send(
    encodeResponse({
      status: true,
      data: [
        { id: 1, type: "deposit", amount: 200 },
        { id: 2, type: "bet", amount: -50 },
      ],
    })
  );
});

// 📌 MESSAGES (mock)
app.get("/api/messages", (req, res) => {
  res.send(
    encodeResponse({
      status: true,
      data: [
        { id: 1, msg: "Xush kelibsiz!" },
        { id: 2, msg: "Hisobingizga bonus qo‘shildi." },
      ],
    })
  );
});

// 📌 DELETE MESSAGE (mock)
app.post("/api/delmessage", (req, res) => {
  res.send(encodeResponse({ status: true, msg: "Deleted" }));
});

// 🚀 Server run
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
  
