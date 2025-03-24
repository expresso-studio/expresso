import { query } from "@/lib/db";
import { PresentationMetrics } from "@/lib/constants";
import { randomUUID } from "crypto";

interface MetricInput {
  metricName: string;
  value: number;
}

export async function POST(request: Request) {
  try {
    const { presentationId, userId, metrics } = await request.json();

    console.log("debug flag: ", presentationId);

    // Validate input
    if (!presentationId || !userId || !metrics || !Array.isArray(metrics)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields or invalid format" }),
        { status: 400 }
      );
    }

    // Verify user has access to this presentation
    const presentationCheck = await query(
      `SELECT user_id FROM presentations WHERE id = $1`,
      [presentationId]
    );

    if (
      presentationCheck.rows.length === 0 ||
      presentationCheck.rows[0].user_id !== userId
    ) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access to presentation" }),
        { status: 403 }
      );
    }

    // Verify all metrics exist in the metrics table
    const metricNames = metrics.map(
      (m) => m.metricName.charAt(0).toUpperCase() + m.metricName.slice(1)
    );
    const metricsCheck = await query(
      `SELECT id, name FROM metrics WHERE name = ANY($1)`,
      [metricNames]
    );

    const metricIdMap = metricsCheck.rows.reduce(
      (acc: { [key: string]: number }, row) => {
        acc[row.name.toLowerCase()] = row.id;
        return acc;
      },
      {}
    );

    // Insert each metric
    const promises = metrics.map((metric: MetricInput) => {
      const metricId = metricIdMap[metric.metricName.toLowerCase()];

      if (!metricId) {
        console.warn(`Skipping invalid metric: ${metric.metricName}`);
        return null;
      }

      // Ensure value is between 0 and 100
      const normalizedValue = Math.min(100, Math.max(0, metric.value));

      return query(
        `INSERT INTO presentation_metrics (id, presentation_id, metric_id, score)
         VALUES ($1, $2, $3, $4)`,
        [randomUUID(), presentationId, metricId, normalizedValue]
      );
    });

    const results = await Promise.all(promises.filter(Boolean));

    if (results.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid metrics to insert" }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        metricsInserted: results.length,
      }),
      {
        status: 200,
      }
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
      }
    );
  }
}
