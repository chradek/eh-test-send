function runningAverage() {
  const data = {
    currentTotal: 0,
    currentCount: 0,
    currentAverage: 0
  };

  return {
    add(eventsPerMs) {
      data.currentTotal += eventsPerMs;
      data.currentCount++;
      data.currentAverage = data.currentTotal / data.currentCount;
    },
    print() {
      const averageEventsPerMs = data.currentAverage;
      const averageEventsPerSecond = (averageEventsPerMs * 1000).toFixed(2);
      console.log(`Average # of events per second: ${averageEventsPerSecond}`);
    }
  };
}

module.exports = {
  runningAverage
};