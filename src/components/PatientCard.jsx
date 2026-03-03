import React, { memo } from "react";

/* ── Highlight matched text ─────────────────────────── */
const HighlightText = ({ text, highlight }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex   = new RegExp(`(${escaped})`, "gi");
  const parts   = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="highlight">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
};

/* ── Avatar gradient by name ────────────────────────── */
const GRADIENTS = [
  ["#667eea","#764ba2"], ["#f093fb","#f5576c"],
  ["#4facfe","#00f2fe"], ["#43e97b","#38f9d7"],
  ["#fa709a","#fee140"], ["#a18cd1","#fbc2eb"],
  ["#fccb90","#d57eeb"], ["#a1c4fd","#c2e9fb"],
  ["#fd7043","#ff8a65"], ["#26c6da","#00acc1"],
];

const avatarStyle = (name) => {
  const [from, to] = GRADIENTS[name.charCodeAt(0) % GRADIENTS.length];
  return { background: `linear-gradient(135deg, ${from}, ${to})` };
};

/* ── PatientCard ────────────────────────────────────── */
const PatientCard = memo(({ patient, handleSelect, isSelected, searchTerm, viewMode, index }) => {
  console.log("Child Rendered:", patient.name);

  const initials = patient.name
    .split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  if (viewMode === "list") {
    return (
      <div
        className={`patient-row ${isSelected ? "patient-row--selected" : ""}`}
        onClick={() => handleSelect(patient)}
        style={{ animationDelay: `${index * 0.04}s` }}
      >
        <div className="row-avatar" style={avatarStyle(patient.name)}>{initials}</div>
        <div className="row-id">#{String(patient.id).padStart(3,"0")}</div>
        <div className="row-name">
          <HighlightText text={patient.name} highlight={searchTerm} />
        </div>
        <div className="row-email">
          <HighlightText text={patient.email} highlight={searchTerm} />
        </div>
        <div className="row-phone">{patient.phone}</div>
        <div className="row-hospital">
          <HighlightText text={patient.company.name} highlight={searchTerm} />
        </div>
        <div className="row-city">{patient.address.city}</div>
        <div className="row-action">
          <button
            className={`select-btn-sm ${isSelected ? "select-btn-sm--active" : ""}`}
            onClick={e => { e.stopPropagation(); handleSelect(patient); }}
          >
            {isSelected ? "✓" : "Select"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`patient-card ${isSelected ? "patient-card--selected" : ""}`}
      onClick={() => handleSelect(patient)}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {isSelected && <div className="selected-ribbon">✓ Selected</div>}

      {/* Top */}
      <div className="card-top">
        <div className="avatar" style={avatarStyle(patient.name)}>{initials}</div>
        <div className="card-badges">
          <div className="card-id">#{String(patient.id).padStart(3,"0")}</div>
          {isSelected && <div className="card-active-dot" />}
        </div>
      </div>

      {/* Body */}
      <div className="card-body">
        <h3 className="patient-name">
          <HighlightText text={patient.name} highlight={searchTerm} />
        </h3>
        <div className="info-row">
          <span className="info-icon">✉️</span>
          <span className="info-text email-text">
            <HighlightText text={patient.email} highlight={searchTerm} />
          </span>
        </div>
        <div className="info-row">
          <span className="info-icon">📞</span>
          <span className="info-text">{patient.phone}</span>
        </div>
        <div className="info-row">
          <span className="info-icon">🏥</span>
          <span className="info-text hospital-text">
            <HighlightText text={patient.company.name} highlight={searchTerm} />
          </span>
        </div>
        <div className="info-row">
          <span className="info-icon">📍</span>
          <span className="info-text">{patient.address.city}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer">
        <button
          className={`select-btn ${isSelected ? "select-btn--active" : ""}`}
          onClick={e => { e.stopPropagation(); handleSelect(patient); }}
        >
          {isSelected ? "✓ Deselect" : "View Details"}
        </button>
      </div>
    </div>
  );
});

export default PatientCard;