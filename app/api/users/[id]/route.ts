import { NextResponse, NextRequest } from "next/server";
import { query } from "../../../../lib/db";

/**
 * DELETE function that deletes a user with the given ID from the database.
 * @param {NextRequest} request - The Next.js request object.
 * @param {{ params: Promise<{ id: string }> }} - The parameters object containing the user ID.
 * @returns {Promise<NextResponse>} The Next.js response object.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = (await params).id;
    await query("DELETE FROM users WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
