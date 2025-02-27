import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const { sub, email, name } = await request.json();
    console.log(sub);
    // Check if the user already exists
    const existingUser = await query(
      "SELECT * FROM expresso_users WHERE id = $1",
      [sub]
    );
    if (existingUser.rows.length === 0) {
      // Create new user record

      await query(
        "INSERT INTO expresso_users (id, email, name) VALUES ($1, $2, $3)",
        [sub, email, name]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
