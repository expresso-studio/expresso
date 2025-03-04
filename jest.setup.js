import "@testing-library/jest-dom";
import '@testing-library/jest-dom/extend-expect';
// import { setupServer } from 'msw/node'
// import { handlers } from "./mocks/handlers"; // Import your request handlers

// import fetch, { Headers, Request, Response } from "node-fetch";

// global.fetch = fetch;
// global.Headers = Headers;
// global.Request = Request;
// global.Response = Response;

// // Set up the mock server
// const server = setupServer(...handlers);

// global.window.matchMedia = global.window.matchMedia || (() => ({
//     matches: false,
//     media: "",
//     onchange: null,
//     addListener: jest.fn(),
//     removeListener: jest.fn(),
//     addEventListener: jest.fn(),
//     removeEventListener: jest.fn(),
//     dispatchEvent: jest.fn(),
// }));

// // Start MSW mock server before tests
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());