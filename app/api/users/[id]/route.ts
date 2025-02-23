// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await query("DELETE FROM users WHERE id = $1", [params.id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
