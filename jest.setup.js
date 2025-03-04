// import "@testing-library/jest-dom";
// import { server } from "./mocks/server";

// // start MSW mock server before tests
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

require("@testing-library/jest-dom"); 

const { server } = require("./mocks/server");

// Start MSW mock server before tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
