import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import{ generateText } from 'ai';

export async function POST(request: Request) {
  try {
    const { transcriptData, scriptData } = await request.json();

    const prompt = `Based on speaker's transcript and script, 
    generate 10 questions that can be asked after the presentation. 
    Generate more open-ended questions. For each question, provide 1-2 sentence, 
    giving tips to speaker on answering the question. Do not actually answer the question.
    Provide hints to guide speaker in shaping their answer. 
    Return the results in JSON format as an array of objects, 
    where each object has a "question" field and a "tips" field. 
    Do not include any additional text or formatting.
    Transcript: ${transcriptData}
    ${scriptData}`;

    console.log("prompt: ", prompt);

    const response = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    });
    // console.log("text:", response.text);
    const questionsWithTips = JSON.parse(response.text);

    console.log("questions:", questionsWithTips);
    return NextResponse.json({ questions: questionsWithTips });

  } catch (error) {
    console.error("Error fetching QnA:", error);
    return NextResponse.json({ error: "Failed to fetch QnA." }, { status: 500 });
  }
}
