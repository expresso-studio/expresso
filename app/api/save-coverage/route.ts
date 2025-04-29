import { query } from "@/lib/db";
import { randomUUID } from "crypto";

const COVERAGE_METRIC_ID = 9;

/**
 * POST function that saves coverage data for a given presentation ID and user ID.
 * @param {Request} request - The request object.
 * @returns {Promise<Response>} The response object.
 */
export async function POST(request: Request) {
  try {
    const { presentationId, userId, score } = await request.json();

    console.log("debug flag: ", presentationId);

    // Validate input
    if (!presentationId || !userId || !score) {
      return new Response(
        JSON.stringify({ error: "Missing required fields or invalid format" }),
        { status: 400 },
      );
    }

    // Verify user has access to this presentation
    const presentationCheck = await query(
      `SELECT user_id FROM presentations WHERE id = $1`,
      [presentationId],
    );

    if (
      presentationCheck.rows.length === 0 ||
      presentationCheck.rows[0].user_id !== userId
    ) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access to presentation" }),
        { status: 403 },
      );
    }

    // Insert each metric
    await query(
        `INSERT INTO presentation_metrics (id, presentation_id, metric_id, score)
            VALUES ($1, $2, $3, $4)`,
        [randomUUID(), presentationId, COVERAGE_METRIC_ID, score],
    );

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    console.error("Error saving coverage:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to save coverage",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
      },
    );
  }
}
