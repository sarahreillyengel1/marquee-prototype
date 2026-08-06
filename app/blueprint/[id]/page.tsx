import BrandShell from "@/components/BrandShell";
import Results from "../Results";
import { createServerSupabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { BlueprintResult } from "@/lib/blueprint/engine";

export const metadata = { title: "A Career Blueprint · Marquee" };

// Public, shareable results page. Loads a saved result by its (unguessable)
// uuid. Requires the blueprint_results table (lib/blueprint/schema.sql).
export default async function SharedBlueprintPage({ params }: { params: { id: string } }) {
  let result: BlueprintResult | null = null;
  try {
    const supabase = createServerSupabase();
    const { data } = await supabase
      .from("blueprint_results")
      .select("result")
      .eq("id", params.id)
      .single();
    result = (data?.result as BlueprintResult) ?? null;
  } catch {
    result = null;
  }
  if (!result) notFound();

  return (
    <BrandShell source="blueprint-shared">
      <Results result={result} shareId={params.id} />
    </BrandShell>
  );
}
