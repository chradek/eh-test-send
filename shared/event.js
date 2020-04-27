function getTestEvent() {
  return {
    body: `[${new Date().toISOString()}] This is a simple test`
  };
}

module.exports = {
  getTestEvent
};