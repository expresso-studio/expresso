import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function POST(request: Request) {
  try {
    const { user, fillerWordCount, fillerWordsStats } = await request.json();

    if (!user) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    // TODO: KEVIN MODIFY QUERY HERE
    const result = await query(
      `INSERT INTO filler_stats (user_id, filler_word_count, filler_words_stats)
       VALUES ($1, $2, $3) RETURNING *`,
      [user, fillerWordCount, JSON.stringify(fillerWordsStats)]
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
