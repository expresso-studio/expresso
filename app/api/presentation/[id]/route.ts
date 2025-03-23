import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user");
  const presentationId = params.id;

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
      `SELECT id, title, video_url, slides_url, transcript_url, created_at, user_id 
       FROM presentations 
       WHERE id = $1 AND user_id = $2`,
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
      `SELECT pm.metric_id, m.name, pm.score, pm.evaluated_at 
       FROM presentation_metrics pm
       JOIN metrics m ON pm.metric_id = m.id
       WHERE pm.presentation_id = $1`,
      [presentationId]
    );

    return NextResponse.json(
      {
        ...presentation,
        metrics: metricsResult.rows,
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
