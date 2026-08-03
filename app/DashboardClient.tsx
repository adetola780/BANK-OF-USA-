"use client";

import { useClerk } from "@clerk/nextjs";
import { FormEvent, useMemo, useState } from "react";

type View = "overview" | "activity" | "documents" | "support" | "notifications" | "profile" | "security";
type Sender = "member" | "agent";
type TransactionFilter = "all" | "credit" | "debit" | "pending" | "completed";

type AuthenticatedViewer = {
  displayName: string;
  email: string;
  fullName: string | null;
};

type ChatMessage = {
  id: number;
  sender: Sender;
  body: string;
  time: string;
};

const transactions = [
  {
    id: 1,
    isoDate: "2026-08-02",
    date: "Aug 02",
    time: "09:42 AM",
    title: "Legacy portfolio dividend",
    detail: "Investment income",
    reference: "LL-849102",
    amount: "+$4,250.00",
    kind: "credit",
    status: "completed",
    balanceAfter: "$845,387.00",
    mark: "LP",
  },
  {
    id: 2,
    isoDate: "2026-07-28",
    date: "Jul 28",
    time: "02:16 PM",
    title: "Beneficiary document review",
    detail: "Estate services",
    reference: "LL-593870",
    amount: "−$850.00",
    kind: "debit",
    status: "completed",
    balanceAfter: "$841,137.00",
    mark: "BR",
  },
  {
    id: 3,
    isoDate: "2026-07-21",
    date: "Jul 21",
    time: "11:03 AM",
    title: "Estate distribution received",
    detail: "Harrington Family Trust",
    reference: "LL-302248",
    amount: "+$840,000.00",
    kind: "credit",
    status: "completed",
    balanceAfter: "$841,987.00",
    mark: "ED",
  },
  {
    id: 4,
    isoDate: "2026-07-14",
    date: "Jul 14",
    time: "08:30 AM",
    title: "Trust administration fee",
    detail: "Annual account service",
    reference: "LL-110495",
    amount: "−$1,125.00",
    kind: "debit",
    status: "completed",
    balanceAfter: "$1,987.00",
    mark: "TA",
  },
  {
    id: 5,
    isoDate: "2026-08-03",
    date: "Aug 03",
    time: "01:10 PM",
    title: "Estate tax review hold",
    detail: "Compliance review",
    reference: "LL-771205",
    amount: "−$275.00",
    kind: "debit",
    status: "pending",
    balanceAfter: "$845,387.00",
    mark: "ER",
  },
];

type NotificationItem = {
  id: number;
  title: string;
  detail: string;
  time: string;
  category: string;
  read: boolean;
};

const initialNotifications: NotificationItem[] = [
  { id: 1, title: "Account report updated", detail: "The final review has moved to 78% complete.", time: "12 minutes ago", category: "Report", read: false },
  { id: 2, title: "New support reply", detail: "Legacy Care responded to case LL-20317.", time: "1 hour ago", category: "Support", read: false },
  { id: 3, title: "Beneficiary statement ready", detail: "Your sample statement is available in Documents.", time: "Yesterday", category: "Document", read: true },
  { id: 4, title: "Recent sign-in", detail: "A preview session started from Windows desktop.", time: "Yesterday", category: "Security", read: true },
];

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "agent",
    body: "Welcome to Legacy Care. I’m Ava, your digital support concierge. How may I help with the inheritance account?",
    time: "10:02 AM",
  },
  {
    id: 2,
    sender: "member",
    body: "Could I have an update on my account report?",
    time: "10:04 AM",
  },
  {
    id: 3,
    sender: "agent",
    body: "Your report review is 78% complete. The beneficiary statement is ready, and the final compliance note is being prepared.",
    time: "10:05 AM",
  },
];

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "activity", label: "Transactions", icon: "↕" },
  { id: "documents", label: "Documents", icon: "▤" },
  { id: "support", label: "Support inbox", icon: "◌" },
  { id: "notifications", label: "Notifications", icon: "◇" },
  { id: "profile", label: "Profile", icon: "○" },
  { id: "security", label: "Security", icon: "⌾" },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <div className="brand-mark" aria-hidden="true">
        <span>LL</span>
      </div>
      <div className="brand-copy">
        <strong>Liberty Legacy Bank</strong>
        <span>Private inheritance banking</span>
      </div>
    </div>
  );
}

export default function DashboardClient({
  viewer,
}: {
  viewer: AuthenticatedViewer | null;
}) {
  const { signOut } = useClerk();
  const [view, setView] = useState<View>("overview");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [replyAs, setReplyAs] = useState<Sender>("member");
  const [messageDraft, setMessageDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [reportType, setReportType] = useState("Account report update");
  const [reportDetails, setReportDetails] = useState("");
  const [toast, setToast] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const viewerLabel = viewer?.displayName || "Signed-in viewer";
  const viewerFirstName = viewerLabel.includes("@") ? viewerLabel.split("@")[0] : viewerLabel.split(" ")[0];
  const viewerInitials = viewerLabel
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SV";

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = messageDraft.trim();
    if (!body) return;

    const next: ChatMessage = {
      id: Date.now(),
      sender: replyAs,
      body,
      time: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
    };
    setMessages((current) => [...current, next]);
    setMessageDraft("");

    if (replyAs === "member") {
      setIsTyping(true);
      window.setTimeout(() => {
        setMessages((current) => [
          ...current,
          {
            id: Date.now() + 1,
            sender: "agent",
            body: `Thanks, ${viewerFirstName}. I’ve added this to your account case. A Legacy Care specialist will review it and follow up in this conversation.`,
            time: "Just now",
          },
        ]);
        setIsTyping(false);
      }, 650);
    }
  }

  function handleAttachment(file?: File) {
    if (!file) return;
    if (!/\.(jpe?g|png|pdf)$/i.test(file.name)) {
      showToast("Choose a JPG, PNG, or PDF file for this prototype.");
      return;
    }
    setMessageDraft((current) => `${current}${current ? "\n" : ""}[Attached: ${file.name}]`);
    showToast(`${file.name} added locally to this message.`);
  }

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const details = reportDetails.trim() || "Please send me the latest status and next steps.";
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: "member",
        body: `${reportType}: ${details}`,
        time: "Just now",
      },
      {
        id: Date.now() + 1,
        sender: "agent",
        body: "Your request has been recorded under case LL-20317. We’ll keep the reply here so you can follow the full conversation.",
        time: "Just now",
      },
    ]);
    setReportDetails("");
    setReportOpen(false);
    setChatOpen(true);
  }

  function switchView(next: View) {
    setView(next);
    setMobileNavOpen(false);
  }

  if (!viewer) {
    return (
      <main className="login-page">
        <header className="login-header">
          <Brand />
          <span className="prototype-chip">🇺🇸 Non-operational prototype</span>
        </header>

        <section className="login-shell">
          <div className="login-story">
            <p className="eyebrow light">Private inheritance banking</p>
            <h1>A legacy deserves a thoughtful home.</h1>
            <p className="login-lede">
              A calm, clear place to follow your inheritance account, review its progress,
              and speak directly with a dedicated care team.
            </p>

            <div className="preview-balance" aria-label="Sample account preview">
              <div>
                <span>Inheritance account</span>
                <strong>$845,387.00</strong>
              </div>
              <span className="preview-status">Available</span>
            </div>

            <div className="login-points">
              <span><b>01</b> Clear account reporting</span>
              <span><b>02</b> Secure support conversation</span>
              <span><b>03</b> Organized estate documents</span>
            </div>
          </div>

          <div className="login-panel-wrap">
            <div className="login-card">
              <div className="login-card-heading">
                <span className="mini-mark" aria-hidden="true">L</span>
                <div>
                  <p className="eyebrow">Member access</p>
                  <h2>Welcome back</h2>
                </div>
              </div>
              <p className="login-note">Sign in through the protected OpenAI access screen. Your Google password is never shared with this prototype.</p>

              <p className="auth-provider-note">Return to the home page to sign in with a verified email address.</p>
            </div>
            <p className="legal-note">Non-operational prototype. No real accounts, funds, transfers, or credentials.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className={`app-shell ${darkMode ? "theme-dark" : ""}`}>
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div>
          <Brand />
          <nav className="main-nav" aria-label="Account navigation">
            <p>Private account</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={view === item.id ? "active" : ""}
                onClick={() => switchView(item.id)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
                {item.id === "support" && <i>2</i>}
                {item.id === "notifications" && unreadCount > 0 && <i>{unreadCount}</i>}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button className="profile-card" onClick={() => switchView("profile")}>
            <span className="avatar">{viewerInitials}</span>
            <span><b>{viewerLabel}</b><small>Authenticated viewer</small></span>
            <span aria-hidden="true">⋯</span>
          </button>
          <div className="prototype-stamp"><span>PROTOTYPE</span> No real funds or accounts</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="mobile-header">
          <Brand compact />
          <button className="menu-button" aria-label="Open navigation" onClick={() => setMobileNavOpen((current) => !current)}>☰</button>
        </header>

        <div className="content-frame">
          <header className="content-header">
            <div>
              <p className="eyebrow">{today}</p>
              <h1>{view === "overview" ? `Good afternoon, ${viewerFirstName}.` : navItems.find((item) => item.id === view)?.label}</h1>
            </div>
            <div className="header-actions">
              <span className="secure-label"><i /> Signed in as {viewer.email}</span>
              <button className="icon-button" aria-label="Notifications" onClick={() => switchView("notifications")}>♢{unreadCount > 0 && <b>{unreadCount}</b>}</button>
              <button className="outline-button signout-link" onClick={() => signOut({ redirectUrl: "/" })}>Sign out</button>
            </div>
          </header>

          {view === "overview" && (
            <Overview
              balanceVisible={balanceVisible}
              onToggleBalance={() => setBalanceVisible((current) => !current)}
              onReport={() => setReportOpen(true)}
              onViewAll={() => setView("activity")}
              onSupport={() => setChatOpen(true)}
              onUnavailable={() => showToast("Money movement is disabled in this non-operational prototype.")}
            />
          )}

          {view === "activity" && <Activity />}
          {view === "documents" && <Documents onToast={showToast} />}
          {view === "support" && (
            <SupportInbox
              messages={messages}
              replyAs={replyAs}
              setReplyAs={setReplyAs}
              draft={messageDraft}
              setDraft={setMessageDraft}
              sendMessage={sendMessage}
              onReport={() => setReportOpen(true)}
              isTyping={isTyping}
              onAttachment={handleAttachment}
            />
          )}
          {view === "notifications" && <Notifications notifications={notifications} setNotifications={setNotifications} />}
          {view === "profile" && <Profile onToast={showToast} viewer={viewer} />}
          {view === "security" && (
            <Security
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onToast={showToast}
              onSignOutAll={() => signOut({ redirectUrl: "/" })}
            />
          )}
        </div>
      </main>

      <button className={`chat-launcher ${chatOpen ? "chat-launcher-open" : ""}`} onClick={() => setChatOpen((current) => !current)} aria-label={chatOpen ? "Close support chat" : "Open support chat"}>
        {chatOpen ? "×" : "◌"}
        {!chatOpen && <span />}
      </button>

      {chatOpen && (
        <ChatPanel
          messages={messages}
          replyAs={replyAs}
          setReplyAs={setReplyAs}
          draft={messageDraft}
          setDraft={setMessageDraft}
          sendMessage={sendMessage}
          isTyping={isTyping}
          onAttachment={handleAttachment}
          onClose={() => setChatOpen(false)}
        />
      )}

      {reportOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setReportOpen(false)}>
          <form className="report-modal" onSubmit={submitReport} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" aria-label="Close report form" onClick={() => setReportOpen(false)}>×</button>
            <p className="eyebrow">Message Legacy Care</p>
            <h2>Report an account issue</h2>
            <p>Your note will appear in the support conversation, where the care team can reply.</p>
            <label>
              What is this about?
              <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
                <option>Account report update</option>
                <option>Transaction question</option>
                <option>Beneficiary documents</option>
                <option>Something else</option>
              </select>
            </label>
            <label>
              Tell us more
              <textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} placeholder="Add the details you’d like the care team to review…" rows={4} />
            </label>
            <button className="primary-button" type="submit">Send to customer care <span>→</span></button>
          </form>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function Overview({
  balanceVisible,
  onToggleBalance,
  onReport,
  onViewAll,
  onSupport,
  onUnavailable,
}: {
  balanceVisible: boolean;
  onToggleBalance: () => void;
  onReport: () => void;
  onViewAll: () => void;
  onSupport: () => void;
  onUnavailable: () => void;
}) {
  return (
    <div className="overview-grid">
      <section className="account-card">
        <div className="account-card-top">
          <span className="account-pill">Inheritance account • 3907</span>
          <button className="quiet-button" onClick={onToggleBalance}>{balanceVisible ? "Hide" : "Show"} balance</button>
        </div>
        <p>Available balance</p>
        <h2>{balanceVisible ? "$845,387.00" : "$•••,•••.••"}</h2>
        <div className="account-meta">
          <span><small>Account status</small><b><i /> Active</b></span>
          <span><small>Last updated</small><b>Today, 12:30 PM</b></span>
          <span><small>Account type</small><b>Estate beneficiary</b></span>
          <span><small>Customer ID</small><b>LLC-0845-3907</b></span>
        </div>
        <div className="account-actions">
          <button className="cream-button" onClick={onReport}>Report an issue <span>↗</span></button>
          <button className="dark-outline-button" onClick={onUnavailable}>Move money <span>→</span></button>
        </div>
        <div className="account-watermark" aria-hidden="true">L</div>
      </section>

      <aside className="progress-card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Estate administration</p>
            <h3>Account report</h3>
          </div>
          <span className="progress-number">78%</span>
        </div>
        <div className="progress-track"><span /></div>
        <ul className="milestones">
          <li className="complete"><span>✓</span><div><b>Beneficiary verified</b><small>Completed Jul 08</small></div></li>
          <li className="complete"><span>✓</span><div><b>Assets distributed</b><small>Completed Jul 21</small></div></li>
          <li className="current"><span>3</span><div><b>Final account review</b><small>In progress</small></div></li>
        </ul>
        <button className="link-button" onClick={onReport}>Ask about this report <span>→</span></button>
      </aside>

      <section className="summary-strip" aria-label="Account summary">
        <article><small>Available balance</small><b>$845,387.00</b><span>Current sample balance</span></article>
        <article><small>Total credits</small><b className="positive">$844,250.00</b><span>Across shown activity</span></article>
        <article><small>Total debits</small><b>$2,250.00</b><span>Including pending</span></article>
        <article><small>Transactions</small><b>5</b><span>Four completed</span></article>
        <article><small>Open conversations</small><b>1</b><span>Case LL-20317</span></article>
      </section>

      <section className="transactions-card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Latest activity</p>
            <h3>Recent transactions</h3>
          </div>
          <button className="link-button" onClick={onViewAll}>View all <span>→</span></button>
        </div>
        <div className="transaction-list">
          {transactions.slice(0, 3).map((transaction) => <Transaction key={transaction.title} {...transaction} />)}
        </div>
      </section>

      <aside className="care-card">
        <div className="care-avatar"><span>A</span><i /></div>
        <p className="eyebrow light">Your care team</p>
        <h3>Questions deserve a human answer.</h3>
        <p>Ava and the Legacy Care team are available to discuss your account report and documents.</p>
        <button className="cream-button" onClick={onSupport}>Open conversation <span>→</span></button>
        <small>Typical reply • under 5 minutes</small>
      </aside>
    </div>
  );
}

function Activity() {
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesFilter =
      filter === "all" ||
      transaction.kind === filter ||
      transaction.status === filter;
    const search = query.trim().toLowerCase();
    const matchesSearch =
      !search ||
      transaction.title.toLowerCase().includes(search) ||
      transaction.detail.toLowerCase().includes(search) ||
      transaction.reference.toLowerCase().includes(search);
    const matchesFrom = !fromDate || transaction.isoDate >= fromDate;
    const matchesTo = !toDate || transaction.isoDate <= toDate;
    return matchesFilter && matchesSearch && matchesFrom && matchesTo;
  });

  return (
    <section className="page-card activity-page">
      <div className="section-title-row page-card-heading">
        <div>
          <p className="eyebrow">Inheritance account • 3907</p>
          <h2>Account activity</h2>
          <p>Four sample transactions are shown in this non-operational prototype.</p>
        </div>
        <button className="outline-button" onClick={() => window.print()}>Print summary</button>
      </div>
      <div className="activity-summary">
        <span><small>Available</small><b>$845,387.00</b></span>
        <span><small>Credits shown</small><b className="positive">$844,250.00</b></span>
        <span><small>Debits shown</small><b>$2,250.00</b></span>
      </div>

      <div className="transaction-tools">
        <label className="transaction-search">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Description or reference" />
        </label>
        <label>
          <span>Status or type</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value as TransactionFilter)}>
            <option value="all">All transactions</option>
            <option value="credit">Credits</option>
            <option value="debit">Debits</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label><span>From</span><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
        <label><span>To</span><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
        <button type="button" className="filter-reset" onClick={() => { setFilter("all"); setQuery(""); setFromDate(""); setToDate(""); }}>Reset</button>
      </div>

      <div className="transaction-table-head" aria-hidden="true">
        <span>Transaction</span><span>Reference</span><span>Status</span><span>Balance after</span><span>Amount</span>
      </div>
      <div className="transaction-detail-list">
        {filteredTransactions.map((transaction) => <TransactionDetail key={transaction.id} transaction={transaction} />)}
        {filteredTransactions.length === 0 && <div className="empty-state"><b>No matching transactions</b><p>Try a different search term, filter, or date range.</p></div>}
      </div>
    </section>
  );
}

function Documents({ onToast }: { onToast: (message: string) => void }) {
  const documents = [
    ["Beneficiary statement", "PDF • 2 pages", "Ready"],
    ["Estate distribution notice", "PDF • 4 pages", "Ready"],
    ["Final account report", "Expected Aug 12", "In review"],
  ];
  return (
    <section className="page-card documents-page">
      <div className="page-card-heading">
        <p className="eyebrow">Estate documents</p>
        <h2>Everything in one place.</h2>
        <p>Review the sample files attached to this inheritance account.</p>
      </div>
      <div className="document-grid">
        {documents.map(([title, detail, status], index) => (
          <article className="document-card" key={title}>
            <div className="document-icon" aria-hidden="true">{index === 2 ? "⋯" : "✓"}</div>
            <span className={`document-status ${status === "Ready" ? "ready" : ""}`}>{status}</span>
            <h3>{title}</h3>
            <p>{detail}</p>
            <button className="link-button" onClick={() => onToast(status === "Ready" ? "Sample document preview opened." : "We’ll notify you when this report is ready.")}>
              {status === "Ready" ? "View document" : "Notify me"} <span>→</span>
            </button>
          </article>
        ))}
      </div>
      <div className="privacy-note"><span>i</span><p><b>Private by design</b> Documents in this prototype contain sample information only and are not legal or financial records.</p></div>
    </section>
  );
}

function SupportInbox({
  messages,
  replyAs,
  setReplyAs,
  draft,
  setDraft,
  sendMessage,
  onReport,
  isTyping,
  onAttachment,
}: {
  messages: ChatMessage[];
  replyAs: Sender;
  setReplyAs: (sender: Sender) => void;
  draft: string;
  setDraft: (draft: string) => void;
  sendMessage: (event: FormEvent<HTMLFormElement>) => void;
  onReport: () => void;
  isTyping: boolean;
  onAttachment: (file?: File) => void;
}) {
  const [rating, setRating] = useState(0);

  return (
    <div className="support-layout">
      <aside className="conversation-list">
        <p className="eyebrow">Messages</p>
        <h2>Support inbox</h2>
        <button className="conversation-item active">
          <span className="care-avatar small"><span>A</span><i /></span>
          <span><b>Account report <em className="conversation-status open">Open</em></b><small>Report review is 78% complete…</small></span>
          <time>Now</time>
        </button>
        <button className="conversation-item">
          <span className="conversation-symbol">D</span>
          <span><b>Estate documents <em className="conversation-status pending">Pending</em></b><small>Document review requested</small></span>
          <time>Jul 30</time>
        </button>
        <button className="conversation-item">
          <span className="conversation-symbol">V</span>
          <span><b>Beneficiary verification <em className="conversation-status resolved">Resolved</em></b><small>Identity check completed</small></span>
          <time>Jul 09</time>
        </button>
        <button className="outline-button full-button" onClick={onReport}>New conversation</button>
      </aside>
      <section className="inbox-thread">
        <div className="thread-header">
          <div><span className="care-avatar small"><span>A</span><i /></span><div><b>Legacy Care team</b><small><i /> Online • typically under 5 minutes</small></div></div>
          <div className="thread-meta"><span className="conversation-status open">Open</span><span className="case-label">Case LL-20317</span></div>
        </div>
        <MessageList messages={messages} isTyping={isTyping} />
        <div className="support-rating">
          <span>Rate this conversation</span>
          {[1, 2, 3, 4, 5].map((value) => <button key={value} className={rating >= value ? "active" : ""} onClick={() => setRating(value)} aria-label={`Rate ${value} out of 5`}>★</button>)}
          {rating > 0 && <small>Thank you</small>}
        </div>
        <MessageComposer replyAs={replyAs} setReplyAs={setReplyAs} draft={draft} setDraft={setDraft} sendMessage={sendMessage} onAttachment={onAttachment} />
      </section>
    </div>
  );
}

function ChatPanel({
  messages,
  replyAs,
  setReplyAs,
  draft,
  setDraft,
  sendMessage,
  isTyping,
  onAttachment,
  onClose,
}: {
  messages: ChatMessage[];
  replyAs: Sender;
  setReplyAs: (sender: Sender) => void;
  draft: string;
  setDraft: (draft: string) => void;
  sendMessage: (event: FormEvent<HTMLFormElement>) => void;
  isTyping: boolean;
  onAttachment: (file?: File) => void;
  onClose: () => void;
}) {
  return (
    <aside className="chat-panel" aria-label="Customer care chat">
      <div className="chat-header">
        <div><span className="care-avatar small"><span>A</span><i /></span><div><b>Legacy Care</b><small><i /> Online now</small></div></div>
        <button aria-label="Close chat" onClick={onClose}>×</button>
      </div>
      <MessageList messages={messages} isTyping={isTyping} compact />
      <MessageComposer replyAs={replyAs} setReplyAs={setReplyAs} draft={draft} setDraft={setDraft} sendMessage={sendMessage} onAttachment={onAttachment} compact />
    </aside>
  );
}

function MessageList({ messages, isTyping = false, compact = false }: { messages: ChatMessage[]; isTyping?: boolean; compact?: boolean }) {
  return (
    <div className={`message-list ${compact ? "message-list-compact" : ""}`} aria-live="polite">
      <div className="message-day"><span>Today</span></div>
      {messages.map((message) => (
        <div className={`message ${message.sender}`} key={message.id}>
          <span>{message.sender === "agent" ? "Legacy Care" : "Jordan"}</span>
          <p>{message.body}</p>
          <time>{message.time}</time>
        </div>
      ))}
      {isTyping && <div className="typing-indicator"><span /><span /><span /><small>Legacy Care is typing</small></div>}
    </div>
  );
}

function MessageComposer({
  replyAs,
  setReplyAs,
  draft,
  setDraft,
  sendMessage,
  onAttachment,
  compact = false,
}: {
  replyAs: Sender;
  setReplyAs: (sender: Sender) => void;
  draft: string;
  setDraft: (draft: string) => void;
  sendMessage: (event: FormEvent<HTMLFormElement>) => void;
  onAttachment: (file?: File) => void;
  compact?: boolean;
}) {
  return (
    <form className={`message-composer ${compact ? "message-composer-compact" : ""}`} onSubmit={sendMessage}>
      <div className="reply-switch" aria-label="Choose message sender">
        <span>Reply as</span>
        <button type="button" className={replyAs === "member" ? "active" : ""} onClick={() => setReplyAs("member")}>Member</button>
        <button type="button" className={replyAs === "agent" ? "active" : ""} onClick={() => setReplyAs("agent")}>Support team</button>
      </div>
      <div className="composer-row">
        <label className="attachment-button" aria-label="Attach JPG, PNG, or PDF">
          +
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => { onAttachment(event.target.files?.[0]); event.target.value = ""; }} />
        </label>
        <textarea rows={compact ? 2 : 3} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={replyAs === "agent" ? "Write a customer-care reply…" : "Write a message to customer care…"} />
        <button type="submit" aria-label="Send message">↑</button>
      </div>
      <small>Prototype conversation • messages stay only in this browser session</small>
    </form>
  );
}

function Notifications({
  notifications,
  setNotifications,
}: {
  notifications: NotificationItem[];
  setNotifications: (notifications: NotificationItem[]) => void;
}) {
  const unread = notifications.filter((notification) => !notification.read).length;
  return (
    <section className="page-card notifications-page">
      <div className="section-title-row page-card-heading">
        <div>
          <p className="eyebrow">Updates</p>
          <h2>Notifications</h2>
          <p>{unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You’re all caught up."}</p>
        </div>
        <button className="outline-button" onClick={() => setNotifications(notifications.map((notification) => ({ ...notification, read: true })))}>Mark all read</button>
      </div>
      <div className="notification-list">
        {notifications.map((notification) => (
          <button
            className={`notification-row ${notification.read ? "" : "unread"}`}
            key={notification.id}
            onClick={() => setNotifications(notifications.map((item) => item.id === notification.id ? { ...item, read: true } : item))}
          >
            <span className="notification-dot" />
            <span><small>{notification.category}</small><b>{notification.title}</b><em>{notification.detail}</em></span>
            <time>{notification.time}</time>
          </button>
        ))}
      </div>
    </section>
  );
}

function Profile({ onToast, viewer }: { onToast: (message: string) => void; viewer: AuthenticatedViewer }) {
  const nameParts = (viewer.fullName || viewer.displayName).split(" ").filter(Boolean);
  const [profile, setProfile] = useState({ firstName: nameParts[0] || "Viewer", lastName: nameParts.slice(1).join(" "), email: viewer.email, phone: "+1 (555) 013-3907", country: "United States" });
  const [photoName, setPhotoName] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [supportUpdates, setSupportUpdates] = useState(true);

  function updateField(field: keyof typeof profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="page-card profile-page">
      <div className="page-card-heading">
        <p className="eyebrow">Member profile</p>
        <h2>Your details</h2>
        <p>Changes remain only in this browser session.</p>
      </div>
      <div className="profile-layout">
        <aside className="identity-card">
          <div className="profile-avatar">JM</div>
          <h3>{profile.firstName} {profile.lastName}</h3>
          <p>Estate beneficiary</p>
          <label className="photo-control">Choose sample photo<input type="file" accept="image/jpeg,image/png" onChange={(event) => { const file = event.target.files?.[0]; if (file) setPhotoName(file.name); }} /></label>
          {photoName && <small>{photoName}</small>}
          <dl>
            <div><dt>Customer ID</dt><dd>LLC-0845-3907</dd></div>
            <div><dt>Account</dt><dd>•••• 3907</dd></div>
            <div><dt>Member since</dt><dd>July 8, 2026</dd></div>
          </dl>
        </aside>
        <form className="settings-form" onSubmit={(event) => { event.preventDefault(); onToast("Profile changes saved for this session."); }}>
          <div className="form-section-heading"><h3>Personal information</h3><p>Use sample information only.</p></div>
          <div className="form-grid">
            <label>First name<input value={profile.firstName} onChange={(event) => updateField("firstName", event.target.value)} /></label>
            <label>Last name<input value={profile.lastName} onChange={(event) => updateField("lastName", event.target.value)} /></label>
            <label>Email address<input type="email" value={profile.email} onChange={(event) => updateField("email", event.target.value)} /></label>
            <label>Phone number<input value={profile.phone} onChange={(event) => updateField("phone", event.target.value)} /></label>
            <label className="wide-field">Country<select value={profile.country} onChange={(event) => updateField("country", event.target.value)}><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Nigeria</option></select></label>
          </div>
          <div className="form-section-heading preference-heading"><h3>Notification preferences</h3></div>
          <label className="check-row"><input type="checkbox" checked={emailUpdates} onChange={(event) => setEmailUpdates(event.target.checked)} /><span><b>Email updates</b><small>Account report and document notices</small></span></label>
          <label className="check-row"><input type="checkbox" checked={supportUpdates} onChange={(event) => setSupportUpdates(event.target.checked)} /><span><b>Support replies</b><small>Conversation and case updates</small></span></label>
          <div className="form-actions"><button className="primary-button" type="submit">Save profile</button><button className="danger-link" type="button" onClick={() => onToast("Account-deletion requests are disabled in this prototype.")}>Request account deletion</button></div>
        </form>
      </div>
    </section>
  );
}

function Security({
  darkMode,
  setDarkMode,
  onToast,
  onSignOutAll,
}: {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onToast: (message: string) => void;
  onSignOutAll: () => void;
}) {
  const [twoFactor, setTwoFactor] = useState(false);
  const [currentPasscode, setCurrentPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");

  function submitPasscode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (currentPasscode !== "845387") return onToast("Enter the current sample passcode.");
    if (newPasscode.length < 6) return onToast("Use at least six characters for the sample passcode.");
    if (newPasscode !== confirmPasscode) return onToast("The new sample passcodes do not match.");
    setCurrentPasscode(""); setNewPasscode(""); setConfirmPasscode("");
    onToast("Sample passcode check completed. No credential was stored.");
  }

  return (
    <section className="page-card security-page">
      <div className="page-card-heading"><p className="eyebrow">Protection</p><h2>Security settings</h2><p>Controls on this page are session-local prototype interactions.</p></div>
      <div className="security-grid">
        <form className="security-card" onSubmit={submitPasscode}>
          <div className="settings-icon">⌁</div><h3>Change sample passcode</h3><p>Values are checked locally and never stored.</p>
          <label>Current sample passcode<input type="password" autoComplete="off" value={currentPasscode} onChange={(event) => setCurrentPasscode(event.target.value)} /></label>
          <label>New sample passcode<input type="password" autoComplete="off" value={newPasscode} onChange={(event) => setNewPasscode(event.target.value)} /></label>
          <label>Confirm sample passcode<input type="password" autoComplete="off" value={confirmPasscode} onChange={(event) => setConfirmPasscode(event.target.value)} /></label>
          <button className="primary-button" type="submit">Check change</button>
        </form>
        <div className="security-card">
          <div className="settings-icon">2F</div><h3>Two-factor authentication</h3><p>Add an extra sample verification step to the preview.</p>
          <label className="toggle-row"><span><b>Authenticator setting</b><small>{twoFactor ? "Enabled for this session" : "Not enabled"}</small></span><input type="checkbox" checked={twoFactor} onChange={(event) => { setTwoFactor(event.target.checked); onToast(event.target.checked ? "Two-factor preview enabled." : "Two-factor preview disabled."); }} /></label>
        </div>
        <div className="security-card">
          <div className="settings-icon">◐</div><h3>Appearance</h3><p>Switch between light and dark dashboard themes.</p>
          <label className="toggle-row"><span><b>Dark mode</b><small>{darkMode ? "On" : "Off"}</small></span><input type="checkbox" checked={darkMode} onChange={(event) => setDarkMode(event.target.checked)} /></label>
        </div>
      </div>
      <div className="session-card">
        <div className="section-title-row"><div><p className="eyebrow">Active sessions</p><h3>Recent login activity</h3></div><button className="outline-button" onClick={onSignOutAll}>Sign out</button></div>
        <div className="session-row"><span className="device-icon">▣</span><div><b>Windows desktop</b><small>Current preview session • Chrome-compatible browser</small></div><time>Active now</time></div>
        <div className="session-row"><span className="device-icon">▯</span><div><b>Mobile device</b><small>New York, United States • Sample activity</small></div><time>Aug 02, 8:14 PM</time></div>
      </div>
    </section>
  );
}

function TransactionDetail({ transaction }: { transaction: (typeof transactions)[number] }) {
  return (
    <article className="transaction-detail-row">
      <div className="transaction-main"><span className={`transaction-mark ${transaction.kind}`}>{transaction.mark}</span><span><b>{transaction.title}</b><small>{transaction.date}, {transaction.time} • {transaction.detail}</small></span></div>
      <span className="transaction-reference">{transaction.reference}</span>
      <span className={`transaction-status ${transaction.status}`}>{transaction.status}</span>
      <span className="transaction-balance">{transaction.balanceAfter}</span>
      <strong className={transaction.kind === "credit" ? "positive" : ""}>{transaction.amount}</strong>
    </article>
  );
}

function Transaction({ date, title, detail, reference, amount, kind, mark }: (typeof transactions)[number]) {
  return (
    <article className="transaction-row">
      <time>{date}</time>
      <span className={`transaction-mark ${kind}`}>{mark}</span>
      <div><b>{title}</b><small>{detail} • {reference}</small></div>
      <strong className={kind === "credit" ? "positive" : ""}>{amount}</strong>
    </article>
  );
}
