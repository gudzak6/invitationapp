import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  if (!id || !token) {
    return NextResponse.json(
      { invite: null, error: "Missing id or token." },
      { status: 400 }
    );
  }

  try {
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("invites")
      .select(
        "id,title,date,time,location,message,game_type,game_config,published,created_at"
      )
      .eq("id", id)
      .eq("creator_token", token)
      .single();

    if (error || !data) {
      return NextResponse.json({ invite: null }, { status: 404 });
    }

    return NextResponse.json({ invite: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { invite: null, error: "Server error." },
      { status: 500 }
    );
  }
}
