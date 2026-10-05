import BrandShell from "@/components/BrandShell";
import { publishedSpotlight } from "@/lib/spotlight";
import SpotlightView from "./SpotlightView";

// marquee.bio/spotlight — the weekly editorial page. Drawn on the server so search engines read it.
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Spotlight · Marquee",
  description: "The news, ideas and tools for professionals building careers across more than one thing. Opportunities, events and education, hand-picked every week by Marquee.",
};

export default async function SpotlightPage() {
  const items = await publishedSpotlight();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/New_York" });
  return (
    <BrandShell source="spotlight">
      <SpotlightView items={items} today={today} />
    </BrandShell>
  );
}
