import LegalPage from "@/components/LegalPage";
import { TERMS, TERMS_INTRO } from "@/lib/legal";

export const metadata = { title: "Terms of Service · Marquee" };

export default function TermsPage() {
  return <LegalPage title="Terms of Service" intro={TERMS_INTRO} sections={TERMS} other={{ label: "Privacy Policy", href: "/privacy" }} />;
}
