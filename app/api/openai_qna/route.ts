import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import{ generateText } from 'ai';

export async function GET() {
  try {
    const response = await generateText({
      model: openai("gpt-4o"),
      prompt: "Generate 10 questions that can be asked after a presentation about pandas. Return them as a single line of comma-separated, double-quoted questions. Do not include any additional text, explanations, or formatting.",
    });
    // console.log("text:", response.text);
    const questions  = response.text.replace(/^"|"$/g, '').split(', ');
    // console.log("questions:", questions);
    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch QnA." }, { status: 500 });
  }
}
