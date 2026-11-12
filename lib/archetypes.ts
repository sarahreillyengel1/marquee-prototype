// Leadership archetypes — one shared list, so the builder and the public profile always
// show the same plain-language definition. Each says what that kind of leader does best.
export const ARCHETYPES: { name: string; desc: string }[] = [
  { name: "The Builder", desc: "Knows how to turn an idea into a functioning business, product, program, or organization." },
  { name: "The Fixer", desc: "Diagnoses complex business challenges, identifies underlying issues, and develops solutions to restructure, reposition, or turn things around." },
  { name: "The Scaler", desc: "Commercializes products, expands markets, accelerates revenue, and builds the infrastructure to support growth." },
  { name: "The Operator", desc: "Designs the systems, processes, and organizational structures that keep businesses running effectively." },
  { name: "The Strategist", desc: "Connects market dynamics, business opportunities, and competing priorities to determine the best course of action." },
  { name: "The Coach", desc: "Recognizes potential, identifies opportunities for improvement, and guides individuals, teams, or organizations toward better performance." },
  { name: "The Connector", desc: "Builds relationships, partnerships, communities, and ecosystems that create opportunities for people and businesses." },
  { name: "The Visionary", desc: "Anticipates where industries, markets, or behaviors are heading and recognizes opportunities well before they become apparent." },
  { name: "The Innovator", desc: "Develops original ideas, approaches, and solutions that challenge established ways of working." },
  { name: "The Catalyst", desc: "Recognizes when change is needed and has the ability to mobilize people, overcome resistance, and move things forward." },
];

/** how many a member may pick */
export const ARCH_MAX = 6;

export const ARCHETYPE_DESC: Record<string, string> = Object.fromEntries(ARCHETYPES.map((a) => [a.name, a.desc]));
