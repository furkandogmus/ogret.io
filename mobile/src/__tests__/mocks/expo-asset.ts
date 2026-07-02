export const Asset = {
  fromModule: () => ({ localUri: "mock" }),
  fromURI: () => ({ localUri: "mock" }),
  loadAsync: () => Promise.resolve(),
};

export default { Asset };
