const mockAxiosInstance = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  request: jest.fn(() => Promise.resolve({ data: {} })),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  defaults: {
    baseURL: "http://10.0.2.2:8080/api/v1",
    headers: { "Content-Type": "application/json" },
  },
  create: jest.fn(() => mockAxiosInstance),
};

const mockAxios = Object.assign(
  jest.fn(() => Promise.resolve({ data: {} })),
  mockAxiosInstance
);

module.exports = mockAxios;
