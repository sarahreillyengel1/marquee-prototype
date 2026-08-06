import BrandShell from "@/components/BrandShell";
import BlueprintFlow from "./BlueprintFlow";

export const metadata = { title: "Your Career Blueprint · Marquee" };

// Private, unlinked route. The public /assessment landing stays "Coming soon"
// until launch, at which point this flow gets connected.
export default function BlueprintPage() {
  return (
    <BrandShell source="blueprint">
      <BlueprintFlow />
    </BrandShell>
  );
}
