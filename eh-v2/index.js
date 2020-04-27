const {EventHubClient} = require("@azure/event-hubs");
const {getTestEvent} = require("../shared/event");
const {runningAverage} = require("../shared/running-average");

const connectionString = process.env["connection_string"];
const batchSize = parseInt(process.env["batch_size"], 10) || 11000;
const runTimeInMinutes = parseInt(process.env["run_time"], 10) || 10;

let totalEventsSent = 0;

const client = EventHubClient.createFromConnectionString(connectionString);

const sendEventsRate = runningAverage();

async function fillBatch(messageCount) {
  const events = [];
  for (let i = 0; i < messageCount; i++) {
    const event = getTestEvent();
    events.push(event);
  }
  return events;
}

async function sendEvents(recordRate) {
  const batch = await fillBatch(batchSize);

  const startTime = Date.now();
  try {
    await client.sendBatch(batch);
    const endTime = Date.now();
    if (recordRate) {
      sendEventsRate.add(batch.length / (endTime - startTime));
    }
    totalEventsSent += batch.length;
  } catch (err) {
    console.error(`Received an error while sending ${batch.length} events: ${err.message}`);
  }
}

async function run() {
  const runningTime = 60000 * runTimeInMinutes;

  const startTime = Date.now();
  let currentTime = startTime;
  let invocationCount = 0;
  while ((currentTime - startTime) < runningTime) {
    await sendEvents(Boolean(invocationCount));
    invocationCount++;
    const now = Date.now();
    console.log(`Time for this interval: ${((now - currentTime) / 1000).toFixed(2)} seconds.`)
    currentTime = Date.now();
  }

  await client.close();
  clearInterval(tid);
  sendEventsRate.print();
  console.log(`Total events sent: ${totalEventsSent}`);
  console.log(`Completed.`);
}

run();

const tid = setInterval(() => {
  sendEventsRate.print();
}, 20000);