import type { StreamingToken } from "@/components/primitives/StreamingText";

export type DummyReply = {
  id: string;
  label: string;
  prompt: string;
  tokens: StreamingToken[];
  followUps: string[];
  thinkingVariant?: string;
};

function words(text: string): StreamingToken[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((text) => ({ text }));
}

export const SEARCH_ITEMS = [
  "Forecast summer demand",
  "Find waffle cone suppliers",
  "Compare seasonal flavors",
  "Draft flavor launch plan",
  "Check cold-chain status",
  "Compare mint chip to last summer",
  "Propose flavor edits",
  "Batch restock function",
];

export const SIDEBAR_RECENTS: { id: string; label: string; prompt: string }[] = [
  { id: "mint", label: "Mint chip vs last summer", prompt: "Compare mint chip to last summer" },
  { id: "suppliers", label: "Supplier records", prompt: "Find waffle cone suppliers" },
  { id: "todos", label: "Urgent to-dos this morning", prompt: "What should I tackle first today?" },
  { id: "flavor", label: "Flavor page ticket", prompt: "Draft flavor launch plan" },
  { id: "workload", label: "Workload summary", prompt: "Summarize this week's creamery workload" },
  { id: "offboarding", label: "Off-board a supplier", prompt: "Help me off-board a supplier" },
  { id: "restock", label: "Batch restock function", prompt: "Batch restock function" },
  { id: "edits", label: "Propose flavor edits", prompt: "Propose flavor edits" },
];

export const REPLIES: DummyReply[] = [
  {
    id: "mint",
    label: "Mint chip vs last summer",
    prompt: "Compare mint chip to last summer",
    thinkingVariant: "Steps",
    tokens: [
      ...words(
        "Mint chip is having a much stronger summer than last year. Overall scoop volume is up about 12%, with the clearest gains on Friday–Sunday evenings when walk-in traffic peaks. Average ticket size is also slightly higher because guests are adding waffle bowls and premium toppings more often than they did last July.",
      ),
      { text: "", cite: true },
      ...words(
        "Margin looks healthier too. Mint chip is beating vanilla by roughly eight points after dairy and mix-in costs, which means you can afford a light promo without wiping out contribution. The main risk is cone and chocolate-chip inventory: last year’s stockouts hit exactly during the two hottest weekends.",
      ),
      ...words(
        "Recommendation: raise weekend prep batches by 15–18%, lock a backup chip supplier now, and keep peach/apricot as secondary features since stone-fruit flavors are rising in the same band. If you want, I can draft a weekend production schedule and a short tasting-note blurb for the board.",
      ),
    ],
    followUps: ["Which flavors sell best in winter", "Compare gelato and soft serve margins"],
  },
  {
    id: "competitors",
    label: "Competitor analysis",
    prompt: "Analyze our competitors",
    thinkingVariant: "Reasoning",
    tokens: words(
      "Here’s a clearer read of the competitive field. One player owns enterprise accounts with deep integrations, long sales cycles, and a dense admin console—they win when IT is in the room. A second competitor owns mid-market polish: beautiful UI, fast onboarding, weaker depth once teams outgrow the happy path. The third competes almost entirely on price and template packs, which works for early-stage teams but collapses when workflows get custom.",
    ).concat(
      words(
        "Across all three, the gap is the same: they rarely balance ease and power. Either setup feels simple and then hits a wall, or it feels powerful and intimidating on day one. That is where you can stand out—ship a product that feels obvious in the first ten minutes and still holds up when ops gets complicated.",
      ),
    ).concat(
      words(
        "Positioning should lean on simplicity, clear onboarding, and reliable support—exactly where competitors stumble. A line that lands: “Novaa helps teams move faster with intuitive workflows that still work for growing businesses.” Pair that with proof: time-to-first-value under a day, a guided setup checklist, and two reference customers who graduated from starter plans into multi-team orgs without ripping out the stack.",
      ),
    ),
    followUps: ["Draft a positioning one-pager", "List three pricing experiments"],
  },
  {
    id: "suppliers",
    label: "Waffle cone suppliers",
    prompt: "Find waffle cone suppliers",
    thinkingVariant: "Search",
    tokens: words(
      "For a creamery of your size, three suppliers keep coming up as the strongest fit. Joy Cone has the best cold-chain documentation and consistent sleeve packing, with lead times usually in the 5–9 day range. WebstaurantStore is useful for rush fills and mixed SKUs when you need cones, cups, and spoons in one shipment, though unit cost runs a bit higher. The Konery is the quality play—thicker walls, better caramelization, and friendlier for signature waffle bowls—but MOQs are higher and you should plan 10–12 days of buffer.",
    ).concat(
      words(
        "Practical next step: keep Joy Cone as primary, The Konery as premium weekend SKU, and WebstaurantStore as emergency backup. I can draft a reorder email with quantities for the next four heat-spike weekends and a simple scorecard (lead time, breakage rate, unit cost, cold-chain proof) so you can review vendors monthly.",
      ),
    ),
    followUps: ["Draft a reorder email", "Compare cone unit costs"],
  },
  {
    id: "demand",
    label: "Forecast summer demand",
    prompt: "Forecast summer demand",
    thinkingVariant: "Steps",
    tokens: words(
      "Summer demand should concentrate on pistachio and mint chip, especially July weekends. Based on last year’s curve plus this spring’s early heat, expect roughly +18% cone inventory need and stronger bowl upgrades after 4pm. Vanilla stays stable as a mixer; rocky road continues to lag and is a candidate to retire if weekly scoops stay under forty.",
    ).concat(
      words(
        "Ops plan: pre-churn two extra mint batches before holiday weekends, confirm two backup dairy vendors for heat spikes, and stage cone sleeves closer to the front counter so restocks don’t stall the line. If temperatures forecast above 95°F for three consecutive days, treat it like an event weekend and pull the emergency supplier path automatically.",
      ),
    ).concat(
      words(
        "I can turn this into a week-by-week restock list with SKU counts, owner names, and a short ‘retire / keep / promote’ call on the bottom five flavors if you want that next.",
      ),
    ),
    followUps: ["Build a restock list", "Flag low sellers to retire"],
  },
];

export function replyForPrompt(prompt: string): DummyReply {
  const normalized = prompt.trim().toLowerCase();
  const hit =
    REPLIES.find((reply) => reply.prompt.toLowerCase() === normalized) ||
    REPLIES.find(
      (reply) =>
        normalized.includes(reply.prompt.toLowerCase()) ||
        reply.prompt.toLowerCase().includes(normalized) ||
        reply.label.toLowerCase().includes(normalized),
    );

  if (hit) return { ...hit, prompt };

  return {
    id: `gen-${Date.now()}`,
    label: prompt.slice(0, 42) || "New chat",
    prompt,
    thinkingVariant: "Steps",
    tokens: words(
      "Got it — here’s a fuller pass. First, clarify the outcome you want in one sentence so the team shares the same finish line. Second, pull the latest creamery signals: weekend velocity, margin by flavor, open supplier lead times, and any cold-chain exceptions from the last two weeks. Third, propose three concrete actions with owners and timing — for example, a production bump, a vendor backup, and a customer-facing promo test.",
    ).concat(
      words(
        "I’ll keep recommendations practical: what to do this week, what can wait until next week, and what needs a decision from you before anyone spends money. If it helps, I can convert this into a checklist, a Slack update, or a short brief your ops lead can run with tomorrow morning.",
      ),
    ),
    followUps: ["Turn this into tasks", "Show me the data you’d pull"],
  };
}
