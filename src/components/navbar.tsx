"use client"

import { useState } from "react"
import { Bell, Search } from "lucide-react"

export default function Navbar() {
  const [query, setQuery] = useState("")

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Syne:wght@700&display=swap');

        .navbar-search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f9fafb;
          border: 1px solid #ede9fe;
          border-radius: 10px;
          padding: 7px 14px;
          transition: border-color 0.18s;
        }
        .navbar-search:focus-within {
          border-color: #a78bfa;
          background: #fff;
        }
        .navbar-search input {
          border: none;
          outline: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: #374151;
          width: 180px;
        }
        .navbar-search input::placeholder { color: #9ca3af; }

        .notif-btn {
          position: relative;
          width: 38px;
          height: 38px;
          background: #fff;
          border: 1px solid #ede9fe;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s;
        }
        .notif-btn:hover { background: #f0efff; border-color: #c4b5fd; }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #ec4899;
          border-radius: 50%;
          position: absolute;
          top: 7px;
          right: 7px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }

        .user-avatar {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #4f46e5, #a78bfa);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border: 2px solid #ede9fe;
          font-family: 'DM Sans', sans-serif;
          transition: transform 0.15s;
        }
        .user-avatar:hover { transform: scale(1.05); }
      `}</style>

      <header style={{
        height: 64,
        background: "#fff",
        borderBottom: "1px solid #ede9fe",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Title + subtitle */}
        <div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#1e1b4b",
            letterSpacing: "-0.3px",
            lineHeight: 1.2,
          }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 1 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Search */}
          <div className="navbar-search">
            <Search size={14} color="#9ca3af" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
            />
          </div>

          {/* Notifications */}
          <div className="notif-btn">
            <Bell size={16} color="#6b7280" />
            <span className="pulse-dot" />
          </div>

          {/* Avatar */}
          <div className="user-avatar">JD</div>

        </div>
      </header>
    </>
  )
}