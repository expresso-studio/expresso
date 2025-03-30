import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function POST(request: Request) {
  try {
    const { user, fillerWordCount, fillerWordsStats, maxWPM, minWPM, sessionWPM } = await request.json();

    if (!user) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO filler_stats (user_id, filler_word_count, filler_words_stats, max_wpm, min_wpm, session_wpm)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user, fillerWordCount, JSON.stringify(fillerWordsStats), maxWPM, minWPM, sessionWPM]
    );

    return NextResponse.json(result.rows[0], {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error inserting filler stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
