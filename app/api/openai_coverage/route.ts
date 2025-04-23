import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(request: Request) {
  try {
    const { transcriptData, scriptData } = await request.json();

    const prompt = `Given script and transcript of the actual presentation, 
    score how much of the script the speaker covered. 
    Focus on comparing main ideas and don't consider the filler words. 
    Return a number from 1-100, with 100 being perfect coverage and 1 being low coverage. 
    If script is empty, then return -1. 
    Do not include any additional text or formatting.\n
    ${scriptData}\n
    Transcript: ${transcriptData}`;

    console.log("prompt: ", prompt);

    const response = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    });
    // console.log("text:", response.text);
    const score = JSON.parse(response.text);

    console.log("score:", score);
    return NextResponse.json({ score: score });
  } catch (error) {
    console.error("Error fetching coverage score:", error);
    return NextResponse.json(
      { error: "Failed to fetch coverage score." },
      { status: 500 },
    );
  }
}
