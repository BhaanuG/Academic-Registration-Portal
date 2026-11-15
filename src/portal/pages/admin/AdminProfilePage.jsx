import { useState, useEffect } from "react";
import {
  Shield,
  User,
  Mail,
  Phone,
  Building,
  KeyRound,
  CheckCircle,
  Clock,
  Lock,
  Pencil,
  X,
  Save,
  Check,
  AlertCircle,
  FileText,
  Activity,
  Award,
} from "lucide-react";

export default function AdminProfilePage({ admin }) {
  // Initial administrator details from props or defaults
  const [profile, setProfile] = useState({
    name: admin?.name || "G. Bhaanu Sai",
    username: admin?.username || "8897337687",
    email: "bhaanusai.g@kluniversity.in",
    personalEmail: "bhaanusai.admin@gmail.com",
    phone: "+91 88973 37687",
    designation: "Assistant Director of Academic Registration",
    department: "Office of the Registrar / Computer Science & Engineering",
    campus: "KLEF Green Fields, Vaddeswaram",
    role: "System Administrator",
    accessLevel: "Full Registration Central Administration",
    lastLogin: "Active Now",
    mfaStatus: "Enabled (TOTP / SMS)",
    sessionTimeout: "4 Hours",
    auditId: "ADM-SEC-8897",
  });

  // Load custom saved administrator contact details from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem("klef-admin-profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  // Editing state for allowable contact fields
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    personalEmail: "",
    phone: "",
    campus: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const startEdit = () => {
    setEditForm({
      personalEmail: profile.personalEmail,
      phone: profile.phone,
      campus: profile.campus,
    });
    setIsEditing(true);
    setFeedback(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFeedback(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const updated = {
      ...profile,
      personalEmail: editForm.personalEmail.trim() || profile.personalEmail,
      phone: editForm.phone.trim() || profile.phone,
      campus: editForm.campus.trim() || profile.campus,
    };

    // Save to local storage for persistence across reloads
    localStorage.setItem("klef-admin-profile", JSON.stringify(updated));
    setProfile(updated);

    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      setFeedback({
        type: "success",
        text: "Administrator contact preferences updated successfully.",
      });
      setTimeout(() => setFeedback(null), 4000);
    }, 400);
  };

  // Monogram initials
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 3)
    .join("");

  return (
    <section className="admin-profile-shell">
      {/* Header Banner */}
      <div className="admin-records-header">
        <div>
          <span className="kicker">Institutional Account</span>
          <h1 className="admin-page-title">Administrator Profile</h1>
          <p className="admin-page-desc">
            Manage your administrative identity credentials, contact preferences, and authoritative registration privileges.
          </p>
        </div>
        {!isEditing && (
          <button type="button" className="secondary-btn" onClick={startEdit}>
            <Pencil size={15} />
            <span>Edit Contact Info</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`admin-feedback-banner ${
            feedback.type === "success" ? "feedback-success" : "feedback-error"
          }`}
        >
          <CheckCircle size={18} />
          <div className="admin-feedback-body">
            <strong>{feedback.text}</strong>
          </div>
        </div>
      )}

      {/* Main Profile Grid */}
      <div className="admin-profile-grid">
        {/* Left Column: Primary Identity Card & Security Card */}
        <div className="admin-profile-main-col">
          {/* Identity Card */}
          <div className="admin-id-hero-card">
            <div className="admin-id-hero-top">
              <div className="admin-id-avatar-circle">
                <span>{initials}</span>
                <span className="admin-avatar-status-badge" title="Online and Authenticated" />
              </div>
              <div className="admin-id-hero-info">
                <div className="admin-id-hero-name-row">
                  <h2>{profile.name}</h2>
                  <span className="admin-badge-super">Central Admin</span>
                </div>
                <p className="admin-id-designation">{profile.designation}</p>
                <div className="admin-id-tag-list">
                  <span className="admin-tag-pill">
                    <Building size={12} />
                    {profile.department}
                  </span>
                  <span className="admin-tag-pill">
                    <Award size={12} />
                    ID: {profile.username}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-id-hero-divider" />

            <div className="admin-id-summary-stats">
              <div className="admin-stat-unit">
                <span>System Role</span>
                <strong>{profile.role}</strong>
              </div>
              <div className="admin-stat-unit">
                <span>Access Scope</span>
                <strong>{profile.accessLevel}</strong>
              </div>
              <div className="admin-stat-unit">
                <span>Account Status</span>
                <span className="admin-active-status-tag">
                  <Check size={12} /> Active &amp; Verified
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Professional Details */}
          <div className="admin-content-card">
            <div className="admin-card-header">
              <div className="admin-card-title-group">
                <User size={18} className="text-blue-600" />
                <h3>Contact &amp; Administrative Affiliation</h3>
              </div>
              {isEditing && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Editing Mode Active
                </span>
              )}
            </div>

            {!isEditing ? (
              <div className="admin-details-grid">
                <div className="admin-detail-item">
                  <dt>Full Name (Official)</dt>
                  <dd>{profile.name}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Employee / Admin ID</dt>
                  <dd className="font-mono">{profile.username}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Institutional Email</dt>
                  <dd>
                    <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
                      {profile.email}
                    </a>
                  </dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Personal Contact Email</dt>
                  <dd>{profile.personalEmail || "—"}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Contact Mobile</dt>
                  <dd>{profile.phone || "—"}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Campus Location</dt>
                  <dd>{profile.campus}</dd>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="admin-edit-contact-form">
                <div className="admin-form-row">
                  <div className="admin-reset-field-group">
                    <label className="admin-field-label">Institutional Email (System Locked)</label>
                    <input
                      type="text"
                      value={profile.email}
                      disabled
                      className="admin-text-input bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    <span className="admin-field-helper">Managed by university IT directory services.</span>
                  </div>

                  <div className="admin-reset-field-group">
                    <label htmlFor="personal-email-input" className="admin-field-label">
                      Personal / Recovery Email
                    </label>
                    <input
                      id="personal-email-input"
                      type="email"
                      value={editForm.personalEmail}
                      onChange={(e) => setEditForm({ ...editForm, personalEmail: e.target.value })}
                      className="admin-text-input"
                      placeholder="e.g., bhaanusai.admin@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-reset-field-group">
                    <label htmlFor="phone-input" className="admin-field-label">
                      Contact Mobile Number
                    </label>
                    <input
                      id="phone-input"
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="admin-text-input"
                      placeholder="+91 88973 37687"
                      required
                    />
                  </div>

                  <div className="admin-reset-field-group">
                    <label htmlFor="campus-input" className="admin-field-label">
                      Campus Office Location
                    </label>
                    <input
                      id="campus-input"
                      type="text"
                      value={editForm.campus}
                      onChange={(e) => setEditForm({ ...editForm, campus: e.target.value })}
                      className="admin-text-input"
                      placeholder="e.g., KLEF Green Fields, Vaddeswaram"
                      required
                    />
                  </div>
                </div>

                <div className="admin-edit-actions">
                  <button type="button" className="secondary-btn" onClick={cancelEdit} disabled={isSaving}>
                    <X size={15} />
                    <span>Cancel</span>
                  </button>
                  <button type="submit" className="primary-btn" disabled={isSaving}>
                    <Save size={15} />
                    <span>{isSaving ? "Saving Changes…" : "Save Contact Details"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Privileges, Security Status, & Audit Info */}
        <div className="admin-profile-side-col">
          {/* Security & Access Box */}
          <div className="admin-sidebar-card">
            <div className="admin-sidebar-card-header">
              <Shield size={18} className="text-emerald-600" />
              <h3>Security &amp; Authorization</h3>
            </div>
            <div className="admin-sidebar-card-body">
              <div className="admin-security-row">
                <div className="admin-sec-item">
                  <span className="admin-sec-label">Authentication Method</span>
                  <strong className="admin-sec-val">Password + Session Key</strong>
                </div>
                <span className="admin-badge-active">Standard</span>
              </div>

              <div className="admin-security-row">
                <div className="admin-sec-item">
                  <span className="admin-sec-label">Two-Factor Authentication</span>
                  <strong className="admin-sec-val">{profile.mfaStatus}</strong>
                </div>
                <span className="admin-badge-active">Protected</span>
              </div>

              <div className="admin-security-row">
                <div className="admin-sec-item">
                  <span className="admin-sec-label">Session Idle Timeout</span>
                  <strong className="admin-sec-val">{profile.sessionTimeout}</strong>
                </div>
                <span className="admin-badge-muted">Policy Compliant</span>
              </div>

              <div className="admin-security-row">
                <div className="admin-sec-item">
                  <span className="admin-sec-label">Security Audit Hash</span>
                  <strong className="admin-sec-val font-mono">{profile.auditId}</strong>
                </div>
                <span className="admin-badge-muted">Immutable</span>
              </div>
            </div>
          </div>

          {/* Active Administrative Entitlements */}
          <div className="admin-sidebar-card subtle">
            <div className="admin-sidebar-card-header">
              <Activity size={18} className="text-blue-600" />
              <h3>Assigned Entitlements</h3>
            </div>
            <div className="admin-sidebar-card-body">
              <ul className="admin-entitlement-list">
                <li>
                  <Check size={14} className="text-emerald-600" />
                  <span>Student registration roster &amp; cohort assignment</span>
                </li>
                <li>
                  <Check size={14} className="text-emerald-600" />
                  <span>Faculty component scheduling (L, T, P, S)</span>
                </li>
                <li>
                  <Check size={14} className="text-emerald-600" />
                  <span>Course bucket sequence &amp; curriculum catalog</span>
                </li>
                <li>
                  <Check size={14} className="text-emerald-600" />
                  <span>Student credential reset and recovery dispatch</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
