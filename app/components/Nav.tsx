"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

const S: Record<string, CSSProperties> = {
  bar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    background: "#ffffff",
    borderBottom: "1px solid #e6e8f0",
    boxShadow: "0 2px 10px rgba(15,23,42,0.04)"
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16
  },
  brand: { fontWeight: 900, fontSize: 18, color: "#0a7cff" },
  links: { display: "flex", gap: 18 },
  link: {
    textDecoration: "none",
    color: "#334155",
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid transparent",
    cursor: "pointer"
  },
  linkActive: {
    color: "#0a7cff",
    background: "rgba(10,124,255,.08)",
    border: "1px solid rgba(10,124,255,.25)"
  }
};

export default function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    (href === "/" && pathname === "/") ||
    (href === "/partners" && pathname.startsWith("/partners"));

  return (
    <nav style={S.bar}>
      <div style={S.inner}>
        <div style={S.brand}>🏢 NeVo Tower</div>
        <div style={S.links}>
          <Link href="/" style={{ ...S.link, ...(isActive("/") ? S.linkActive : {}) }}>
            Home
          </Link>
          {/* Renderings removed by request */}
          <Link
            href="/partners"
            style={{ ...S.link, ...(isActive("/partners") ? S.linkActive : {}) }}
          >
            Partners
          </Link>
        </div>
      </div>
    </nav>
  );
}