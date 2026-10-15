"use client";
// Inside the Shop step: what has sold, for how much, and to whom. Refund a paid order; export everything.
import { useEffect, useState } from "react";

type Row = { id: string; created_at: string; product_title: string; product_kind: string | null; buyer_name: string | null; buyer_email: string; price_cents: number; fee_cents: number; status: string };
type Totals = { sales: number; free: number; refunded: number; gross: string; earned: string; customers: number };

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const money = (c: number) => (c % 100 === 0 ? `$${c / 100}` : `$${(c / 100).toFixed(2)}`);
const csvCell = (v: unknown) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export function SalesPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "off" | "error">("loading");
  const [view, setView] = useState<"sales" | "customers">("sales");
  const [note, setNote] = useState("");

  const load = async () => {
    const r = await fetch("/api/store/orders").catch(() => null);
    if (!r) { setState("error"); return; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setState(String(j.error || "").includes("switched on") ? "off" : "error"); return; }
    setRows(j.rows || []); setTotals(j.totals || null); setState("ok");
  };
  useEffect(() => { load(); }, []);

  const refund = async (id: string) => {
    if (!confirm("Refund this order? The buyer gets their money back and Marquee's fee is returned too. This cannot be undone.")) return;
    setNote("Refunding…");
    const r = await fetch("/api/store/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const j = await r.json().catch(() => ({}));
    setNote(r.ok ? "Refunded." : j.error || "Couldn't refund.");
    if (r.ok) load();
  };

  const exportCsv = () => {
    const head = ["Date", "Product", "Customer", "Email", "Paid", "Marquee fee", "Status"];
    const lines = [head.join(","), ...rows.map((r) => [when(r.created_at), r.product_title, r.buyer_name || "", r.buyer_email, money(r.price_cents), money(r.fee_cents), r.status].map(csvCell).join(","))];
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `marquee-sales-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };

  if (state === "loading") return null;
  if (state === "off") return null; // selling not set up on this account yet; nothing to show
  if (state === "error") return <div className="border border-[#E1DED7] bg-white p-[18px] mb-6 max-w-[980px] text-[13px] text-[#7d7a74]">Couldn&rsquo;t load your sales right now.</div>;
  if (rows.length === 0) return <div className="border border-[#E1DED7] bg-white p-[18px] mb-6 max-w-[980px] text-[13px] text-[#7d7a74]"><span className="font-semibold text-brand-ink">Sales.</span> Nothing sold yet. Products set to sell on Marquee show up here the moment someone buys.</div>;

  // one line per customer: what they bought, how much, when they last bought
  const customers = Object.values(rows.reduce<Record<string, { name: string; email: string; n: number; cents: number; last: string; items: string[] }>>((acc, r) => {
    const k = r.buyer_email.toLowerCase(); const c = acc[k] || (acc[k] = { name: r.buyer_name || "", email: r.buyer_email, n: 0, cents: 0, last: r.created_at, items: [] });
    c.n += 1; if (r.status === "paid") c.cents += r.price_cents; if (!c.name && r.buyer_name) c.name = r.buyer_name; if (!c.items.includes(r.product_title)) c.items.push(r.product_title); if (r.created_at > c.last) c.last = r.created_at; return acc;
  }, {}));

  const btn = "font-sans text-[12px] font-semibold border border-[#E1DED7] bg-white py-[7px] px-[12px] hover:border-brand-ink";
  return (
    <div className="border border-[#E1DED7] bg-white p-[18px] mb-6 max-w-[980px]">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="font-sans text-[15px] font-semibold">Sales</div>
          {totals && <div className="text-[13px] text-[#7d7a74] mt-[2px]">{totals.sales} {totals.sales === 1 ? "sale" : "sales"} · {totals.gross} sold · <span className="text-brand-ink font-semibold">{totals.earned} to you</span> · {totals.customers} {totals.customers === 1 ? "customer" : "customers"}{totals.free ? ` · ${totals.free} free` : ""}{totals.refunded ? ` · ${totals.refunded} refunded` : ""}</div>}
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setView("sales")} className={`${btn} ${view === "sales" ? "border-brand-ink" : ""}`}>Sales</button>
          <button onClick={() => setView("customers")} className={`${btn} ${view === "customers" ? "border-brand-ink" : ""}`}>Customers</button>
          <button onClick={exportCsv} className={btn}>Export CSV</button>
        </div>
      </div>
      {note && <div className="text-[12.5px] text-[#7d7a74] mb-2">{note}</div>}
      {view === "sales" ? (
        <div className="divide-y divide-[#F1EEE8]">
          {rows.map((r) => (
            <div key={r.id} className="py-[10px] grid grid-cols-[1fr_auto] gap-3 items-center text-[13.5px]">
              <div className="min-w-0">
                <div className="font-semibold truncate">{r.product_title} <span className="font-normal text-[#7d7a74]">· {r.buyer_name || r.buyer_email}</span></div>
                <div className="text-[12.5px] text-[#7d7a74]">{when(r.created_at)} · <a href={`mailto:${r.buyer_email}`} className="hover:text-brand-ink">{r.buyer_email}</a>{r.status === "refunded" ? " · refunded" : r.status === "free" ? " · free" : ""}</div>
              </div>
              <div className="flex items-center gap-3 whitespace-nowrap">
                <span className={`font-semibold ${r.status === "refunded" ? "line-through text-[#a8a29a]" : ""}`}>{r.price_cents ? money(r.price_cents) : "Free"}</span>
                {r.status === "paid" && <button onClick={() => refund(r.id)} className="text-[12px] text-[#7d7a74] hover:text-[#670821]">Refund</button>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-[#F1EEE8]">
          {customers.sort((a, b) => b.last.localeCompare(a.last)).map((c) => (
            <div key={c.email} className="py-[10px] grid grid-cols-[1fr_auto] gap-3 items-center text-[13.5px]">
              <div className="min-w-0"><div className="font-semibold">{c.name || c.email}</div><div className="text-[12.5px] text-[#7d7a74] truncate"><a href={`mailto:${c.email}`} className="hover:text-brand-ink">{c.email}</a> · {c.items.join(", ")}</div></div>
              <div className="text-right whitespace-nowrap"><div className="font-semibold">{c.cents ? money(c.cents) : "Free"}</div><div className="text-[12px] text-[#7d7a74]">{c.n} {c.n === 1 ? "order" : "orders"} · {when(c.last).split(",")[0]}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
