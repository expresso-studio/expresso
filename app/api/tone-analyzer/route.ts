import { NextRequest, NextResponse } from 'next/server';
import NaturalLanguageUnderstandingV1 from 'ibm-watson/natural-language-understanding/v1.js';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';

// Ensure environment variables are loaded
const apiKey = process.env.IBM_WATSON_API_KEY;
const serviceUrl = process.env.IBM_WATSON_URL;

if (!apiKey || !serviceUrl) {
  console.error('Missing IBM Watson API Key or Service URL in environment variables.');
  // Optionally, throw an error during build/startup if preferred
}

// Initialize Watson NLU client
const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2022-04-07', // Use the latest appropriate version
  authenticator: new IamAuthenticator({
    apikey: apiKey || '', // Provide a default empty string if undefined, though checks should prevent this
  }),
  serviceUrl: serviceUrl || '', // Provide a default empty string
});

export async function POST(request: NextRequest) {
  if (!apiKey || !serviceUrl) {
    return NextResponse.json({ error: 'IBM Watson service not configured.' }, { status: 500 });
  }

  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid input: text is required and must be a string.' }, { status: 400 });
    }

    const analyzeParams = {
      text: text,
      features: {
        // Note: Tone Analyzer is deprecated. Using NLU's Emotion feature as a replacement.
        // If you specifically need the old Tone Analyzer categories, this needs adjustment.
        // Common replacements include Emotion and Sentiment analysis.
        emotion: {}, // Analyze for joy, sadness, anger, fear, disgust
        sentiment: {} // Uncomment to analyze overall sentiment (positive/negative)
      },
    };

    const analysisResults = await naturalLanguageUnderstanding.analyze(analyzeParams);

    // Extract relevant emotion data
    const emotionResult = analysisResults.result.emotion?.document?.emotion;
    const sentimentResult = analysisResults.result.sentiment?.document?.score;

    return NextResponse.json({ emotion: emotionResult, sentiment: sentimentResult }, { status: 200 });

  } catch (error: any) {
    console.error('Error analyzing tone with IBM Watson:', error);
    // Provide a more specific error message if possible
    const errorMessage = error.message || 'Failed to analyze tone.';
    const statusCode = error.status || 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
