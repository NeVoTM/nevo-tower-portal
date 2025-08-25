export default function PartnersPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
        Partners, not investors
      </h1>
      <p style={{ color: "#475569", marginBottom: 16 }}>
        MMM turns contributors into co‑developers with upside instead of fixed fees.
      </p>

      <a
        href="/partners/partners-one-pager.pdf"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginBottom: 18,
          padding: "10px 14px",
          borderRadius: 10,
          background: "#0a7cff",
          color: "#fff",
          fontWeight: 800,
          textDecoration: "none",
        }}
      >
        Open Partner PDF
      </a>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e6e8f0",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Why become a Partner?</h2>
        <ul>
          <li>Pro‑rata share in project profits with a preferred return.</li>
          <li>Lower cash outlay via in‑kind services/materials at market value.</li>
          <li>Faster execution with fewer lender delays.</li>
          <li>Potential tax benefits (e.g., depreciation transfer).</li>
        </ul>
      </div>
    </div>
  );
}
