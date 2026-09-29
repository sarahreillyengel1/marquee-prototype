// Leadership archetypes — one shared list, so the builder and the public profile always
// show the same plain-language definition. Each says what that kind of leader does best.
export const ARCHETYPES: { name: string; desc: string }[] = [
  { name: "The Builder", desc: "Starts from nothing. Turns an idea into a working product, team or business." },
  { name: "The Fixer", desc: "Steps into what is broken, finds the real problem and gets it working again." },
  { name: "The Scaler", desc: "Takes something that works and grows it, adding the people and systems to keep pace." },
  { name: "The Operator", desc: "Runs the day to day. Turns plans into steady, repeatable results." },
  { name: "The Strategist", desc: "Decides where to focus. Reads the market, sets direction and ties today's work to the long-term goal." },
  { name: "The Coach", desc: "Grows people. Builds strong teams by developing each person." },
  { name: "The Connector", desc: "Brings the right people together. Builds partnerships and communities that open doors." },
  { name: "The Visionary", desc: "Sees what could exist before others do, and gets people to believe in it." },
  { name: "The Innovator", desc: "Finds a better way. Tests new ideas early and rethinks how the work gets done." },
];

export const ARCHETYPE_DESC: Record<string, string> = Object.fromEntries(ARCHETYPES.map((a) => [a.name, a.desc]));
