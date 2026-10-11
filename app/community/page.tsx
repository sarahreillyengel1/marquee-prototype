import BrandShell from "@/components/BrandShell";
import CommunityForm from "./CommunityForm";

export const metadata = { title: "Get to Know You · Marquee", robots: { index: false } };

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
const H1 = "font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(28px,6vw,56px)]";
const EYEBROW = "text-[12px] font-bold tracking-[0.18em] uppercase text-dred";

export default function CommunityPage() {
  return (
    <BrandShell source="community">
      <section className="py-[clamp(48px,6vw,88px)]">
        <div className={`${WRAP} max-w-[860px]`}>
          <div className={EYEBROW}>Community</div>
          <h1 className={`${H1} mt-4`}>Get to Know You</h1>
          <p className="text-[clamp(15px,2vw,19px)] leading-[1.55] mt-5 max-w-[640px] text-ink/80">
            We&rsquo;re building Marquee with our community, and we&rsquo;d love to learn more about you and your professional goals.
          </p>
          <CommunityForm />
        </div>
      </section>
    </BrandShell>
  );
}
