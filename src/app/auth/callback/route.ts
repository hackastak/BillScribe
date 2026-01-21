import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure profile exists for the user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          await db
            .insert(profiles)
            .values({
              id: user.id,
              email: user.email!,
            })
            .onConflictDoNothing();
        } catch (e) {
          console.error("Error creating profile:", e);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
