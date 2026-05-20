import { createCheckoutSession } from "@/lib/stripe";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, userId } = await request.json();

  if (!email || !userId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    // Create profiles_meta entry
    const supabase = createServerSupabase();
    await supabase.from("profiles_meta").upsert({
      id: userId,
      subscription_status: "active",
    });

    const url = await createCheckoutSession(email, userId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
