const mqtt = require("mqtt");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

let latestBusData = {
  message: "Waiting for Raspberry Pi data..."
};

const MQTT_HOST = "0230d40549be4e6eb18cf925caf1eb48.s1.eu.hivemq.cloud";
const MQTT_PORT = 8883;
const MQTT_USERNAME = "bus_user";
const MQTT_PASSWORD = "Bus12345"; // خليه نفس باسورد HiveMQ بالظبط
const TOPIC = "alamein/bus/1/location";

const client = mqtt.connect({
  host: MQTT_HOST,
  port: MQTT_PORT,
  protocol: "mqtts",
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  reconnectPeriod: 2000,
});

client.on("connect", () => {
  console.log("Connected to HiveMQ Cloud");

  client.subscribe(TOPIC, (err) => {
    if (err) console.log("Subscribe error:", err);
    else console.log("Subscribed to", TOPIC);
  });
});

client.on("message", (topic, message) => {
  console.log("RAW MESSAGE:", topic, message.toString());

  try {
    latestBusData = JSON.parse(message.toString());
    console.log("Received:", latestBusData);
  } catch (err) {
    console.log("JSON Error:", err.message);
  }
});

client.on("error", (err) => {
  console.log("MQTT Error:", err.message);
});

app.get("/", (req, res) => {
  res.send("Smart Bus Backend is running");
});

app.get("/bus", (req, res) => {
  res.json(latestBusData);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});