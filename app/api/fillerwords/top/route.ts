import { NextResponse, NextRequest } from "next/server";
import { query } from "../../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Aggregate filler word counts by iterating over the JSONB object.
    // The query uses jsonb_each to decompose the JSON object into key/value pairs,
    // then sums the counts for each filler word, orders them by total_count descending,
    // and limits the result to the top 10.
    const results = await query(
      `SELECT key AS filler_word, SUM((value)::int) AS total_count
       FROM filler_stats, jsonb_each(filler_words_stats)
       WHERE user_id = $1
       GROUP BY key
       ORDER BY total_count DESC
       LIMIT 10`,
      [userId] // parameterized query to prevent SQL injection
    );

    return NextResponse.json({ fillerWords: results.rows }, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching top filler words:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
