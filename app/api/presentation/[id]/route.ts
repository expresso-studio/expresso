import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { MetricIds, MetricIdToName } from "@/lib/constants";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user");
  const presentationId = (await params).id;

  if (!presentationId) {
    return NextResponse.json(
      { error: "Presentation id is required" },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  try {
    // Get the presentation details
    const presentationResult = await query(
      `SELECT presentations.id AS presentation_id, presentations.title, presentations.video_url, 
              presentations.slides_url, presentations.transcript_url, presentations.created_at, 
              presentations.user_id, transcripts.transcript_text 
       FROM presentations 
       LEFT JOIN transcripts ON presentations.id = transcripts.presentation_id
       WHERE presentations.id = $1 AND presentations.user_id = $2`,
      [presentationId, userId]
    );

    if (presentationResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    const presentation = presentationResult.rows[0];

    // Verify the user has access to this presentation
    if (presentation.user_id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Get the metrics for this presentation
    const metricsResult = await query(
      `SELECT pm.metric_id, pm.score, pm.evaluated_at 
       FROM presentation_metrics pm
       WHERE pm.presentation_id = $1`,
      [presentationId]
    );

    // Map metric_ids to their names
    const metricsWithNames = metricsResult.rows.map((metric) => {
      const metric_name = MetricIdToName[metric.metric_id as MetricIds];
      return {
        ...metric,
        name: metric_name, // This will get the enum key name
      };
    });

    console.log("howdy :2");
    console.log(metricsWithNames);

    return NextResponse.json(
      {
        ...presentation,
        metrics: metricsWithNames,
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching presentation data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
