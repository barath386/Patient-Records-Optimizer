import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import axios from "axios";
import PatientCard from "../components/PatientCard";
import "../styles/style.css";

const PATIENTS_PER_PAGE_OPTIONS = [4, 6, 8, 10];

const Dashboard = () => {
  const [patients, setPatients]               = useState([]);
  const [search, setSearch]                   = useState("");
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [lastRefreshed, setLastRefreshed]     = useState(null);
  const [showScrollBtn, setShowScrollBtn]     = useState(false);
  const [currentPage, setCurrentPage]         = useState(1);
  const [perPage, setPerPage]                 = useState(6);
  const [sortBy, setSortBy]                   = useState("name");
  const [viewMode, setViewMode]               = useState("grid"); // grid | list

  /* ── useRef ─────────────────────────────────────────── */
  const searchInputRef = useRef(null);
  const renderCountRef = useRef(0);
  const topRef         = useRef(null);
  const cardsRef       = useRef(null);
  renderCountRef.current += 1;

  useEffect(() => { searchInputRef.current?.focus(); }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollBtn(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Fetch ──────────────────────────────────────────── */
  const fetchPatients = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await axios.get("https://jsonplaceholder.typicode.com/users");
      setPatients(data);
      setLastRefreshed(new Date());
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to fetch patients");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  /* ── useCallback ────────────────────────────────────── */
  const refreshPatients = useCallback(() => fetchPatients(), [fetchPatients]);

  const handleSelect = useCallback((patient) => {
    setSelectedPatient(prev => prev?.id === patient.id ? null : patient);
  }, []);

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToCards = useCallback(() => {
    cardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    setTimeout(() => scrollToCards(), 100);
  }, [scrollToCards]);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  }, []);

  /* ── useMemo ────────────────────────────────────────── */
  const filteredPatients = useMemo(() => {
    const term = search.toLowerCase().trim();
    let result = !term ? patients : patients.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.company.name.toLowerCase().includes(term)
    );
    return [...result].sort((a, b) => {
      if (sortBy === "name")    return a.name.localeCompare(b.name);
      if (sortBy === "email")   return a.email.localeCompare(b.email);
      if (sortBy === "company") return a.company.name.localeCompare(b.company.name);
      if (sortBy === "id")      return a.id - b.id;
      return 0;
    });
  }, [patients, search, sortBy]);

  const totalPatients   = useMemo(() => patients.length, [patients]);
  const totalPages      = useMemo(() => Math.ceil(filteredPatients.length / perPage), [filteredPatients, perPage]);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredPatients.slice(start, start + perPage);
  }, [filteredPatients, currentPage, perPage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  const refreshedTime = useMemo(() => {
    if (!lastRefreshed) return "—";
    return lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }, [lastRefreshed]);

  const startRecord = useMemo(() => ((currentPage - 1) * perPage) + 1, [currentPage, perPage]);
  const endRecord   = useMemo(() => Math.min(currentPage * perPage, filteredPatients.length), [currentPage, perPage, filteredPatients]);

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="dashboard-wrapper" ref={topRef}>

      {/* ── Header ──────────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="header-glow header-glow--left" />
        <div className="header-glow header-glow--right" />
        <div className="header-content">
          <div className="header-left">
            <div className="header-logo">
              <span className="logo-icon">⚕️</span>
              <div className="logo-pulse" />
            </div>
            <div>
              <h1 className="header-title">Patient Records<br /><span className="title-accent">Optimization System</span></h1>
              <p className="header-sub">
                <span className="status-dot" /> Live Healthcare Dashboard
              </p>
            </div>
          </div>
          <div className="header-right">
            <div className="header-stat-pill">
              <span>👥</span>
              <strong>{totalPatients}</strong>
              <span>Patients</span>
            </div>
            <div className="header-stat-pill">
              <span>🕐</span>
              <strong>{refreshedTime}</strong>
              <span>Synced</span>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">

        {/* ── Controls Bar ────────────────────────────────── */}
        <section className="controls-bar">
          {/* Search */}
          <div className="search-wrapper">
            <span className="search-icon">🔎</span>
            <input
              ref={searchInputRef}
              className="search-input"
              type="text"
              placeholder="Search by name, email or hospital..."
              value={search}
              onChange={handleSearchChange}
            />
            {search && (
              <button className="clear-btn" onClick={() => { setSearch(""); setCurrentPage(1); }}>✕</button>
            )}
          </div>

          {/* Sort */}
          <div className="control-group">
            <label className="control-label">Sort</label>
            <select className="control-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}>
              <option value="id">By ID</option>
              <option value="name">By Name</option>
              <option value="email">By Email</option>
              <option value="company">By Hospital</option>
            </select>
          </div>

          {/* Per Page */}
          <div className="control-group">
            <label className="control-label">Show</label>
            <select className="control-select" value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              {PATIENTS_PER_PAGE_OPTIONS.map(n => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === "grid" ? "view-btn--active" : ""}`}
              onClick={() => setViewMode("grid")} title="Grid View"
            >⊞</button>
            <button
              className={`view-btn ${viewMode === "list" ? "view-btn--active" : ""}`}
              onClick={() => setViewMode("list")} title="List View"
            >☰</button>
          </div>

          {/* Refresh */}
          <button className="btn btn-refresh" onClick={refreshPatients} disabled={loading}>
            {loading ? <span className="spinner" /> : <span className="refresh-icon">🔄</span>}
            {loading ? "Syncing..." : "Refresh"}
          </button>
        </section>

        {/* ── Stats Row ───────────────────────────────────── */}
        <section className="stats-row">
          {[
            { icon: "👥", value: totalPatients,           label: "Total Patients",   color: "indigo" },
            { icon: "🔍", value: filteredPatients.length, label: "Filtered",         color: "cyan"   },
            { icon: "📄", value: totalPages,              label: "Pages",            color: "violet" },
            { icon: "⚙️", value: renderCountRef.current,  label: "Render Count",     color: "amber"  },
          ].map(({ icon, value, label, color }) => (
            <div className={`stat-pill stat-pill--${color}`} key={label}>
              <span className="stat-pill-icon">{icon}</span>
              <span className="stat-pill-value">{value}</span>
              <span className="stat-pill-label">{label}</span>
            </div>
          ))}
        </section>

        {/* ── Selected Patient Detail ──────────────────────── */}
        {selectedPatient && (
          <section className="selected-banner">
            <div className="selected-banner-header">
              <div className="selected-banner-title">
                <span>🩺</span> Selected Patient
              </div>
              <button className="deselect-btn" onClick={() => setSelectedPatient(null)}>✕ Deselect</button>
            </div>
            <div className="selected-banner-grid">
              {[
                ["👤 Name",     selectedPatient.name],
                ["✉️ Email",    selectedPatient.email],
                ["📞 Phone",    selectedPatient.phone],
                ["🏥 Hospital", selectedPatient.company.name],
                ["📍 City",     selectedPatient.address.city],
                ["🌐 Website",  selectedPatient.website],
              ].map(([label, value]) => (
                <div className="selected-field" key={label}>
                  <span className="field-label">{label}</span>
                  <span className="field-value">{value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Patient Cards Section ────────────────────────── */}
        <section className="cards-section" ref={cardsRef}>
          {/* Section Header */}
          <div className="cards-header">
            <div className="cards-title">
              <span>🗂️</span>
              Patient Records
              {search && (
                <span className="search-tag">"{search}"</span>
              )}
            </div>
            {!loading && filteredPatients.length > 0 && (
              <div className="records-info">
                Showing <strong>{startRecord}–{endRecord}</strong> of <strong>{filteredPatients.length}</strong>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="error-box">
              ⚠️ {error} —{" "}
              <button className="link-btn" onClick={refreshPatients}>Try again</button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className={viewMode === "grid" ? "patients-grid" : "patients-list"}>
              {Array.from({ length: perPage }).map((_, i) => (
                <div key={i} className={`skeleton-card ${viewMode === "list" ? "skeleton-card--list" : ""}`} />
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No patients found</h3>
              <p>No results for "{search}"</p>
              <button className="btn btn-outline" onClick={() => setSearch("")}>Clear Search</button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "patients-grid" : "patients-list"}>
              {paginatedPatients.map((patient, idx) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  handleSelect={handleSelect}
                  isSelected={selectedPatient?.id === patient.id}
                  searchTerm={search}
                  viewMode={viewMode}
                  index={idx}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Pagination ──────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <section className="pagination-section">
            <div className="pagination-info">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </div>

            <div className="pagination">
              {/* First */}
              <button
                className="page-btn page-btn--nav"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                title="First page"
              >«</button>

              {/* Prev */}
              <button
                className="page-btn page-btn--nav"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Previous page"
              >‹</button>

              {/* Page Numbers */}
              {pageNumbers.map((page, i) =>
                page === "..." ? (
                  <span key={`dots-${i}`} className="page-dots">···</span>
                ) : (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? "page-btn--active" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >{page}</button>
                )
              )}

              {/* Next */}
              <button
                className="page-btn page-btn--nav"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Next page"
              >›</button>

              {/* Last */}
              <button
                className="page-btn page-btn--nav"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                title="Last page"
              >»</button>
            </div>

            {/* Jump to page */}
            <div className="page-jump">
              <span>Go to</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                className="page-jump-input"
                placeholder={currentPage}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const val = Math.min(Math.max(1, Number(e.target.value)), totalPages);
                    handlePageChange(val);
                    e.target.value = "";
                  }
                }}
              />
              <span>of {totalPages}</span>
            </div>
          </section>
        )}

      </main>

      {/* ── Scroll To Top ───────────────────────────────── */}
      {showScrollBtn && (
        <button className="scroll-top-btn" onClick={scrollToTop} title="Scroll to top">
          ↑ <span>Top</span>
        </button>
      )}
    </div>
  );
};

export default Dashboard;