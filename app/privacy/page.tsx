import LegalPage from "@/components/LegalPage";
import { PRIVACY, PRIVACY_INTRO } from "@/lib/legal";

export const metadata = { title: "Privacy Policy · Marquee" };

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" intro={PRIVACY_INTRO} sections={PRIVACY} other={{ label: "Terms of Service", href: "/terms" }} />;
}
