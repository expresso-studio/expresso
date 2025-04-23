import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { PresentationType } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user");

  if (!userId) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  try {
    // Get all presentations for the user
    const presentationsResult = await query(
      "SELECT id, title, video_url, created_at FROM presentations WHERE user_id = $1",
      [userId],
    );
    const presentations = presentationsResult.rows;

    // For each presentation, get its metrics by joining the presentation_metrics and metrics tables
    const reports = await Promise.all(
      presentations.map(async (presentation: PresentationType) => {
        const metricsResult = await query(
          `SELECT pm.metric_id, m.name, pm.score, pm.evaluated_at 
           FROM presentation_metrics pm
           JOIN metrics m ON pm.metric_id = m.id
           WHERE pm.presentation_id = $1`,
          [presentation.id],
        );

        return {
          presentation_id: presentation.id,
          title: presentation.title,
          video_url: presentation.video_url,
          created_at: presentation.created_at,
          metrics: metricsResult.rows,
        };
      }),
    );

    return NextResponse.json(reports, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
