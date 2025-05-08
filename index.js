const express = require("express");
const Datastore = require("nedb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

const database = new Datastore("database.db");
database.loadDatabase();

app.get("/api", (request, response) => {
  database.find({}, (err, data) => {
    if (err) {
      response.end();
      return;
    }
    response.json(data);
  });
});

app.post("/api", (request, response) => {
  const data = request.body;
  const timestamp = Date.now();
  data.timestamp = timestamp;
  database.insert(data);
  response.json(data);
});

app.get("/weather/:latlon", async (request, response) => {
  console.log(request.params);
  const latlon = request.params.latlon.split(",");
  const lat = latlon[0];
  const lon = latlon[1];
  console.log(lat, lon);

  const weather_api_key = process.env.weather_api_key;
  const aq_api_key = process.env.aq_api_key;

  const weather_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weather_api_key}`;
  const aq_url = `https://api.openaq.org/v3/measurements?coordinates=${lat},${lon}`;

  try {
    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));

    // Fetch weather
    const weather_response = await fetch(weather_url);
    const weather_data = await weather_response.json();

    // Fetch air quality
    const aq_response = await fetch(aq_url, {
      method: "GET",
      headers: {
        "X-API-Key": aq_api_key,
      },
    });
    const aq_data = await aq_response.json();
    console.log("Air Quality API raw response:", aq_data);

    const data = {
      weather: weather_data,
      air_quality: aq_data,
    };
    response.json(data);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Something went wrong fetching APIs" });
  }
});
