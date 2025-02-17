import "@testing-library/jest-dom";
import { server } from "./mocks/server";

// start MSW mock server before tests
beforeAll(() => server.listen());
afterEach(() => server.restHandlers());
afterAll(() => server.close());