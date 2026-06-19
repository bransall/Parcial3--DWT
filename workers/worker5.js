self.addEventListener("message", (event) => {
  const message = event.data;

  if (!message || message.type !== "process") {
    return;
  }

  try {
    processRecords(message.payload);
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error.message
    });
  }
});

function processRecords(payload) {
  const temperatures = payload.temperatures;
  const humidities = payload.humidities;
  const pressures = payload.pressures;
  const totalRecords = payload.generatedCount || temperatures.length;
  const progressChunk = 5000;
  let validRecords = 0;
  let invalidRecords = 0;
  let temperatureSum = 0;
  let humiditySum = 0;
  let pressureSum = 0;
  const topTemperatures = [];
  const topPressures = [];

  for (let index = 0; index < totalRecords; index += 1) {
    const temperature = temperatures[index];
    const humidity = humidities[index];
    const pressure = pressures[index];

    if (temperature < 0 || humidity < 0 || pressure < 0) {
      invalidRecords += 1;
    } else {
      validRecords += 1;
      temperatureSum += temperature;
      humiditySum += humidity;
      pressureSum += pressure;
      addTopValue(topTemperatures, temperature);
      addTopValue(topPressures, pressure);
    }

    if (index > 0 && index % progressChunk === 0) {
      self.postMessage({
        type: "progress",
        percentage: Math.round((index / totalRecords) * 100)
      });
    }
  }

  self.postMessage({
    type: "complete",
    results: {
      generatedAt: new Date().toISOString(),
      generatedCount: totalRecords,
      validRecords,
      invalidRecords,
      averages: {
        temperature: roundToTwo(safeAverage(temperatureSum, validRecords)),
        humidity: roundToTwo(safeAverage(humiditySum, validRecords)),
        pressure: roundToTwo(safeAverage(pressureSum, validRecords))
      },
      overallAverage: roundToTwo(safeAverage(temperatureSum + humiditySum + pressureSum, validRecords * 3)),
      topTemperatures: topTemperatures.map(roundToTwo),
      topPressures: topPressures.map(roundToTwo)
    }
  });
}

function addTopValue(values, value) {
  if (values.length < 10) {
    values.push(value);
    values.sort(descending);
    return;
  }

  if (value > values[values.length - 1]) {
    values[values.length - 1] = value;
    values.sort(descending);
  }
}

function descending(first, second) {
  return second - first;
}

function safeAverage(sum, count) {
  return count > 0 ? sum / count : 0;
}

function roundToTwo(value) {
  return Math.round(value * 100) / 100;
}
