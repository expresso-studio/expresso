import { query } from "@/lib/db";
import { MetricNameToId } from "@/lib/constants";
import { MetricInput } from "@/lib/types";
import { randomUUID } from "crypto";

/**
 * POST function that saves metrics for a given presentation ID and user ID.
 * @param {Request} request - The request object.
 * @returns {Promise<Response>} The response object.
 */
export async function POST(request: Request) {
  try {
    const { presentationId, userId, metrics } = await request.json();

    console.log("debug flag: ", presentationId);

    // Validate input
    if (!presentationId || !userId || !metrics || !Array.isArray(metrics)) {
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
    const promises = metrics.map((metric: MetricInput) => {
      const metricId = MetricNameToId[metric.name];

      if (!metricId) {
        console.warn(`Skipping invalid metric: ${metric.name}`);
        return null;
      }

      return query(
        `INSERT INTO presentation_metrics (id, presentation_id, metric_id, score)
         VALUES ($1, $2, $3, $4)`,
        [randomUUID(), presentationId, metricId, metric.value],
      );
    });

    const results = await Promise.all(promises.filter(Boolean));

    if (results.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid metrics to insert" }),
        { status: 400 },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        metricsInserted: results.length,
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error saving metrics:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to save metrics",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
      },
    );
  }
}
