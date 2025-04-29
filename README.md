# Expresso

Expresso is a web application for practicing and improving public speaking skills. It provides a platform for users to record and evaluate their presentations, track their progress, and receive personalized recommendations for improvement.

Link to Deployed Website: https://expresso-ruddy.vercel.app/
[![GitHub deployments](https://img.shields.io/github/deployments/peicasey/expresso/production?style=flat-square&label=vercel%20deployment)](https://expresso-ruddy.vercel.app/)

## Getting Started

To get started with Expresso, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/expresso-studio/expresso.git
   ```

2. Install the dependencies:

   ```bash
   cd expresso
   npm install
   ```

3. Set up the environment variables:

   - Create a `.env.local` file in the root directory of the project.
   - Add the following environment variables to the `.env.local` file:

     ```bash
     AUTH0_SECRET=your-auth0-secret
     AUTH0_BASE_URL=http://localhost:3000
     AUTH0_ISSUER_BASE_URL=your-auth0-issuer-base-url
     AUTH0_CLIENT_ID=your-auth0-client-id
     AUTH0_CLIENT_SECRET=your-auth0-client-secret
     AUTH0_AUDIENCE=your-auth0-audience
     AWS_ACCESS_KEY_ID=your-aws-access-key-id
     AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
     AWS_REGION=your-aws-region
     AWS_BUCKET_NAME=your-aws-bucket-name
     DEEPGRAM_API_KEY=your-deepgram-api-key
     OPENAI_API_KEY=your-openai-api-key
     ```

     Replace the placeholder values with your actual credentials.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your web browser and navigate to `http://localhost:3000` to access the Expresso application.

## Project Structure

The project structure is organized as follows:

- `app/`: Contains the main application code.
  - `api/`: Contains API routes for handling various functionalities.
  - `dashboard/`: Contains the dashboard pages and components.
  - `components/`: Contains reusable UI components.
  - `context/`: Contains context providers for managing application state.
  - `hooks/`: Contains custom React hooks.
  - `lib/`: Contains utility functions and configuration files.
  - `pages/`: Contains the main pages of the application.
  - `public/`: Contains static assets like images and fonts.
- `__tests__/`: Contains unit tests for the application.
- `artifacts/`: Contains generated artifacts like charts and reports.
- `mocks/`: Contains mock data and server handlers for testing.
- `test-results/`: Contains test results and reports.

## Available Scripts

In the project directory, you can run the following scripts:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs the linter to check for code style issues.
- `npm run test`: Runs the unit tests.

## Dependencies

Expresso relies on the following main dependencies:

- Next.js: A React framework for building server-rendered applications.
- React: A JavaScript library for building user interfaces.
- TypeScript: A typed superset of JavaScript that compiles to plain JavaScript.
- Tailwind CSS: A utility-first CSS framework for rapidly building custom designs.
- Auth0: A platform for authentication and authorization.
- AWS SDK: A library for interacting with Amazon Web Services.
- Deepgram: A speech-to-text API for transcribing audio.
- OpenAI: An API for natural language processing and generation.

For a complete list of dependencies, refer to the `package.json` file.

## Contributing

Contributions to Expresso are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the GitHub repository.

## License

Expresso is open-source software licensed under the [MIT License](https://opensource.org/licenses/MIT).
