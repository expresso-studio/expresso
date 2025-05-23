import { query } from "../../../lib/db";

/**
 * GET function that fetches all users from the database.
 * @returns {Promise<Response>} The response object.
 */
export async function GET() {
  try {
    const result = await query("SELECT * FROM users");
    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
