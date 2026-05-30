const express = require("express");
const https = require("https");
const app = express();
app.use(express.json());
 
let inbox = [];
 
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
 
app.post("/email", (req, res) => {
  const email = req.body;
  email.id = email.id || Date.now().toString();
  const exists = inbox.find(e => e.id === email.id);
  if (!exists) {
    inbox.unshift(email);
    if (inbox.length > 50) inbox = inbox.slice(0, 50);
  }
  res.json({ ok: true });
});
 
app.get("/emails", (req, res) => {
  res.json(inbox);
});
 
app.delete("/email/:id", (req, res) => {
  inbox = inbox.filter(e => String(e.id) !== String(req.params.id));
  res.json({ ok: true });
});
 
app.post("/claude", (req, res) => {
  const { messages, system } = req.body;
  const body = JSON.stringify({
    model: "claude-sonnet-4-5",
    max_tokens: 1000,
    system,
    messages,
  });
 
  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Length": Buffer.byteLength(body),
    },
  };
 
  const request = https.request(options, (response) => {
    let data = "";
    response.on("data", chunk => data += chunk);
    response.on("end", () => res.json(JSON.parse(data)));
  });
 
  request.on("error", (e) => res.status(500).json({ error: e.message }));
  request.write(body);
  request.end();
});
 
app.get("/", (req, res) => res.send("OK"));
 
app.listen(process.env.PORT || 3000, () => console.log("Server running"));
 



