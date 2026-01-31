import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, token } = body as { id?: string; token?: string };

  if (!id || !token) {
    return NextResponse.json(
      { success: false, error: "Missing id or token." },
      { status: 400 }
    );
  }

  try {
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("invites")
      .update({ published: true })
      .eq("id", id)
      .eq("creator_token", token)
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Invite not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server error." },
      { status: 500 }
    );
  }
}
