const {EventHubProducerClient} = require("@azure/event-hubs");
const {getTestEvent} = require("../shared/event");
const {runningAverage} = require("../shared/running-average");

const connectionString = process.env["connection_string"];
const batchSize = parseInt(process.env["batch_size"], 10) || 11000;

const client = new EventHubProducerClient(connectionString);

const sendEventsRate = runningAverage();

async function fillBatch(messageCount) {
  const batch = await client.createBatch()
  for (let i = 0; i < messageCount; i++) {
    const event = getTestEvent();
    if (!batch.tryAdd(event)) {
      console.error(`Failed to add event ${i + 1}`);
      break;
    }
  }
  return batch;
}

async function sendEvents(recordRate) {
  const batch = await fillBatch(batchSize);

  const startTime = Date.now();
  try {
    await client.sendBatch(batch);
    const endTime = Date.now();
    if (recordRate) {
      sendEventsRate.add(batch.count / (endTime - startTime));
    }
  } catch (err) {
    console.error(`Received an error while sending ${batch.count} events: ${err.message}`);
  }
}

async function run() {
  const tenMinutes = 600000;

  const startTime = Date.now();
  let currentTime = startTime;
  let invocationCount = 0;
  while ((currentTime - startTime) < tenMinutes) {
    console.log(`${currentTime}, ${startTime}, ${currentTime - startTime}`)
    await sendEvents(Boolean(invocationCount));
    invocationCount++;
    currentTime = Date.now();
  }

  await client.close();
  clearInterval(tid);
  sendEventsRate.print();
  console.log(`Completed.`);
}

run();

const tid = setInterval(() => {
  sendEventsRate.print();
}, 20000);