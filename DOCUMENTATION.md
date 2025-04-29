# Expresso Documentation

## Design Documentation

### Project Overview

Expresso is a web application for practicing and improving public speaking skills. It provides a platform for users to record and evaluate their presentations, track their progress, and receive personalized recommendations for improvement. The application uses AI-powered analysis to provide feedback on various aspects of public speaking, including hand movements, body language, posture, eye contact, and speech patterns.

### Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Express
- **Authentication**: Auth0
- **Database**: PostgreSQL
- **Storage**: AWS S3
- **Speech-to-Text**: Deepgram API
- **AI Analysis**: OpenAI API
- **Pose Detection**: TensorFlow.js with MediaPipe

### File Structure Overview

The application follows a standard Next.js project structure with some additional directories for organization:

- **app/**: Contains the main application code using Next.js App Router.
  - **api/**: Contains API routes for handling various functionalities.
    - **complete-lesson/**: Handles lesson completion.
    - **course/**: Manages course-related functionalities, including lessons and progress tracking.
    - **fillerwords/**: Manages filler words and related functionalities.
    - **get-qna-info/**: Retrieves Q&A information.
    - **get-signed-url/**: Generates signed URLs for secure access.
    - **get-transcripts/**: Retrieves transcripts.
    - **openai_coverage/**: Handles OpenAI coverage functionalities.
    - **openai_qna/**: Manages OpenAI Q&A functionalities.
    - **presentation/**: Manages presentation-related functionalities.
    - **report/**: Generates reports.
    - **save-coverage/**: Saves coverage data.
    - **save-script/**: Saves scripts.
    - **sign-s3/**: Handles S3 signing requests.
    - **tone-analyzer/**: Analyzes tone in text.
    - **upload-transcript/**: Uploads transcripts.
    - **users/**: Manages user-related functionalities.
  - **dashboard/**: Contains components and pages related to the dashboard.
    - **(home)/**: Home-related components and pages.
    - **evaluate/**: Components for evaluation functionalities.
    - **learning/**: Components for learning functionalities.
    - **progress/**: Components for tracking progress.
    - **qna/**: Components for Q&A functionalities.
    - **transcripts/**: Components for managing transcripts.
    - **user/**: User account management components.
  - **globals.css**: Global styles for the application.
  - **layout.tsx**: Main layout component for the application.
  - **page.tsx**: Main entry point for the application.
  - **auth0-provider.tsx**: Handles authentication with Auth0.

- **components/**: Contains reusable UI components.
  - **ui/**: Contains base UI components (buttons, inputs, etc.).
  - Other components for specific functionalities.

- **context/**: Contains React context providers.
  - **ScriptContext.tsx**: Provides script-related context.

- **hooks/**: Contains custom React hooks.
  - **use-mobile.tsx**: Hook for detecting mobile devices.
  - **useAuthUtils.tsx**: Hook for authentication utilities.

- **lib/**: Contains utility functions and configuration files.
  - **aws/**: AWS-related utilities.
  - **config.ts**: Application configuration.
  - **constants.ts**: Application constants.
  - **db.ts**: Database utilities.
  - **types.ts**: TypeScript type definitions.
  - **utils.ts**: General utility functions.

- **public/**: Contains static assets.

- **__tests__/**: Contains unit tests.

### Component Hierarchy

The application follows a hierarchical component structure:

1. **Root Layout** (`app/layout.tsx`)
   - Provides theme context, authentication context, and script context
   - Renders the main layout structure

2. **Landing Page** (`app/page.tsx`)
   - Displays the landing page with login button
   - Redirects authenticated users to the dashboard

3. **Dashboard Layout** (`app/dashboard/layout.tsx`)
   - Provides the sidebar layout for authenticated pages
   - Contains the main navigation

4. **Main Navigation** (`components/nav-main.tsx`)
   - Provides navigation to different sections of the application:
     - Dashboard
     - Evaluate
     - Progress
     - Learning

5. **User Navigation** (`components/nav-user.tsx`)
   - Provides user-related navigation:
     - Speaker profile
     - Settings
     - Account
     - Logout

6. **Evaluation Page** (`app/dashboard/evaluate/page.tsx`)
   - Contains components for recording and evaluating presentations:
     - GestureAnalyzer: Analyzes gestures using pose detection
     - TranscriptionComponent: Transcribes speech in real-time

7. **Learning Page** (`app/dashboard/learning/page.tsx`)
   - Displays courses and recommendations:
     - CourseList: Lists available courses
     - Recommendations: Provides personalized recommendations

8. **Progress Page** (`app/dashboard/progress/page.tsx`)
   - Displays progress metrics:
     - WPMChart: Charts words per minute over time
     - TopFiller: Shows top filler words
     - Summary: Provides a summary of progress

### Data Flow

1. **Authentication Flow**:
   - User logs in using Auth0
   - Auth0 provides user information and tokens
   - Application stores tokens and user information
   - Protected routes check for authentication

2. **Evaluation Flow**:
   - User starts recording
   - Video is captured and analyzed for gestures using TensorFlow.js and MediaPipe
   - Audio is captured and sent to Deepgram API for transcription
   - Transcription is analyzed for filler words and speaking rate
   - Analysis results are displayed in real-time
   - When recording stops, a comprehensive report is generated

3. **Learning Flow**:
   - User's performance metrics are analyzed
   - Personalized course recommendations are generated
   - User can browse and complete courses
   - Course progress is tracked and stored

4. **Progress Tracking Flow**:
   - User's performance metrics are stored in the database
   - Progress charts and summaries are generated from stored data
   - User can view progress over time

### Key Features

1. **Real-time Gesture Analysis**:
   - Analyzes hand movements, head movements, body movements, posture, hand symmetry, gesture variety, and eye contact
   - Provides real-time feedback during recording
   - Generates a comprehensive report after recording

2. **Speech Transcription and Analysis**:
   - Transcribes speech in real-time
   - Identifies filler words
   - Calculates speaking rate (words per minute)

3. **Personalized Learning**:
   - Provides courses on different aspects of public speaking
   - Tracks course progress
   - Generates personalized recommendations based on performance

4. **Progress Tracking**:
   - Tracks performance metrics over time
   - Displays progress charts and summaries
   - Shows previous presentations

## API Specification

### Authentication

All API routes except for public routes require authentication. Authentication is handled by Auth0.

### Available API Routes

#### User Management

- **GET /api/users**: Retrieves all users.
  - Response: Array of user objects.

- **GET /api/users/[id]**: Retrieves a specific user by ID.
  - Parameters: `id` - The user ID.
  - Response: User object.

- **POST /api/users**: Creates a new user.
  - Request Body: User object.
  - Response: Created user object.

- **PUT /api/users/[id]**: Updates a specific user.
  - Parameters: `id` - The user ID.
  - Request Body: Updated user object.
  - Response: Updated user object.

- **GET /api/users/sync**: Synchronizes user data.
  - Response: Synchronization status.

#### Course Management

- **GET /api/course/lessons**: Retrieves all lessons for a course.
  - Query Parameters: `courseId` - The course ID.
  - Response: Array of lesson objects.

- **GET /api/course/lessons-left**: Retrieves lessons left for a user in a course.
  - Query Parameters: `userId` - The user ID, `courseId` - The course ID.
  - Response: Array of lesson objects.

- **GET /api/course/progress**: Retrieves course progress for a user.
  - Query Parameters: `userId` - The user ID, `courseId` - The course ID.
  - Response: Progress object with percentage.

#### Lesson Management

- **POST /api/complete-lesson**: Marks a lesson as completed.
  - Request Body: `userId` - The user ID, `lessonId` - The lesson ID.
  - Response: Completion status.

#### Presentation Management

- **GET /api/presentation/[id]**: Retrieves a specific presentation.
  - Parameters: `id` - The presentation ID.
  - Response: Presentation object.

- **GET /api/presentation/metrics**: Retrieves metrics for a presentation.
  - Query Parameters: `presentationId` - The presentation ID.
  - Response: Array of metric objects.

#### Transcription Management

- **POST /api/get-transcripts**: Retrieves transcripts for a user.
  - Request Body: `userId` - The user ID.
  - Response: Array of transcript objects.

- **POST /api/upload-transcript**: Uploads a transcript.
  - Request Body: `userId` - The user ID, `transcript` - The transcript text.
  - Response: Upload status.

#### Filler Word Analysis

- **GET /api/fillerwords**: Retrieves filler word analysis.
  - Query Parameters: `userId` - The user ID.
  - Response: Filler word analysis object.

- **GET /api/fillerwords/top**: Retrieves top filler words for a user.
  - Query Parameters: `userId` - The user ID.
  - Response: Array of top filler words.

- **GET /api/fillerwords/wpm**: Retrieves words per minute for a user.
  - Query Parameters: `userId` - The user ID.
  - Response: WPM object.

#### Report Generation

- **GET /api/report**: Retrieves reports for a user.
  - Query Parameters: `user` - The user ID.
  - Response: Array of report objects.

#### File Management

- **POST /api/get-signed-url**: Generates a signed URL for file access.
  - Request Body: `key` - The file key.
  - Response: Signed URL.

- **POST /api/sign-s3**: Signs an S3 request.
  - Request Body: `fileName` - The file name, `fileType` - The file type.
  - Response: Signed request and URL.

#### Script Management

- **POST /api/save-script**: Saves a script.
  - Request Body: `userId` - The user ID, `script` - The script text.
  - Response: Save status.

#### Coverage Management

- **POST /api/save-coverage**: Saves coverage data.
  - Request Body: `userId` - The user ID, `coverage` - The coverage data.
  - Response: Save status.

- **GET /api/openai_coverage**: Retrieves OpenAI coverage.
  - Query Parameters: `userId` - The user ID.
  - Response: Coverage object.

#### Q&A Management

- **GET /api/get-qna-info**: Retrieves Q&A information.
  - Query Parameters: `userId` - The user ID.
  - Response: Q&A information object.

- **POST /api/openai_qna**: Processes Q&A with OpenAI.
  - Request Body: `userId` - The user ID, `question` - The question, `answer` - The answer.
  - Response: Processing status.

#### Tone Analysis

- **POST /api/tone-analyzer**: Analyzes tone in text.
  - Request Body: `text` - The text to analyze.
  - Response: Tone analysis object.

### Error Handling

API routes return appropriate HTTP status codes and error messages:

- **200 OK**: Request successful.
- **201 Created**: Resource created successfully.
- **400 Bad Request**: Invalid request parameters.
- **401 Unauthorized**: Authentication required.
- **403 Forbidden**: Insufficient permissions.
- **404 Not Found**: Resource not found.
- **500 Internal Server Error**: Server error.

### Data Models

#### User

```typescript
{
  id: string;
  email: string;
  name: string;
  created_at: string;
}
```

#### Course

```typescript
{
  id: number;
  icon: IconType;
  color: string;
  name: CourseNames;
  topics: (string | MetricDisplayNames)[];
  lessons: LessonType[];
}
```

#### Lesson

```typescript
{
  id: number;
  icon: IconType;
  name: LessonNames;
  topics: (string | MetricDisplayNames)[];
}
```

#### Metric

```typescript
{
  metric_id: MetricIds;
  name: MetricNames;
  score: number;
  evaluated_at: string;
}
```

#### Presentation

```typescript
{
  id: string;
  title: string;
  video_url: string;
  created_at: string;
  metrics: MetricType[];
}
```

#### Report

```typescript
{
  presentation_id: string;
  title: string;
  video_url: string;
  created_at: string;
  metrics: MetricType[];
}
```

#### FillerStats

```typescript
{
  fillerWordCount: number;
  fillerWordsStats: { [word: string]: number };
  maxWPM: number | null;
  minWPM: number | null;
  sessionWPM: number;
}
```

#### GestureMetrics

```typescript
{
  HandMovement: number;
  HeadMovement: number;
  BodyMovement: number;
  Posture: number;
  HandSymmetry: number;
  GestureVariety: number;
  EyeContact: number;
  OverallScore: number;
}
```

## README -- How to Use the Code

### Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/expresso-studio/expresso.git
   ```

2. Install dependencies:
   ```bash
   cd expresso
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add the required environment variables:
     ```
     AUTH0_SECRET=your-auth0-secret
     AUTH0_BASE_URL=http://localhost:3000
     AUTH0_ISSUER_BASE_URL=your-auth0-issuer-base-url
     AUTH0_CLIENT_ID=your-auth0-client-id
     AUTH0_CLIENT_SECRET=your-auth0-client-secret
     AUTH0_AUDIENCE=your-auth0-audience
     AWS_ACCESS_KEY_ID=your-aws-access-key-id
     AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
     AWS_REGION=your-aws-region
     S3_BUCKET_NAME=your-aws-bucket-name
     DATABASE_URL=your-database-url
     DEEPGRAM_API_KEY=your-deepgram-api-key
     OPENAI_API_KEY=your-openai-api-key
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Development Workflow

1. **Authentication**: The application uses Auth0 for authentication. Users need to log in to access the dashboard and other features.

2. **Dashboard**: After logging in, users are redirected to the dashboard, which provides an overview of their progress and recent activities.

3. **Evaluation**: Users can record and evaluate their presentations using the Evaluate feature. The application analyzes gestures and speech in real-time and provides feedback.

4. **Learning**: Users can access courses and lessons on different aspects of public speaking. The application tracks their progress and provides personalized recommendations.

5. **Progress**: Users can track their progress over time, view previous presentations, and see improvement in different metrics.

### Extending the Application

1. **Adding New Metrics**: To add a new metric for evaluation:
   - Add the metric to the `MetricNames`, `MetricDisplayNames`, and `MetricIds` enums in `lib/constants.ts`
   - Add the metric to the `GestureMetrics` interface in `lib/types.ts`
   - Implement the metric calculation in the gesture analysis component

2. **Adding New Courses**: To add a new course:
   - Add the course name to the `CourseNames` enum in `lib/constants.ts`
   - Add the course link to the `CourseLinks` enum in `lib/constants.ts`
   - Add the course to the `Courses` array in `lib/constants.ts`

3. **Adding New API Routes**: To add a new API route:
   - Create a new file in the appropriate directory under `app/api/`
   - Implement the route handler
   - Update the API documentation

### Testing

The application includes unit tests using Jest and React Testing Library. To run the tests:

```bash
npm run test
```

To run tests in watch mode:

```bash
npm run test:watch
```

### Deployment

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

The application can be deployed to various platforms, including Vercel, Netlify, or any platform that supports Next.js applications.
