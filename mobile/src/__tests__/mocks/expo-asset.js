module.exports = {
  Asset: {
    fromModule: function () {
      return { localUri: "mock" };
    },
    fromURI: function () {
      return { localUri: "mock" };
    },
    loadAsync: function () {
      return Promise.resolve();
    },
  },
};
