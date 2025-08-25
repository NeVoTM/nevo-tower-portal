"use client";

import { useMemo, useRef, useState, useEffect, KeyboardEvent } from "react";

type QAGroup = Record<string, string[]>;
type Match = { id: string; title: string; url?: string; score: number };

const queryData: QAGroup = {
  Models: [
    "Explain the Miami Makers Model in simple terms.",
    "What are the main advantages of the MMM compared to traditional financing?",
    "How does the ‘Partners Not Paychecks’ approach align incentives for contributors?",
    "Summarize the pros and cons of the NeVo Tower SFE Model.",
    "How does MMM reduce construction costs by up to 20% per square foot?",
    "What legal risks exist if the ‘Partners Not Paychecks’ model is classified as a security?",
    "Compare NeVo Tower’s SFE model to the MMM model in terms of risk-sharing.",
    "What partner benefits exist in MMM that aren’t available in traditional developments?"
  ],
  Projects: [
    "What is the planned height and number of units for NeVo Tower?",
    "When is NeVo Tower expected to begin construction and when will it complete?",
    "Which North Bay Village projects are under construction and which are in planning?",
    "How many square feet are being developed at 1580 79th St Causeway?",
    "Compare NeVo Tower to Shoma Bay in terms of units, height, and timeline.",
    "List all residential projects above 20 stories in North Bay Village.",
    "Which projects in North Bay Village could benefit most from the MMM approach?"
  ],
  Renderings: [
    "Show me the rooftop render of NeVo Tower.",
    "Display the sunset view rendering.",
    "Which renderings illustrate the tower’s exterior design?",
    "What does the ‘Render 3.0’ image show compared to the ‘Tower’ image?"
  ]
};

const mockAnswers: Record<string, string> = {
  "Explain the Miami Makers Model in simple terms.":
    "MMM (‘Miami Makers — Partners Not Paychecks’) replaces bank debt with in‑kind contributions valued at market rates. Contributors become co‑developers and share profits pro‑rata with a time‑weighted preferred return.",
  "What are the main advantages of the MMM compared to traditional financing?":
    "Lower cash needed, no lender delays, faster timelines, potential ~20% construction cost savings, milestone‑based distributions, and tax perks.",
  "How does the ‘Partners Not Paychecks’ approach align incentives for contributors?":
    "Everyone invests value and is paid from upside, not fixed fees. Returns scale with project success so all parties row in the same direction.",
  "Summarize the pros and cons of the NeVo Tower SFE Model.":
    "Pros: efficiency, analytics, scalability. Cons: setup cost, integration complexity, change‑management and vendor dependency.",
  "How does MMM reduce construction costs by up to 20% per square foot?":
    "Avoiding interest carry and lender‑driven delays; converting portions of vendor margin into equity that pays from profits instead of markup.",
  "What legal risks exist if the ‘Partners Not Paychecks’ model is classified as a security?":
    "Possible registration/exemption requirements, disclosures, anti‑fraud liabilities; non‑compliance risks rescission and penalties.",
  "Compare NeVo Tower’s SFE model to the MMM model in terms of risk-sharing.":
    "SFE optimizes execution risk; MMM redistributes financial risk via ownership and preferred returns.",
  "What partner benefits exist in MMM that aren’t available in traditional developments?":
    "Equity‑linked upside, depreciation access, self‑financing options for buyers, optional STR income on retained suites.",
  "What is the planned height and number of units for NeVo Tower?":
    "Demo: 24 stories, ~75 units (mixed‑use).",
  "When is NeVo Tower expected to begin construction and when will it complete?":
    "Demo target: start Q3 2026; completion depends on approvals and sales milestones.",
  "Which North Bay Village projects are under construction and which are in planning?":
    "Demo: Continuum under construction; several others in planning/review.",
  "How many square feet are being developed at 1580 79th St Causeway?":
    "Approx. 260,775 SF (demo).",
  "Compare NeVo Tower to Shoma Bay in terms of units, height, and timeline.":
    "Demo: NeVo 24/75 vs Shoma Bay 24/333; different statuses and delivery years.",
  "List all residential projects above 20 stories in North Bay Village.":
    "Demo list: NeVo (24), Shoma Bay (24), Pagani (28), Related/Macklowe (2x43), Tula (21)…",
  "Which projects in North Bay Village could benefit most from the MMM approach?":
    "Projects with lender constraints or costly carry; where pre‑sales are achievable.",
  "Show me the rooftop render of NeVo Tower.": "Opening rooftop render (demo).",
  "Display the sunset view rendering.": "Opening sunset render (demo).",
  "Which renderings illustrate the tower’s exterior design?":
    "‘Tower’ and ‘Render 3.0’ show massing and streetscape (demo).",
  "What does the ‘Render 3.0’ image show compared to the ‘Tower’ image?":
    "Podium/streetscape vs massing/vertical expression (demo)."
};

const renderings = [
  { src: "/renderings/rooftop.png",     title: "Rooftop Amenity Deck", caption: "Rooftop leisure + views" },
  { src: "/renderings/sunset-view.png", title: "Sunset View",          caption: "West-facing golden hour" },
  { src: "/renderings/tower.png",       title: "Tower Exterior",       caption: "Massing & vertical expression" },
  { src: "/renderings/render-3.png",    title: "Podium / Streetscape", caption: "Pedestrian-level experience" },
  { src: "/renderings/render-6.png",    title: "Perspective Angle",    caption: "Alternate façade perspective" }
];

const C = {
  border: "#e6e8f0",
  card: "#fff",
  brand: "#0a7cff",
  brandD: "#0555b3"
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<keyof typeof queryData>("Models");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [openImg, setOpenImg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // When landing on /#renderings, auto-scroll to the gallery and activate the tab
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#renderings") {
      const el = document.getElementById("renderings");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveTab("Renderings");
    }
  }, []);

  const allQuestions = useMemo(
    () =>
      Object.entries(queryData).flatMap(([category, qs]) =>
        qs.map((q) => ({ category, q }))
      ),
    []
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allQuestions.filter(
      ({ q: text, category }) =>
        (activeTab ? category === activeTab : true) &&
        text.toLowerCase().includes(q)
    );
  }, [searchQuery, activeTab, allQuestions]);

  async function ask(text: string) {
    const q = (text || "").trim();
    if (!q) return;
    setLoading(true);
    setSelectedQuestion(q);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, topK: 5 })
      });
      const data = await res.json();
      setAnswer(
        data?.answer && data.answer !== "Not found in uploaded documents."
          ? data.answer
          : mockAnswers[q] || "Not found in uploaded documents."
      );
      setMatches(Array.isArray(data?.matches) ? data.matches : []);
    } catch {
      setAnswer(mockAnswers[q] || "Not found in uploaded documents.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  const handlePick = (q: string) => {
    setSearchQuery(q);
    ask(q);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Hide previous answer if user edits
  useEffect(() => {
    if (selectedQuestion && searchQuery !== selectedQuestion) {
      setSelectedQuestion(null);
      setAnswer(null);
      setMatches([]);
    }
  }, [searchQuery, selectedQuestion]);

  // Enter submits like clicking Ask
  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading && searchQuery.trim()) {
      ask(searchQuery);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingTop: 8 }}>
      {/* Tabs */}
      <div
        role="tablist"
        style={{
          display: "inline-flex",
          gap: 8,
          background: "#eef2ff",
          padding: 6,
          borderRadius: 12,
          marginBottom: 12
        }}
      >
        {(["Models", "Projects", "Renderings"] as const).map((t) => {
          const active = activeTab === t;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t)}
              style={{
                borderRadius: 10,
                padding: "8px 12px",
                fontWeight: 700,
                border: `1px solid ${active ? C.brand : "transparent"}`,
                background: active ? "#fff" : "transparent",
                color: active ? C.brandD : "#1f2937",
                cursor: "pointer"
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 8,
          marginBottom: 10,
          background: "#f1f5f9",
          borderRadius: 12,
          padding: 12,
          border: `1px solid ${C.border}`
        }}
      >
        <input
          ref={inputRef}
          placeholder="Type your query…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={onInputKeyDown}
          style={{
            outline: "none",
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 14,
            background: "#fff"
          }}
        />
        <button
          onClick={() => ask(searchQuery)}
          disabled={!searchQuery.trim() || loading}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "none",
            background: loading ? "#a5b4fc" : C.brand,
            color: "#fff",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            minWidth: 70
          }}
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>

      {/* Suggestions */}
      {filtered.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
            Suggestions
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {filtered.slice(0, 6).map(({ q }, i) => (
              <button
                key={i}
                onClick={() => handlePick(q)}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  background: "#fff",
                  cursor: "pointer"
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lists by tab */}
      <div style={{ display: activeTab === "Renderings" ? "none" : "block" }}>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
          Browse {activeTab}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {queryData[activeTab].map((q, i) => (
            <button
              key={i}
              onClick={() => handlePick(q)}
              style={{
                textAlign: "left",
                padding: 14,
                borderRadius: 16,
                border: `1px solid ${C.border}`,
                background: "#fff",
                cursor: "pointer"
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Renderings gallery */}
      <div id="renderings" style={{ marginTop: 24 }}>
        {activeTab === "Renderings" && (
          <>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
              Gallery
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))",
                gap: 12
              }}
            >
              {renderings.map((r) => (
                <div
                  key={r.src}
                  style={{
                    background: "#fff",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 8,
                    cursor: "pointer"
                  }}
                  onClick={() => setOpenImg(r.src)}
                  title={r.title}
                >
                  <img
                    src={r.src}
                    alt={r.title}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 8,
                      display: "block"
                    }}
                  />
                  <div style={{ padding: "6px 4px 2px", fontWeight: 700 }}>
                    {r.title}
                  </div>
                  <div style={{ padding: "0 4px 6px", fontSize: 12, opacity: 0.7 }}>
                    {r.caption}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Image lightbox */}
      {openImg && (
        <div
          onClick={() => setOpenImg(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 100
          }}
        >
          <img
            src={openImg}
            alt="rendering"
            style={{
              maxWidth: "95vw",
              maxHeight: "85vh",
              borderRadius: 12,
              background: "#000"
            }}
          />
        </div>
      )}

      {/* Answer panel */}
      {answer && (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            maxWidth: 460,
            width: "calc(100% - 32px)",
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            background: "#fff",
            boxShadow: "0 12px 40px rgba(2,6,23,.2)",
            zIndex: 60
          }}
        >
          <div style={{ padding: 14, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 800 }}>Answer</div>
          </div>
          <div style={{ padding: 14, fontSize: 14, lineHeight: 1.6 }}>{answer}</div>

          {matches.length > 0 && (
            <div style={{ padding: "0 14px 14px" }}>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                Top sources
              </div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {matches.map((m) => (
                  <li key={m.id} style={{ marginBottom: 6 }}>
                    {m.url ? (
                      <a href={m.url} target="_blank" rel="noreferrer">
                        {m.title}
                      </a>
                    ) : (
                      <span>{m.title}</span>
                    )}
                    <span style={{ opacity: 0.6, marginLeft: 6 }}>
                      (score {m.score})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            style={{
              padding: 12,
              display: "flex",
              gap: 8,
              borderTop: `1px solid ${C.border}`,
              justifyContent: "flex-end"
            }}
          >
            <button
              onClick={() => {
                setAnswer(null);
                setMatches([]);
                inputRef.current?.focus();
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: "#f8fafc",
                cursor: "pointer"
              }}
            >
              Back to query
            </button>
            <button
              onClick={() => inputRef.current?.focus()}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "none",
                background: C.brand,
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              Edit question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}