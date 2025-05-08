const mymap = L.map("checkinMap").setView([0, 0], 1);
const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = "https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png";
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);

getData();

async function getData() {
  const response = await fetch("/api");
  const data = await response.json();

  for (const item of data) {
    const marker = L.marker([item.lat, item.lon]).addTo(mymap);

    // Extract weather values from new OpenWeatherMap structure
    const description = item.weather?.weather?.[0]?.description || "Unknown";
    const temperature = item.weather?.main?.temp ?? "Unknown";

    let txt = `The weather here at ${item.lat.toFixed(2)}&deg;,
    ${item.lon.toFixed(2)}&deg; is ${description} with
    a temperature of ${temperature}&deg; C.`;

    // Extract air quality safely
    if (!item.air || item.air.value < 0) {
      txt += " No air quality reading.";
    } else {
      txt += ` The concentration of particulate matter 
      (${item.air.parameter}) is ${item.air.value} 
      ${item.air.unit}, last read on ${item.air.lastUpdated}`;
    }

    marker.bindPopup(txt);
  }

  console.log(data);
}
