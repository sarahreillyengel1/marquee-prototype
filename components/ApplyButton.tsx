"use client";

import { useState } from "react";
import WaitlistModal from "@/components/WaitlistModal";

// Self-contained "Request an invitation" button + apply modal — usable from server components.
export default function ApplyButton({
  label = "Request an invitation",
  source = "cta",
  className = "",
}: {
  label?: string;
  source?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>{label}</button>
      <WaitlistModal open={open} onClose={() => setOpen(false)} source={source} />
    </>
  );
}
