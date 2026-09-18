import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { ArrowRight, Copy, LogOut, Menu, Rocket, UserRound, X } from "lucide-react";
import "./styles.css";
import amazonLogo from "./images/amazon.png";
import blackrockLogo from "./images/blackrock-logo.jpg";
import blackstoneLogo from "./images/blackstone-logo.jpg";
import coatueLogo from "./images/coatue-logo.jpg";
import fidelityLogo from "./images/Fidelity-footer-logo.webp";
import foundersFundLogo from "./images/ff-logo.jpeg";
import generalCatalystLogo from "./images/gc-logo.jpg";
import gicLogo from "./images/gic_logo.jpeg";
import googleLogo from "./images/google.jpg";
import jpmorganLogo from "./images/jpmorgan_logo.jpeg";
import morganStanleyLogo from "./images/morgan_stanley_logo.jpeg";
import qatarLogo from "./images/qatar-logo.jpeg";
import sequoiaLogo from "./images/sequoia-logo.jpeg";
import temasekLogo from "./images/Temasek-logo.jpg";
import ipoLogo from "./images/ipo logo2.jpg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const AuthContext = createContext(null);

const stats = [
  ["IPO valuation", "$2.0T", "Expected at launch - early access at a discount."],
  ["Revenue run-rate", "$65B", "Annualized as of July 2026 - up 7x in 7 months."],
  ["2028 revenue target", "$190-200B", "Confirmed projection - massive growth ahead."],
  ["Expected first-day pop", "+250%", "Based on institutional demand - get in before the jump."],
];

const rounds = [
  ["01", "March 2025", "$61.5B", "Early momentum with private valuation already reflecting massive potential."],
  ["02", "September 2025", "$183B", "Valuation tripled as enterprise adoption of Claude accelerated globally."],
  ["03", "February 2026", "$380B", "Another doubling as revenue run-rate climbed past $30B."],
  ["04", "May 2026", "$965B", "Series H milestone Financing at a post-money valuation."],
];

const backers = [
  ["Amazon", amazonLogo, "https://www.amazon.com/"],
  ["Google", googleLogo, "https://www.google.com/"],
  ["Sequoia Capital", sequoiaLogo, "https://www.sequoiacap.com/"],
  ["Fidelity", fidelityLogo, "https://www.fidelity.com/"],
  ["BlackRock", blackrockLogo, "https://www.blackrock.com/"],
  ["Blackstone", blackstoneLogo, "https://www.blackstone.com/"],
  ["GIC", gicLogo, "https://www.gic.com.sg/"],
  ["Temasek", temasekLogo, "https://www.temasek.com.sg/"],
  ["General Catalyst", generalCatalystLogo, "https://www.generalcatalyst.com/"],
  ["Coatue", coatueLogo, "https://www.coatue.com/"],
  ["Founders Fund", foundersFundLogo, "https://foundersfund.com/"],
  ["Qatar Investment Authority", qatarLogo, "https://www.qia.qa/"],
  ["JPMorgan", jpmorganLogo, "https://www.jpmorgan.com/"],
  ["Morgan Stanley", morganStanleyLogo, "https://www.morganstanley.com/"],
];

const growth = [
  ["Dec 2025", "$9B", "4.5%", false],
  ["May 2026", "$47B", "23.5%", false],
  ["Jul 2026", "$65B current", "32.5%", false],
  ["End 2026 target", "$100B", "50%", true],
  ["2028 projection", "$190-200B", "97.5%", true],
];

const buyerFirstNames = [
  "Alex", "Sarah", "Priya", "Michael", "David", "Maya", "Jordan", "Aisha", "Daniel", "Sofia",
  "Ethan", "Noah", "Olivia", "Liam", "Emma", "Lucas", "Amara", "Kai", "Nora", "Elena",
];

const buyerLastNames = [
  "Rivera", "Chen", "Patel", "Okafor", "Kim", "Johnson", "Martinez", "Singh", "Carter", "Nguyen",
  "Brooks", "Hassan", "Morgan", "Reed", "Khan", "Garcia", "Walker", "Bennett", "Ali", "Shah",
];

const purchaseActions = ["secured", "bought", "added", "purchased", "invested in"];
const buyerTypes = ["Retail", "Institutional", "Accredited"];

const defaultPaymentDestinations = {
  USDT: {
    "Ethereum ERC-20": { address: "Admin will add USDT ERC-20 wallet address", qrCode: "" },
    "BNB Smart Chain BEP-20": { address: "Admin will add USDT BEP-20 wallet address", qrCode: "" },
    Polygon: { address: "Admin will add USDT Polygon wallet address", qrCode: "" },
  },
  USDC: {
    "Ethereum ERC-20": { address: "Admin will add USDC ERC-20 wallet address", qrCode: "" },
    Polygon: { address: "Admin will add USDC Polygon wallet address", qrCode: "" },
  },
  ETH: {
    "Ethereum ERC-20": { address: "Admin will add ETH wallet address", qrCode: "" },
  },
  BTC: {
    Bitcoin: { address: "Admin will add BTC wallet address", qrCode: "" },
  },
  SOL: {
    Solana: { address: "Admin will add SOL wallet address", qrCode: "" },
  },
};

function mergePaymentDestinations(savedDestinations = {}) {
  const merged = structuredClone(defaultPaymentDestinations);

  for (const [asset, networks] of Object.entries(savedDestinations)) {
    if (!merged[asset]) {
      merged[asset] = {};
    }

    for (const [network, destination] of Object.entries(networks)) {
      merged[asset][network] = {
        address: destination.address || merged[asset][network]?.address || "",
        qrCode: destination.qrCode || merged[asset][network]?.qrCode || "",
      };
    }
  }

  return merged;
}

function seededRandom(seed) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function randomInt(seed, min, max) {
  return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
}

function getDemandDay(now = new Date()) {
  const baseDate = new Date("2026-08-25T00:00:00");
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.max(0, Math.floor((today - baseDate) / 86400000));
}

function getDailyInvestorTarget(dayIndex) {
  return randomInt(dayIndex + 93, 67, 111);
}

function getPreviousInvestorAdds(dayIndex) {
  return Array.from({ length: dayIndex }, (_, index) => getDailyInvestorTarget(index))
    .reduce((total, amount) => total + amount, 0);
}

function getSecondsIntoDay(now = new Date()) {
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

function getCompletedDailyAdds(now = new Date()) {
  const dayIndex = getDemandDay(now);
  const todayTarget = getDailyInvestorTarget(dayIndex);
  const secondsIntoDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  return Math.min(todayTarget, Math.floor(secondsIntoDay / (86400 / todayTarget)));
}

function getInvestorCount(now = new Date()) {
  const baseCount = 70000;
  const dayIndex = getDemandDay(now);

  return baseCount + getPreviousInvestorAdds(dayIndex) + getCompletedDailyAdds(now);
}

function getBuyerName(dayIndex, eventIndex) {
  const totalNames = buyerFirstNames.length * buyerLastNames.length;
  const startIndex = randomInt(dayIndex + 211, 0, totalNames - 1);
  const nameIndex = (startIndex + eventIndex * 37) % totalNames;
  const firstName = buyerFirstNames[nameIndex % buyerFirstNames.length];
  const lastName = buyerLastNames[Math.floor(nameIndex / buyerFirstNames.length)];

  return `${firstName} ${lastName}`;
}

function formatRelativeSeconds(seconds) {
  if (seconds < 60) {
    return `${Math.max(1, Math.floor(seconds))}s ago`;
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  }

  return `${Math.floor(seconds / 3600)}h ago`;
}

function createPurchase(dayIndex, eventIndex, now = new Date()) {
  const target = getDailyInvestorTarget(dayIndex);
  const eventSecond = Math.floor(((eventIndex + 1) * 86400) / target);
  const secondsAgo = Math.max(1, getSecondsIntoDay(now) - eventSecond);
  const seed = dayIndex * 1000 + eventIndex * 19;
  const action = purchaseActions[randomInt(seed + 3, 0, purchaseActions.length - 1)];
  const shares = randomInt(seed + 4, 24, 420);
  const type = buyerTypes[randomInt(seed + 5, 0, buyerTypes.length - 1)];

  return [getBuyerName(dayIndex, eventIndex), action, `${shares.toLocaleString()} shares`, type, formatRelativeSeconds(secondsAgo)];
}

function getRecentPurchases(now = new Date(), limit = 5) {
  const dayIndex = getDemandDay(now);
  const completedAdds = getCompletedDailyAdds(now);
  const purchases = [];

  for (let eventIndex = completedAdds - 1; eventIndex >= 0 && purchases.length < limit; eventIndex -= 1) {
    purchases.push(createPurchase(dayIndex, eventIndex, now));
  }

  for (let previousDay = dayIndex - 1; previousDay >= 0 && purchases.length < limit; previousDay -= 1) {
    const target = getDailyInvestorTarget(previousDay);

    for (let eventIndex = target - 1; eventIndex >= 0 && purchases.length < limit; eventIndex -= 1) {
      const purchase = createPurchase(previousDay, eventIndex, now);
      purchases.push([purchase[0], purchase[1], purchase[2], purchase[3], "1d ago"]);
    }
  }

  return purchases;
}

function useDemandActivity(limit = 5) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const investorCount = getInvestorCount(now);
  const recentPurchases = getRecentPurchases(now, limit);
  const dailyInvestorTarget = getDailyInvestorTarget(getDemandDay(now));

  return { dailyInvestorTarget, investorCount, recentPurchases };
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(status) {
  return String(status || "").replace(/_/g, " ");
}

function statusBadgeClass(status) {
  if (status === "approved") {
    return "text-bg-success";
  }

  if (status === "paid") {
    return "text-bg-primary";
  }

  if (status === "rejected") {
    return "text-bg-danger";
  }

  return "text-bg-warning";
}

async function apiRequest(path, options = {}) {
  const { headers, ...requestOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken") || "");
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(accessToken));

  useEffect(() => {
    if (!accessToken) {
      setIsCheckingSession(false);
      return;
    }

    localStorage.setItem("accessToken", accessToken);
    apiRequest("/profile/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => {
        localStorage.removeItem("accessToken");
        setAccessToken("");
        setUser(null);
      })
      .finally(() => setIsCheckingSession(false));
  }, [accessToken]);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isCheckingSession,
      setSession(data) {
        localStorage.setItem("accessToken", data.accessToken);
        setAccessToken(data.accessToken);
        setUser(data.user);
      },
      updateUser(nextUser) {
        setUser(nextUser);
      },
      async logout() {
        await apiRequest("/auth/logout", { method: "POST" }).catch(() => {});
        localStorage.removeItem("accessToken");
        setAccessToken("");
        setUser(null);
      },
    }),
    [accessToken, isCheckingSession, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function Eyebrow({ children, centered = false }) {
  return <span className={`eyebrow ${centered ? "justify-content-center" : ""}`}>{children}</span>;
}

function BuyButton({ large = false }) {
  return (
    <Link to="/buy" className={`btn btn-success btn-buy rounded-pill fw-bold d-inline-flex align-items-center gap-2 ${large ? "btn-lg px-5" : "px-4"}`}>
      <Rocket size={large ? 22 : 19} aria-hidden="true" />
      Buy ANTP now
    </Link>
  );
}

function CustomSelect({ disabled = false, id, label, options, placeholder = "Select an option", value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  function selectOption(option) {
    onChange(option);
    setIsOpen(false);
  }

  return (
    <div className="custom-select-field">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="custom-select">
        <button
          className="custom-select-button"
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
        >
          <span>{value || placeholder}</span>
          <span className="custom-select-caret">⌄</span>
        </button>
        {isOpen && (
          <div className="custom-select-menu">
            {options.map((option) => (
              <button
                className={`custom-select-option ${option === value ? "is-selected" : ""}`}
                type="button"
                onClick={() => selectOption(option)}
                key={option}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getInitials(user) {
  const emailName = user?.email?.split("@")[0] || "";
  const parts = emailName.split(/[._\-\s]+/).filter(Boolean);

  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }

  return (emailName.slice(0, 2) || user?.name?.slice(0, 2) || "U").toUpperCase();
}

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const homeHref = location.pathname === "/" ? "#top" : "/";

  function closeMenus() {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }

  async function handleLogout() {
    await logout();
    closeMenus();
    navigate("/login");
  }

  return (
    <nav className="navbar navbar-expand-md border-bottom py-3">
      <div className="container nav-container">
        <button
          className="mobile-menu-trigger d-inline-flex d-lg-none"
          type="button"
          onClick={() => {
            setIsMobileMenuOpen((current) => !current);
            setIsProfileOpen(false);
          }}
          aria-expanded={isMobileMenuOpen}
          aria-label="Open navigation menu"
        >
          {isMobileMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
        </button>
        <Link to="/" className="navbar-brand brand">
          <img src={ipoLogo} alt="Anthropic IPO" className="brand-logo" />
          <span className="brand-name">Anthropic <span>IPO</span></span>
        </Link>
        <div className="navbar-nav flex-row flex-wrap gap-3 gap-md-4 ms-auto mono small align-items-center">
          <a className="nav-link d-none d-lg-inline" href={homeHref}>Home</a>
          <a className="nav-link d-none d-lg-inline" href="/#facts">Metrics</a>
          <a className="nav-link d-none d-lg-inline" href="/#growth">Growth</a>
          <a className="nav-link d-none d-lg-inline" href="/#backers">Backers</a>
          <Link className="nav-link buy-link fw-bold d-none d-md-inline" to="/buy">Buy IPO</Link>
          {user && <Link className="nav-link d-none d-md-inline" to="/sell">Sell ANTP</Link>}
          {user?.isAdmin && <Link className="nav-link d-none d-md-inline" to="/admin">Admin</Link>}
          {user ? (
            <div className="profile-menu">
              <button
                className="profile-trigger"
                type="button"
                onClick={() => {
                  setIsProfileOpen((current) => !current);
                  setIsMobileMenuOpen(false);
                }}
                aria-expanded={isProfileOpen}
                aria-label="Open profile menu"
              >
                {getInitials(user)}
              </button>
              {isProfileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-email">{user.email}</div>
                  <Link to="/profile" onClick={closeMenus}>Account settings</Link>
                  <Link to="/shares" onClick={closeMenus}>Shares purchased</Link>
                  <Link to="/sell" onClick={closeMenus}>Sell ANTP</Link>
                  <button type="button" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link className="nav-link d-none d-lg-inline" to="/login">Login</Link>
              <Link className="btn btn-dark rounded-pill btn-sm px-3 d-none d-lg-inline-flex" to="/signup">Sign up</Link>
            </>
          )}
        </div>
        {isMobileMenuOpen && (
          <div className="mobile-nav-panel d-lg-none">
            <a className="mobile-nav-link" href={homeHref} onClick={closeMenus}>Home</a>
            <a className="mobile-nav-link" href="/#facts" onClick={closeMenus}>Metrics</a>
            <a className="mobile-nav-link" href="/#growth" onClick={closeMenus}>Growth</a>
            <a className="mobile-nav-link" href="/#backers" onClick={closeMenus}>Backers</a>
            <Link className="mobile-nav-link buy-link fw-bold" to="/buy" onClick={closeMenus}>Buy IPO</Link>
            {user && <Link className="mobile-nav-link" to="/sell" onClick={closeMenus}>Sell ANTP</Link>}
            {user?.isAdmin && <Link className="mobile-nav-link" to="/admin" onClick={closeMenus}>Admin</Link>}
            {!user && <Link className="mobile-nav-link" to="/login" onClick={closeMenus}>Login</Link>}
          </div>
        )}
      </div>
    </nav>
  );
}

function ValuationChart() {
  return (
    <div className="card chart-panel">
      <div className="card-body p-4">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-baseline gap-2 mb-3">
          <Eyebrow>Valuation, by funding round</Eyebrow>
          <span className="mono text-fog chart-note">USD, post-money</span>
        </div>
        <svg viewBox="0 0 620 240" className="w-100 d-block" role="img" aria-label="Valuation chart from $61.5 billion to $965 billion">
          <defs>
            <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97757" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#d97757" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[60, 100, 140, 180].map((y) => <line key={y} x1="0" y1={y} x2="620" y2={y} stroke="rgba(20,20,19,0.06)" />)}
          <path d="M 60 198.5 L 220 175.9 L 380 139.1 L 560 30 L 560 220 L 60 220 Z" fill="url(#fillGrad)" />
          <path d="M 60 198.5 L 220 175.9 L 380 139.1 L 560 30" fill="none" stroke="#c6613f" strokeWidth="2.5" />
          {[
            [60, 198.5, "$61.5B", "Mar 2025"],
            [220, 175.9, "$183B", "Sep 2025"],
            [380, 139.1, "$380B", "Feb 2026"],
            [560, 30, "$965B", "May 2026"],
          ].map(([x, y, value, date]) => (
            <g key={value}>
              <circle cx={x} cy={y} r="4.5" fill="#faf9f5" stroke="#c6613f" strokeWidth="2.5" />
              <text x={x} y={y - 14} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="13" fill="#141413" fontWeight="600">{value}</text>
              <text x={x} y="236" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10.5" fill="#758696">{date}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title, children }) {
  return (
    <div className="section-head mb-5">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="display-serif mt-2 mb-3">{title}</h2>
      <p className="text-fog fs-5 mb-0">{children}</p>
    </div>
  );
}

function CommitmentStats() {
  const { investorCount } = useDemandActivity(0);

  return (
    <div className="d-flex flex-wrap justify-content-center gap-4 gap-lg-5 mt-4">
      <div><strong className="text-success">{investorCount.toLocaleString()}</strong> <span>investors already in</span></div>
      <div><strong className="text-success">$2.3B</strong> <span>IPO commitments</span></div>
    </div>
  );
}

function DemandSection() {
  const { investorCount, recentPurchases } = useDemandActivity(5);
  const retailCount = Math.round(investorCount * 0.73);
  const institutionalCount = Math.round(investorCount * 0.2);
  const accreditedCount = investorCount - retailCount - institutionalCount;
  const demandStats = [
    ["Retail investors", retailCount.toLocaleString(), "73% of total buyers", "#22c55e"],
    ["Institutional", institutionalCount.toLocaleString(), "20% of total buyers", "#3b82f6"],
    ["Accredited", accreditedCount.toLocaleString(), "7% of total buyers", "#8b5cf6"],
    ["Avg. investment", "$14,980", "Per investor", "#f59e0b"],
  ];

  return (
    <section id="demand" className="demand-section">
      <div className="container">
        <SectionHead eyebrow="Live demand tracker" title={<span>Over <span className="text-success">{Math.floor(investorCount / 1000).toLocaleString()}k+ investors</span> have already secured their position</span>}>
          Real-time-style data showing the growing demand for Anthropic shares ahead of the IPO launch. The window is closing fast.
        </SectionHead>

        <div className="card social-proof-card text-white">
          <div className="card-body p-4 p-lg-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-4 text-center text-lg-start">
                <div className="big-number mono">{investorCount.toLocaleString()}</div>
                <div className="demand-label">Investors who have bought IPO shares</div>
                <div className="live-line mt-2"><span className="pulse-green">●</span> Live - updating in real time</div>
              </div>
              <div className="col-lg-4">
                <div className="d-flex justify-content-between small text-white-50 mb-2">
                  <span>Offering progress</span>
                  <span>64%</span>
                </div>
                <div className="progress demand-progress">
                  <div className="progress-bar bg-success" style={{ width: "64%" }} />
                </div>
                <div className="d-flex justify-content-between demand-scale mt-1">
                  <span>$0</span>
                  <span>$100B target</span>
                </div>
                <div className="row g-3 mt-3">
                  <div className="col-4"><strong>$64.2B</strong><span> committed</span></div>
                  <div className="col-4"><strong>28.4M</strong><span> shares sold</span></div>
                  <div className="col-4"><strong>Open</strong><span> access window</span></div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="small text-white-50 mb-2">Recent purchases</div>
                <div className="vstack">
                  {recentPurchases.map(([name, action, shares, type, time]) => (
                    <div className="feed-item" key={`${name}-${time}`}>
                      <span className="name">{name}</span>
                      <span className="action">{action}</span>
                      <span className="shares">{shares}</span>
                      <span className="badge type-badge">{type}</span>
                      <span className="time">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 mt-4">
          {demandStats.map(([label, value, note, color]) => (
            <div className="col-sm-6 col-lg-3" key={label}>
              <article className="card stat-card demand-stat h-100" style={{ borderTopColor: color }}>
                <div className="card-body p-4">
                  <span className="stat-label">{label}</span>
                  <strong className="stat-value mono d-block">{value}</strong>
                  <p className="mb-0">{note}</p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalBuyCta() {
  return (
    <section className="buy-section text-white text-center final-cta">
      <div className="container">
        <Eyebrow centered>Pre-launch window open</Eyebrow>
        <h2 className="display-serif mx-auto mt-3 mb-3">Anthropic IPO access is <span>open</span></h2>
        <p className="lead mx-auto mb-4">Secure your position now at the estimated price. Once the market opens, early access is gone.</p>
        <div className="d-flex flex-wrap justify-content-center gap-4">
          <BuyButton large />
          <a href="#facts" className="btn btn-outline-light rounded-pill fw-semibold px-4 d-inline-flex align-items-center">View prospectus</a>
        </div>
        <CommitmentStats />
        <p className="mono mb-0 mt-4 final-note">Estimated price: $94.20 · Expected launch price: $104.20 · Potential gain: +250%</p>
      </div>
    </section>
  );
}

function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { user, setSession } = useAuth();
  const [form, setForm] = useState({
    name: "",
    brokerageName: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const isSignup = mode === "signup";

  if (user) {
    return <Navigate to="/" replace />;
  }

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup && form.password !== form.confirmPassword) {
        toast.error("Passwords do not match.");
        setIsLoading(false);
        return;
      }

      const payload = isSignup
        ? {
          name: form.name,
          brokerageName: form.brokerageName,
          email: form.email,
          password: form.password,
        }
        : { email: form.email, password: form.password };
      const data = await apiRequest(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSession(data);
      toast.success(isSignup ? "Account created." : "Logged in.");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-6 col-xl-5">
            <div className="card auth-card">
              <div className="card-body p-4 p-md-5">
                <Eyebrow>{isSignup ? "Create account" : "Account login"}</Eyebrow>
                <h1 className="display-serif auth-title mt-2 mb-3">{isSignup ? "Sign up" : "Login"}</h1>
                <p className="text-fog mb-4">
                  {isSignup ? "Create your profile." : "Access your profile."}
                </p>
                <form onSubmit={handleSubmit}>
                  {isSignup && (
                    <>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="name">Full name</label>
                        <input id="name" name="name" className="form-control" value={form.name} onChange={updateForm} autoComplete="name" required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="brokerageName">Brokerage name</label>
                        <input id="brokerageName" name="brokerageName" className="form-control" value={form.brokerageName} onChange={updateForm} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="referralCode">Referral code <span className="text-fog">(optional)</span></label>
                        <input id="referralCode" name="referralCode" className="form-control" value={form.referralCode} onChange={updateForm} autoCapitalize="characters" placeholder="Referral code" />
                      </div>
                    </>
                  )}
                  <div className="mb-3">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={updateForm} autoComplete="email" required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label" htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" className="form-control" value={form.password} onChange={updateForm} autoComplete={isSignup ? "new-password" : "current-password"} minLength="8" required />
                  </div>
                  {isSignup && (
                    <div className="mb-4">
                      <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
                      <input id="confirmPassword" name="confirmPassword" type="password" className="form-control" value={form.confirmPassword} onChange={updateForm} autoComplete="new-password" minLength="8" required />
                    </div>
                  )}
                  <button className="btn btn-success btn-buy rounded-pill w-100" type="submit" disabled={isLoading}>
                    {isLoading ? "Working..." : isSignup ? "Create account" : "Login"}
                  </button>
                </form>
                <p className="text-fog text-center mt-4 mb-0">
                  {isSignup ? "Already have an account? " : "Need an account? "}
                  <Link to={isSignup ? "/login" : "/signup"}>{isSignup ? "Login" : "Sign up"}</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const { accessToken, isCheckingSession, logout, updateUser, user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    brokerageName: "",
    brokerageAccountNumber: "",
    bio: "",
    avatarUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        brokerageName: user.brokerageName || "",
        brokerageAccountNumber: user.brokerageAccountNumber || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  if (isCheckingSession) {
    return <main className="auth-page"><div className="container text-center text-fog">Checking session...</div></main>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const data = await apiRequest("/profile/me", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(form),
      });

      updateUser(data.user);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    toast.success("Logged out.");
    navigate("/login");
  }

  return (
    <main className="auth-page">
      <div className="container">
        <div className="row g-5 align-items-start">
          <div className="col-lg-5">
            <Eyebrow>Profile</Eyebrow>
            <h1 className="display-serif auth-title mt-2 mb-3">Your profile</h1>
            <p className="text-fog fs-5">Update your account details and profile.</p>
          </div>
          <div className="col-lg-7">
            <div className="card auth-card">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar">
                      {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <UserRound size={28} aria-hidden="true" />}
                    </div>
                    <div>
                      <h2 className="display-serif profile-name mb-0">{user.name}</h2>
                      <p className="text-fog mb-0">{user.email}</p>
                    </div>
                  </div>
                  <button className="btn btn-outline-dark rounded-pill d-inline-flex align-items-center justify-content-center gap-2" type="button" onClick={handleLogout}>
                    <LogOut size={17} aria-hidden="true" />
                    Logout
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="profileName">Full name</label>
                    <input id="profileName" name="name" className="form-control" value={form.name} onChange={updateForm} required />
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label" htmlFor="profileBrokerageName">Brokerage name</label>
                        <input id="profileBrokerageName" name="brokerageName" className="form-control" value={form.brokerageName} onChange={updateForm} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label" htmlFor="profileBrokerageAccountNumber">Brokerage account number</label>
                        <input id="profileBrokerageAccountNumber" name="brokerageAccountNumber" className="form-control" value={form.brokerageAccountNumber} onChange={updateForm} required />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="profileAvatar">Avatar URL</label>
                    <input id="profileAvatar" name="avatarUrl" type="url" className="form-control" value={form.avatarUrl} onChange={updateForm} placeholder="https://example.com/avatar.jpg" />
                  </div>
                  <div className="mb-4">
                    <label className="form-label" htmlFor="profileBio">Bio</label>
                    <textarea id="profileBio" name="bio" className="form-control" rows="4" value={form.bio} onChange={updateForm} maxLength="300" />
                  </div>
                  <button className="btn btn-success btn-buy rounded-pill px-4" type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save profile"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SharesPurchasedPage() {
  const { accessToken, isCheckingSession, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    setIsLoadingRequests(true);
    apiRequest("/payment-requests/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(({ requests: nextRequests }) => setRequests(nextRequests))
      .catch((error) => toast.error(error.message))
      .finally(() => setIsLoadingRequests(false));
  }, [accessToken]);

  if (isCheckingSession) {
    return <main className="auth-page"><div className="container text-center text-fog">Checking session...</div></main>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="auth-page">
      <div className="container">
        <div className="row g-5 align-items-start">
          <div className="col-lg-5">
            <Eyebrow>Portfolio</Eyebrow>
            <h1 className="display-serif auth-title mt-2 mb-3">Shares purchased</h1>
            <p className="text-fog fs-5">Track completed ANTP purchase records linked to your account.</p>
          </div>
          <div className="col-lg-7">
            <div className="card auth-card shares-card">
              <div className="card-body p-4 p-md-5">
                {!isLoadingRequests && requests.length === 0 && (
                  <div className="shares-empty">
                    <Rocket size={30} aria-hidden="true" />
                    <h2 className="display-serif profile-name mb-2">No purchases yet</h2>
                    <p className="text-fog mb-4">Your completed purchase records will appear here after payment review.</p>
                    <Link className="btn btn-success btn-buy rounded-pill px-4" to="/buy">Buy ANTP</Link>
                  </div>
                )}
                <div className="table-responsive mt-4">
                  <table className="table shares-table mb-0">
                    <thead>
                      <tr>
                        <th>Payment</th>
                        <th>Shares</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingRequests ? (
                        <tr>
                          <td colSpan="4" className="text-center text-fog py-4">Loading records...</td>
                        </tr>
                      ) : requests.length ? (
                        requests.map((request) => (
                          <tr key={request.id}>
                            <td>
                              <strong>{request.paymentAsset}</strong>
                              <span className="d-block text-fog small">{request.network}</span>
                              <span className="d-block mono small">{request.txHash}</span>
                            </td>
                            <td>{request.estimatedShares.toLocaleString()}</td>
                            <td><span className={`badge rounded-pill ${statusBadgeClass(request.status)}`}>{statusLabel(request.status)}</span></td>
                            <td>{formatDate(request.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-fog py-4">No records available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SellAntpPage() {
  const { accessToken, isCheckingSession, user } = useAuth();
  const [balance, setBalance] = useState({ approvedShares: 0, committedSellShares: 0, availableShares: 0 });
  const [requests, setRequests] = useState([]);
  const [shares, setShares] = useState("");
  const [brokerageName, setBrokerageName] = useState(user?.brokerageName || "");
  const [brokerageAccountNumber, setBrokerageAccountNumber] = useState(user?.brokerageAccountNumber || "");
  const [note, setNote] = useState("");
  const [isLoadingSell, setIsLoadingSell] = useState(true);
  const [isSubmittingSell, setIsSubmittingSell] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    setIsLoadingSell(true);
    apiRequest("/sell-requests/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(({ balance: nextBalance, requests: nextRequests }) => {
        setBalance(nextBalance);
        setRequests(nextRequests);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setIsLoadingSell(false));
  }, [accessToken]);

  useEffect(() => {
    if (user) {
      setBrokerageName(user.brokerageName || "");
      setBrokerageAccountNumber(user.brokerageAccountNumber || "");
    }
  }, [user]);

  if (isCheckingSession) {
    return <main className="auth-page"><div className="container text-center text-fog">Checking session...</div></main>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmittingSell(true);

    try {
      const data = await apiRequest("/sell-requests", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          brokerageAccountNumber,
          brokerageName,
          note,
          payoutMethod: "brokerage_account",
          shares: Number(shares),
        }),
      });

      setBalance(data.balance);
      setRequests((current) => [data.request, ...current]);
      setShares("");
      setNote("");
      toast.success("Sell request submitted for review.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmittingSell(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="container">
        <div className="row g-5 align-items-start">
          <div className="col-lg-5">
            <Eyebrow>Liquidity</Eyebrow>
            <h1 className="display-serif auth-title mt-2 mb-3">Sell ANTP</h1>
            <p className="text-fog fs-5">Submit a sell request for review using your approved ANTP balance.</p>
            <div className="sell-balance-panel mt-4">
              <span className="stat-label">Available to sell</span>
              <strong>{isLoadingSell ? "..." : balance.availableShares.toLocaleString()} ANTP</strong>
              <p className="text-fog mb-0">Approved: {balance.approvedShares.toLocaleString()} · In review/paid: {balance.committedSellShares.toLocaleString()}</p>
            </div>
          </div>
          <div className="col-lg-7">
            <form className="card auth-card" onSubmit={handleSubmit}>
              <div className="card-body p-4 p-md-5">
                <div className="mb-4">
                  <label className="form-label" htmlFor="sellShares">ANTP amount to sell</label>
                  <input className="form-control form-control-lg" id="sellShares" min="1" max={balance.availableShares || undefined} type="number" value={shares} onChange={(event) => setShares(event.target.value)} required />
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="payoutMethod">Payout method</label>
                  <input className="form-control form-control-lg" id="payoutMethod" value="Brokerage account" readOnly />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="mb-4">
                      <label className="form-label" htmlFor="sellBrokerageName">Brokerage name</label>
                      <input className="form-control form-control-lg" id="sellBrokerageName" value={brokerageName} onChange={(event) => setBrokerageName(event.target.value)} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-4">
                      <label className="form-label" htmlFor="sellBrokerageAccountNumber">Brokerage account</label>
                      <input className="form-control form-control-lg" id="sellBrokerageAccountNumber" value={brokerageAccountNumber} onChange={(event) => setBrokerageAccountNumber(event.target.value)} required />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="form-label" htmlFor="sellNote">Note</label>
                  <textarea className="form-control" id="sellNote" rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional message" />
                </div>

                <button className="btn btn-success btn-buy rounded-pill px-5 mt-4" type="submit" disabled={isSubmittingSell || isLoadingSell || balance.availableShares <= 0}>
                  {isSubmittingSell ? "Submitting..." : "Submit sell request"}
                </button>
              </div>
            </form>

            <div className="card auth-card mt-4">
              <div className="card-body p-4 p-md-5">
                <h2 className="display-serif profile-name mb-4">Sell request history</h2>
                <div className="table-responsive">
                  <table className="table shares-table mb-0">
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Payout</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingSell ? (
                        <tr><td colSpan="4" className="text-center text-fog py-4">Loading requests...</td></tr>
                      ) : requests.length ? (
                        requests.map((request) => (
                          <tr key={request.id}>
                            <td>{request.shares.toLocaleString()} ANTP</td>
                            <td>
                              <strong>{statusLabel(request.payoutMethod)}</strong>
                              <span className="d-block text-fog small">{request.brokerageName ? `${request.brokerageName} ${request.brokerageAccountNumber}` : "Brokerage account"}</span>
                            </td>
                            <td><span className={`badge rounded-pill ${statusBadgeClass(request.status)}`}>{statusLabel(request.status)}</span></td>
                            <td>{formatDate(request.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="text-center text-fog py-4">No sell requests yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function BuyIpoPage() {
  const { accessToken, isCheckingSession, user } = useAuth();
  const navigate = useNavigate();
  const { investorCount, recentPurchases } = useDemandActivity(3);
  const [paymentDestinations, setPaymentDestinations] = useState(defaultPaymentDestinations);
  const [amount, setAmount] = useState(5000);
  const [paymentAsset, setPaymentAsset] = useState("");
  const [network, setNetwork] = useState("");
  const [senderWallet, setSenderWallet] = useState("");
  const [txHash, setTxHash] = useState("");
  const [proofImage, setProofImage] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const estimatedPrice = 94.2;
  const cryptoRates = { USDT: 1, USDC: 1, ETH: 3200, BTC: 65000, SOL: 150 };
  const estimatedShares = Math.floor(Number(amount || 0) / estimatedPrice);
  const cryptoDue = paymentAsset ? Number(amount || 0) / cryptoRates[paymentAsset] : 0;
  const availableNetworks = paymentAsset ? Object.keys(paymentDestinations[paymentAsset] || {}) : [];
  const selectedNetwork = availableNetworks.includes(network) ? network : availableNetworks[0];
  const destination = paymentAsset && selectedNetwork
    ? paymentDestinations[paymentAsset]?.[selectedNetwork] || { address: "", qrCode: "" }
    : { address: "", qrCode: "" };

  useEffect(() => {
    if (!paymentAsset || !selectedNetwork) {
      setIsLoadingAddress(false);
      return undefined;
    }

    let isCancelled = false;

    setIsLoadingAddress(true);
    apiRequest("/payment-destinations")
      .then(({ destinations }) => {
        if (!isCancelled) {
          setPaymentDestinations(mergePaymentDestinations(destinations));
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setPaymentDestinations(defaultPaymentDestinations);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingAddress(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [paymentAsset, selectedNetwork]);

  useEffect(() => {
    if (!paymentAsset) {
      return;
    }

    if (!availableNetworks.includes(network)) {
      setNetwork(availableNetworks[0]);
    }
  }, [availableNetworks, network, paymentAsset]);

  if (isCheckingSession) {
    return <main className="auth-page"><div className="container text-center text-fog">Checking session...</div></main>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  function handleProofUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setProofImage(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!paymentAsset || !selectedNetwork || !destination.address) {
      toast.error("Select a payment method and network first.");
      return;
    }

    if (isLoadingAddress) {
      toast.error("Wait for the payment address to finish loading.");
      return;
    }

    setIsSubmittingPayment(true);

    try {
      await apiRequest("/payment-requests", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          amountUsd: Number(amount),
          cryptoDue,
          destinationAddress: destination.address,
          estimatedShares,
          network: selectedNetwork,
          paymentAsset,
          proofImage,
          senderWallet,
          txHash,
        }),
      });

      toast.success("Payment submitted for review.");
      setSenderWallet("");
      setTxHash("");
      setProofImage("");
      navigate("/shares");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmittingPayment(false);
    }
  }

  async function handleCopyWallet() {
    try {
      await navigator.clipboard.writeText(destination.address);
      toast.success("Wallet address copied.");
    } catch (error) {
      toast.error("Could not copy wallet address.");
    }
  }

  function handlePaymentAssetChange(nextAsset) {
    if (nextAsset === paymentAsset) {
      return;
    }

    setIsLoadingAddress(true);
    setNetwork("");
    setPaymentAsset(nextAsset);
  }

  function handleNetworkChange(nextNetwork) {
    if (nextNetwork === selectedNetwork) {
      return;
    }

    setIsLoadingAddress(true);
    setNetwork(nextNetwork);
  }

  return (
    <main className="buy-page">
      <section className="buy-page-hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <Eyebrow>Crypto checkout</Eyebrow>
              <h1 className="display-serif my-3">Buy ANTP with crypto.</h1>
              <p className="text-fog fs-5 mb-4">Choose a payment asset, review the payment instructions, and submit your transaction for review.</p>
              <div className="d-flex flex-wrap gap-3 mono small">
                <span className="buy-metric"><strong>$94.20</strong> estimated price</span>
                <span className="buy-metric"><strong>{paymentAsset || "Not selected"}</strong> payment asset</span>
                <span className="buy-metric"><strong>{selectedNetwork || "Select a method"}</strong></span>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card buy-summary-card">
                <div className="card-body p-4 p-lg-5">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                    <div>
                      <span className="stat-label">Live demand</span>
                      <strong className="display-serif buy-total d-block">{investorCount.toLocaleString()} investors</strong>
                    </div>
                    <span className="badge rounded-pill text-bg-success">64% filled</span>
                  </div>
                  <div className="progress demand-progress mb-4">
                    <div className="progress-bar bg-success" style={{ width: "64%" }} />
                  </div>
                  <div className="vstack gap-3">
                    {recentPurchases.map(([name, action, shares, type, time]) => (
                      <div className="buy-recent-purchase" key={`${name}-${time}`}>
                        <div>
                          <strong>{name}</strong>
                          <span>{action} {shares}</span>
                        </div>
                        <span className="badge rounded-pill text-bg-light">{type}</span>
                      </div>
                    ))}
                  </div>
                  <hr />
                  <p className="mono text-fog small mb-0">Do not send funds until a verified destination wallet is provided.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="buy-form-section">
        <div className="container">
          <form className="row g-5" onSubmit={handleSubmit}>
            <div className="col-lg-7 order-1">
              <div className="card buy-form-card">
                <div className="card-body p-4 p-lg-5">
                  <h2 className="display-serif mb-4">Payment details</h2>
                  <div className="mb-4">
                    <label className="form-label" htmlFor="investmentAmount">Purchase amount</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">$</span>
                      <input
                        className="form-control"
                        id="investmentAmount"
                        min="2000"
                        step="100"
                        type="number"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        required
                      />
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {[2000, 5000, 10000, 25000, 40000, 100000].map((preset) => (
                        <button className="btn btn-outline-dark btn-sm rounded-pill px-3" type="button" onClick={() => setAmount(preset)} key={preset}>
                          ${preset.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <CustomSelect
                      id="paymentAsset"
                      label="Payment method"
                      options={["USDT", "USDC", "ETH", "BTC", "SOL"]}
                      value={paymentAsset}
                      placeholder="Select payment method"
                      onChange={handlePaymentAssetChange}
                    />
                  </div>

                  <div className="mb-4">
                    <CustomSelect
                      id="network"
                      label="Network"
                      options={availableNetworks}
                      value={selectedNetwork}
                      placeholder={paymentAsset ? "Select network" : "Select payment method first"}
                      disabled={!paymentAsset}
                      onChange={handleNetworkChange}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label" htmlFor="accountEmail">Account email</label>
                    <input className="form-control form-control-lg" id="accountEmail" type="email" value={user.email} readOnly />
                  </div>

                  <div className="form-check mb-4">
                    <input className="form-check-input" id="acknowledgePayment" type="checkbox" required />
                    <label className="form-check-label" htmlFor="acknowledgePayment">
                      I understand this page does not process payment until an official wallet address is provided and verified.
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 order-2">
              <div className="card buy-side-card">
                <div className="card-body p-4">
                  <Eyebrow>Make payment</Eyebrow>
                  <div className="wallet-placeholder mt-4">
                    <span className="stat-label">{!paymentAsset || isLoadingAddress ? "Payment address" : `Send ${paymentAsset} to`}</span>
                    <div className="wallet-address-content">
                      {!paymentAsset ? (
                        <div className="wallet-empty">Select a payment method to view the address.</div>
                      ) : isLoadingAddress ? (
                        <div className="wallet-loading" role="status" aria-live="polite">
                          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                          <span>Loading payment address...</span>
                        </div>
                      ) : (
                        <div className="wallet-copy-row">
                          <strong>{destination.address}</strong>
                          <button className="wallet-copy-btn" type="button" onClick={handleCopyWallet} aria-label="Copy wallet address">
                            <Copy size={17} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="buy-preview-row"><span>Payment method</span><strong>{paymentAsset || "Not selected"}</strong></div>
                  <div className="buy-preview-row"><span>Network</span><strong>{selectedNetwork || "Not selected"}</strong></div>
                  <div className="buy-preview-row"><span>Crypto due</span><strong>{paymentAsset ? `${cryptoDue.toLocaleString(undefined, { maximumFractionDigits: paymentAsset === "BTC" || paymentAsset === "ETH" || paymentAsset === "SOL" ? 6 : 2 })} ${paymentAsset}` : "Not available"}</strong></div>
                  <div className="buy-preview-row"><span>ANTP estimate</span><strong>{estimatedShares.toLocaleString()} shares</strong></div>
                </div>
              </div>
              {/* <p className="text-fog small mt-3 mb-0">Use a verified wallet address only. This interface is a checkout design and does not broadcast transactions.</p> */}
            </div>
            <div className="col-lg-7 order-3">
              <div className="card buy-form-card">
                <div className="card-body p-4 p-lg-5">
                  <div className="payment-proof-panel mb-4">
                    <Eyebrow>After payment</Eyebrow>
                    <div className="mt-3">
                      <label className="form-label" htmlFor="senderWallet">Your sending wallet</label>
                      <input className="form-control form-control-lg" id="senderWallet" value={senderWallet} onChange={(event) => setSenderWallet(event.target.value)} placeholder="Wallet used to send payment" />
                    </div>
                    <div className="mt-3">
                      <label className="form-label" htmlFor="txHash">Transaction hash / TXID</label>
                      <input className="form-control form-control-lg" id="txHash" value={txHash} onChange={(event) => setTxHash(event.target.value)} placeholder="Paste the on-chain transaction hash" required />
                    </div>
                    <div className="mt-3">
                      <label className="form-label" htmlFor="proofImage">Receipt screenshot</label>
                      <input className="form-control form-control-lg" id="proofImage" type="file" accept="image/*" onChange={handleProofUpload} />
                      <div className="form-text">Optional. The transaction hash is still required.</div>
                    </div>
                  </div>

                  <button className="btn btn-success btn-buy rounded-pill px-5" type="submit" disabled={isSubmittingPayment || isLoadingAddress || !paymentAsset || !selectedNetwork}>
                    {isSubmittingPayment ? "Submitting..." : "Submit payment for review"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function AdminPaymentPage() {
  const { accessToken, isCheckingSession, user } = useAuth();
  const [paymentDestinations, setPaymentDestinations] = useState(defaultPaymentDestinations);
  const [adminKey, setAdminKey] = useState("");
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("Ethereum ERC-20");
  const [address, setAddress] = useState("");
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [reviewNote, setReviewNote] = useState("");
  const [sellRequests, setSellRequests] = useState([]);
  const [sellReviewNote, setSellReviewNote] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoadingSellReviews, setIsLoadingSellReviews] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const availableNetworks = Object.keys(paymentDestinations[asset]);
  const selectedNetwork = availableNetworks.includes(network) ? network : availableNetworks[0];

  useEffect(() => {
    apiRequest("/payment-destinations")
      .then(({ destinations }) => setPaymentDestinations(mergePaymentDestinations(destinations)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!availableNetworks.includes(network)) {
      setNetwork(availableNetworks[0]);
    }
  }, [availableNetworks, network]);

  useEffect(() => {
    const destination = paymentDestinations[asset][selectedNetwork];
    setAddress(destination.address || "");
  }, [asset, selectedNetwork, paymentDestinations]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await apiRequest("/payment-destinations", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-admin-secret": adminKey,
        },
        body: JSON.stringify({ asset, network: selectedNetwork, address }),
      });

      setPaymentDestinations((current) => ({
        ...current,
        [asset]: {
          ...current[asset],
          [selectedNetwork]: { address, qrCode: current[asset][selectedNetwork]?.qrCode || "" },
        },
      }));
      toast.success("Payment destination saved.");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function loadPaymentRequests() {
    setIsLoadingReviews(true);

    try {
      const data = await apiRequest("/payment-requests/admin", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-admin-secret": adminKey,
        },
      });

      setPaymentRequests(data.requests);
      toast.success("Payment reviews loaded.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoadingReviews(false);
    }
  }

  async function loadUsers() {
    setIsLoadingUsers(true);

    try {
      const data = await apiRequest("/users/admin", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-admin-secret": adminKey,
        },
      });

      setUsers(data.users);
      toast.success("Users loaded.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoadingUsers(false);
    }
  }

  async function updatePaymentStatus(requestId, status) {
    try {
      const data = await apiRequest(`/payment-requests/${requestId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-admin-secret": adminKey,
        },
        body: JSON.stringify({ status, reviewNote }),
      });

      setPaymentRequests((current) => current.map((request) => (request.id === requestId ? data.request : request)));
      setReviewNote("");
      toast.success(`Payment ${statusLabel(status)}.`);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function loadSellRequests() {
    setIsLoadingSellReviews(true);

    try {
      const data = await apiRequest("/sell-requests/admin", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-admin-secret": adminKey,
        },
      });

      setSellRequests(data.requests);
      toast.success("Sell reviews loaded.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoadingSellReviews(false);
    }
  }

  async function updateSellStatus(requestId, status) {
    try {
      const data = await apiRequest(`/sell-requests/${requestId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-admin-secret": adminKey,
        },
        body: JSON.stringify({ status, reviewNote: sellReviewNote }),
      });

      setSellRequests((current) => current.map((request) => (request.id === requestId ? data.request : request)));
      setSellReviewNote("");
      toast.success(`Sell request ${statusLabel(status)}.`);
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (isCheckingSession) {
    return <main className="auth-page"><div className="container text-center text-fog">Checking session...</div></main>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="auth-page admin-page">
      <div className="container">
        <div className="row g-5 align-items-start">
          <div className="col-lg-5">
            <Eyebrow>Admin</Eyebrow>
            <h1 className="display-serif auth-title mt-2 mb-3">Payment destinations</h1>
            <p className="text-fog fs-5">Add or update the wallet address shown on the Buy page for each crypto payment method.</p>
          </div>
          <div className="col-lg-7">
            <form className="card auth-card" onSubmit={handleSubmit}>
              <div className="card-body p-4 p-md-5">
                <div className="mb-4">
                  <label className="form-label" htmlFor="adminKey">Admin key</label>
                  <input className="form-control form-control-lg" id="adminKey" type="password" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} required />
                  <div className="form-text">This must match the private admin key configured on the server.</div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <CustomSelect
                      id="adminAsset"
                      label="Payment asset"
                      options={Object.keys(paymentDestinations)}
                      value={asset}
                      onChange={setAsset}
                    />
                  </div>
                  <div className="col-md-6">
                    <CustomSelect
                      id="adminNetwork"
                      label="Network"
                      options={availableNetworks}
                      value={selectedNetwork}
                      onChange={setNetwork}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="form-label" htmlFor="adminAddress">Wallet address</label>
                  <textarea className="form-control" id="adminAddress" rows="3" value={address} onChange={(event) => setAddress(event.target.value)} required />
                </div>

                <button className="btn btn-success btn-buy rounded-pill px-5 mt-4" type="submit">Save payment destination</button>
              </div>
            </form>

            <div className="card auth-card mt-4">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                  <div>
                    <Eyebrow>Users</Eyebrow>
                    <h2 className="display-serif profile-name mt-2 mb-0">New users</h2>
                  </div>
                  <button className="btn btn-outline-dark rounded-pill px-4" type="button" onClick={loadUsers} disabled={!adminKey || isLoadingUsers}>
                    {isLoadingUsers ? "Loading..." : "Load users"}
                  </button>
                </div>

                <div className="vstack gap-3">
                  {users.length ? (
                    users.map((registeredUser) => (
                      <div className="review-item" key={registeredUser.id}>
                        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                          <div>
                            <strong>{registeredUser.name || "User"}</strong>
                            <span className="d-block text-fog small">{registeredUser.email}</span>
                            <span className="d-block text-fog small">{registeredUser.brokerageName || "No brokerage added"}</span>
                          </div>
                          <span className={`badge rounded-pill ${registeredUser.isAdmin ? "text-bg-dark" : "text-bg-light"}`}>
                            {registeredUser.isAdmin ? "Admin" : "User"}
                          </span>
                        </div>
                        <div className="review-grid mt-3">
                          <span><strong>{formatDate(registeredUser.createdAt)}</strong> joined</span>
                          <span><strong>{formatDate(registeredUser.updatedAt)}</strong> updated</span>
                          <span><strong>{registeredUser.brokerageAccountNumber || "Not provided"}</strong> brokerage account</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-fog text-center py-4">Enter the admin key and load new users.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="card auth-card mt-4">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                  <div>
                    <Eyebrow>Review</Eyebrow>
                    <h2 className="display-serif profile-name mt-2 mb-0">Payment submissions</h2>
                  </div>
                  <button className="btn btn-outline-dark rounded-pill px-4" type="button" onClick={loadPaymentRequests} disabled={!adminKey || isLoadingReviews}>
                    {isLoadingReviews ? "Loading..." : "Load reviews"}
                  </button>
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="reviewNote">Review note</label>
                  <textarea className="form-control" id="reviewNote" rows="2" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Optional note for approve or reject" />
                </div>

                <div className="vstack gap-3">
                  {paymentRequests.length ? (
                    paymentRequests.map((request) => (
                      <div className="review-item" key={request.id}>
                        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                          <div>
                            <strong>{request.user?.name || "User"}</strong>
                            <span className="d-block text-fog small">{request.user?.email}</span>
                            <span className="d-block text-fog small">{request.user?.brokerageName} {request.user?.brokerageAccountNumber}</span>
                          </div>
                          <span className={`badge rounded-pill ${statusBadgeClass(request.status)}`}>{statusLabel(request.status)}</span>
                        </div>
                        <div className="review-grid mt-3">
                          <span><strong>${request.amountUsd.toLocaleString()}</strong> amount</span>
                          <span><strong>{request.estimatedShares.toLocaleString()}</strong> ANTP</span>
                          <span><strong>{request.paymentAsset}</strong> {request.network}</span>
                          <span><strong>{formatDate(request.createdAt)}</strong></span>
                        </div>
                        <div className="review-wallet mt-3">
                          <span>TXID</span>
                          <strong>{request.txHash}</strong>
                        </div>
                        {request.receivingWallet && (
                          <div className="review-wallet mt-2">
                            <span>Receiving wallet</span>
                            <strong>{request.receivingWallet}</strong>
                          </div>
                        )}
                        {request.senderWallet && (
                          <div className="review-wallet mt-2">
                            <span>Sending wallet</span>
                            <strong>{request.senderWallet}</strong>
                          </div>
                        )}
                        {request.proofImage && (
                          <a className="btn btn-outline-dark btn-sm rounded-pill mt-3" href={request.proofImage} target="_blank" rel="noreferrer">Open receipt</a>
                        )}
                        <div className="d-flex flex-wrap gap-2 mt-3">
                          <button className="btn btn-success btn-sm rounded-pill px-3" type="button" onClick={() => updatePaymentStatus(request.id, "approved")}>Approve</button>
                          <button className="btn btn-outline-danger btn-sm rounded-pill px-3" type="button" onClick={() => updatePaymentStatus(request.id, "rejected")}>Reject</button>
                          <button className="btn btn-outline-dark btn-sm rounded-pill px-3" type="button" onClick={() => updatePaymentStatus(request.id, "pending_review")}>Mark pending</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-fog text-center py-4">Enter the admin key and load payment submissions.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="card auth-card mt-4">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                  <div>
                    <Eyebrow>Sell review</Eyebrow>
                    <h2 className="display-serif profile-name mt-2 mb-0">Sell requests</h2>
                  </div>
                  <button className="btn btn-outline-dark rounded-pill px-4" type="button" onClick={loadSellRequests} disabled={!adminKey || isLoadingSellReviews}>
                    {isLoadingSellReviews ? "Loading..." : "Load sells"}
                  </button>
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="sellReviewNote">Sell review note</label>
                  <textarea className="form-control" id="sellReviewNote" rows="2" value={sellReviewNote} onChange={(event) => setSellReviewNote(event.target.value)} placeholder="Optional note for approve, reject, or paid" />
                </div>

                <div className="vstack gap-3">
                  {sellRequests.length ? (
                    sellRequests.map((request) => (
                      <div className="review-item" key={request.id}>
                        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                          <div>
                            <strong>{request.user?.name || "User"}</strong>
                            <span className="d-block text-fog small">{request.user?.email}</span>
                            <span className="d-block text-fog small">{request.user?.brokerageName} {request.user?.brokerageAccountNumber}</span>
                          </div>
                          <span className={`badge rounded-pill ${statusBadgeClass(request.status)}`}>{statusLabel(request.status)}</span>
                        </div>
                        <div className="review-grid mt-3">
                          <span><strong>{request.shares.toLocaleString()}</strong> ANTP</span>
                          <span><strong>{statusLabel(request.payoutMethod)}</strong> payout</span>
                          <span><strong>{request.brokerageName || "Brokerage"}</strong> {request.brokerageAccountNumber}</span>
                          <span><strong>{formatDate(request.createdAt)}</strong></span>
                        </div>
                        <div className="review-wallet mt-3">
                          <span>Brokerage account</span>
                          <strong>{request.brokerageName ? `${request.brokerageName} ${request.brokerageAccountNumber}` : "Not provided"}</strong>
                        </div>
                        {request.note && (
                          <div className="review-wallet mt-2">
                            <span>User note</span>
                            <strong>{request.note}</strong>
                          </div>
                        )}
                        <div className="d-flex flex-wrap gap-2 mt-3">
                          <button className="btn btn-success btn-sm rounded-pill px-3" type="button" onClick={() => updateSellStatus(request.id, "approved")}>Approve</button>
                          <button className="btn btn-primary btn-sm rounded-pill px-3" type="button" onClick={() => updateSellStatus(request.id, "paid")}>Mark paid</button>
                          <button className="btn btn-outline-danger btn-sm rounded-pill px-3" type="button" onClick={() => updateSellStatus(request.id, "rejected")}>Reject</button>
                          <button className="btn btn-outline-dark btn-sm rounded-pill px-3" type="button" onClick={() => updateSellStatus(request.id, "pending_review")}>Mark pending</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-fog text-center py-4">Enter the admin key and load sell requests.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function LandingPage() {
  return (
    <>
      <header id="top" className="hero py-5">
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="pill"><span className="live-dot" /> IPO launching soon - early access now open</span>
              <h1 className="display-serif my-4">The <span>biggest AI IPO</span> in history - secure your shares before the launch.</h1>
              <p className="text-fog fs-5">Anthropic has emerged as one of the most closely watched private technology companies in the world. The company, best known for its Claude family of artificial-intelligence models, has experienced extraordinary growth in valuation, funding and revenue. If Anthropic launches, it would become one of the largest technology IPOs ever.</p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <BuyButton />
                {/* <a href="#facts" className="btn btn-outline-dark rounded-pill fw-semibold px-4 d-inline-flex align-items-center">See the numbers</a> */}
              </div>
              <div className="ticker-row d-flex flex-wrap gap-3 mt-4 small">
                <span>Launching on NYSE</span>
                <span>Ticker: <strong>ANTP</strong></span>
                <span>Expected first-day pop: +250%</span>
              </div>
            </div>
            <div className="col-lg-6">
              <ValuationChart />
            </div>
          </div>
        </div>
      </header>

      <section id="buy" className="buy-section text-white text-center">
        <div className="container">
          <Eyebrow centered>Limited early access - closing soon</Eyebrow>
          <h2 className="display-serif mx-auto mt-3 mb-3">Buy Anthropic <span>before</span> the IPO launches</h2>
          <p className="lead mx-auto mb-4">The AI company that built Claude is going public. Early investors are securing their positions now, before the market opens and the price jumps.</p>
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4">
            <BuyButton large />
            <div className="quote-pill rounded-pill d-inline-flex align-items-center gap-3 px-4 py-3">
              <span className="mono">Estimated price</span>
              <strong>$94.20 <em>expected +250% at launch</em></strong>
            </div>
          </div>
          <CommitmentStats />
          <small className="mono d-block mt-3">Minimum investment: $2,000 · No lock-up period</small>
        </div>
      </section>

      <DemandSection />

      <section id="facts">
        <div className="container">
          <SectionHead eyebrow="Why invest now" title="This is your chance to get in before the world does">
            Anthropic has delivered staggering growth in private markets, and the IPO is expected to be one of the largest in tech history. Here's why early investors are moving now.
          </SectionHead>
          <div className="row g-3">
            {stats.map(([label, value, note]) => (
              <div className="col-sm-6 col-lg-3" key={label}>
                <article className="card stat-card h-100">
                  <div className="card-body p-4">
                    <span className="stat-label">{label}</span>
                    <strong className="stat-value d-block">{value}</strong>
                    <p className="mb-0">{note}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="growth">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <SectionHead eyebrow="The growth story" title="Revenue exploded 7x in 7 months">
                The original page frames annualized revenue as climbing from $9B to $65B, with future targets shown as projections.
              </SectionHead>
              <div className="card note-card">
                <div className="card-body p-4">
                  <p><strong>2025 revenue:</strong> $9B annualized</p>
                  <p><strong>2026 run-rate:</strong> $65B in July</p>
                  <p><strong>2026 target:</strong> $100B year-end</p>
                  <p className="mb-0"><strong>2028 projection:</strong> $190-200B</p>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="d-flex flex-column gap-4">
                {growth.map(([label, value, width, dashed]) => (
                  <div key={label}>
                    <div className="d-flex justify-content-between mono small mb-2">
                      <span className="text-fog">{label}</span>
                      <strong>{value}</strong>
                    </div>
                    <div className="progress">
                      <div className={`progress-bar ${dashed ? "progress-dashed" : ""}`} style={{ width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="timeline">
        <div className="container">
          <SectionHead eyebrow="Funding history" title="Four rounds, fourteen months, a 15x valuation increase">
            Anthropic's private-market valuation has increased dramatically.
          </SectionHead>
          <div className="row g-4">
            {rounds.map(([number, date, value, note]) => (
              <div className="col-md-6 col-lg-3" key={number}>
                <article className="card flat-card h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between mono small">
                      <span>{number}</span>
                      <time>{date}</time>
                    </div>
                    <strong className="display-serif d-block mt-3 mb-2">{value}</strong>
                    <p className="mb-0">{note}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="backers">
        <div className="container">
          <SectionHead eyebrow="Who's behind it" title="The world's smartest money is already in">
            Its investors include major institutions and technology companies
          </SectionHead>
          <div className="backer-marquee" aria-label="Backer logos">
            <div className="backer-marquee-track">
              {[...backers, ...backers].map(([backer, logo, url], index) => (
                <a className="backer-logo-card" href={url} target="_blank" rel="noreferrer" aria-label={`Open ${backer} official website`} key={`${backer}-${index}`}>
                  <img src={logo} alt={`${backer} logo`} />
                </a>
              ))}
            </div>
          </div>
          <p className="text-fog mt-4 mb-0 backer-note">Amazon and Google are described as strategic partners providing infrastructure for Claude.</p>
        </div>
      </section>

      <section id="ecosystem">
        <div className="container">
          <SectionHead eyebrow="The Anthropic flywheel" title="This isn't just an AI company - it's an ecosystem">
            Claude is framed as embedded in large enterprises, with a moat that grows through usage, infrastructure, and capital.
          </SectionHead>
          <div className="d-flex flex-wrap align-items-center gap-2 mono mb-5">
            {["AI models", "Claude", "enterprise customers", "cloud computing", "semiconductor infrastructure", "data centers", "institutional capital"].map((item, index, list) => (
              <React.Fragment key={item}>
                <span className="badge flywheel-badge rounded-1">{item}</span>
                {index < list.length - 1 && <ArrowRight size={16} aria-hidden="true" />}
              </React.Fragment>
            ))}
          </div>
          <div className="row g-4">
            {[
              ["Claude runs on", ["Amazon Web Services (primary)", "Google Cloud", "Microsoft Azure"]],
              ["Compute capacity agreements", ["Amazon (multi-year)", "Google (multi-year)", "Broadcom (chip supply)", "SpaceX (GPU capacity)"]],
            ].map(([title, items]) => (
              <div className="col-md-6" key={title}>
                <article className="card info-card h-100">
                  <div className="card-body p-4">
                    <Eyebrow>{title}</Eyebrow>
                    <ul className="list-unstyled fs-5 mb-0 mt-3">
                      {items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="math" className="math-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6">
              <SectionHead eyebrow="IPO details" title="How the offering is structured">
                The offering structure is designed for a limited pre-market allocation window.
              </SectionHead>
              <div className="card note-card bg-white">
                <div className="card-body p-4">
                  <p><strong>Offering size:</strong> $100B (5% of company)</p>
                  <p><strong>Price per share:</strong> $104.20</p>
                  <p><strong>Ticker:</strong> ANTP (NYSE)</p>
                  <p className="mb-0"><strong>Lock-up period:</strong> None listed for early access participants</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <SectionHead eyebrow="The valuation question" title="At $2T, the math still works">
                Against projected 2028 revenue of $200B, the implied multiple is 10x revenue.
              </SectionHead>
              <div className="vstack gap-3">
                {[
                  ["IPO valuation", "$2.0T"],
                  ["Projected 2028 revenue", "$200B"],
                  ["Implied revenue multiple", "10x"],
                ].map(([label, value]) => (
                  <div className="card valuation-card" key={label}>
                    <div className="card-body d-flex justify-content-between align-items-center gap-3 p-3">
                      <span className="text-fog">{label}</span>
                      <strong className="mono fs-5">{value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FinalBuyCta />
    </>
  );
}

function AppShell() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            className: "app-toast",
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ea384c",
                secondary: "#ffffff",
              },
            },
          }}
        />
        <NavBar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/shares" element={<SharesPurchasedPage />} />
          <Route path="/buy" element={<BuyIpoPage />} />
          <Route path="/sell" element={<SellAntpPage />} />
          <Route path="/admin" element={<AdminPaymentPage />} />
        </Routes>
        <footer className="site-footer">
          <div className="container">
            <p className="footer-copy mb-4">&copy; 2026 Anthropic PBC</p>
            <div className="footer-socials">
              <a href="https://www.linkedin.com/company/anthropicresearch" target="_blank" rel="noreferrer" aria-label="Anthropic on LinkedIn">
                <span className="footer-social-mark">in</span>
              </a>
              <a href="https://x.com/AnthropicAI" target="_blank" rel="noreferrer" aria-label="Anthropic on X">
                <X size={30} aria-hidden="true" />
              </a>
              <a href="https://www.youtube.com/@anthropic-ai" target="_blank" rel="noreferrer" aria-label="Anthropic on YouTube">
                <span className="footer-youtube-mark" aria-hidden="true"></span>
              </a>
            </div>
          </div>
        </footer>
      </AuthProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<AppShell />);
