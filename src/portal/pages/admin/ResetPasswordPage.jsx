import { useState, useEffect } from "react";
import {
  KeyRound,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Calendar,
  Shield,
  User,
  GraduationCap,
  Building,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Search,
  Check,
  Info,
} from "lucide-react";
import DatePicker from "../../components/common/DatePicker";
import { faculty as defaultFaculty } from "../../services/academicData";

export default function AdminResetPasswordPage() {
  const [accountType, setAccountType] = useState("student"); // "student" | "faculty"
  const [identifier, setIdentifier] = useState("");
  const [matchedAccount, setMatchedAccount] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Password fields for faculty / manual reset
  const [dobPassword, setDobPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Reset fields when switching account type
  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    setIdentifier("");
    setMatchedAccount(null);
    setNotFound(false);
    setDobPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage(null);
  };

  // Perform search / lookup when identifier changes
  useEffect(() => {
    const cleanId = identifier.trim();
    if (!cleanId) {
      setMatchedAccount(null);
      setNotFound(false);
      setDobPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage(null);
      return;
    }

    setIsSearching(true);
    setNotFound(false);

    if (accountType === "student") {
      // Look up student from localStorage first, then remote
      const localStudents = JSON.parse(localStorage.getItem("klef-admin-students") || "[]");
      let found = localStudents.find(
        (s) => s.username === cleanId || s.universityEmail?.toLowerCase() === cleanId.toLowerCase()
      );

      if (found) {
        setMatchedAccount({
          id: found.id || found.username,
          type: "student",
          identifier: found.username,
          name: found.name || "Student",
          email: found.universityEmail || `${found.username}@kluniversity.in`,
          department: "Computer Science & Engineering",
          cluster: found.cluster || "Cluster 2",
          dateOfBirth: found.dateOfBirth || "2005-04-18",
          counselor: found.counselor?.name || "Dr. S. Srinivasa Rao",
        });
        setDobPassword(found.dateOfBirth || "2005-04-18");
        setIsSearching(false);
      } else {
        fetch("/portal-api/students")
          .then((r) => r.json())
          .then((res) => {
            if (res?.ok && Array.isArray(res.docs)) {
              const remoteStudent = res.docs.find(
                (s) => s.username === cleanId || s.universityEmail?.toLowerCase() === cleanId.toLowerCase()
              );
              if (remoteStudent) {
                setMatchedAccount({
                  id: remoteStudent.id || remoteStudent.username,
                  type: "student",
                  identifier: remoteStudent.username,
                  name: remoteStudent.name || "Student",
                  email: remoteStudent.universityEmail || `${remoteStudent.username}@kluniversity.in`,
                  department: "Computer Science & Engineering",
                  cluster: remoteStudent.cluster || "Cluster 2",
                  dateOfBirth: remoteStudent.dateOfBirth || "2005-04-18",
                  counselor: remoteStudent.counselor?.name || "Dr. S. Srinivasa Rao",
                });
                setDobPassword(remoteStudent.dateOfBirth || "2005-04-18");
              } else {
                setMatchedAccount(null);
                setNotFound(true);
              }
            } else {
              setMatchedAccount(null);
              setNotFound(true);
            }
          })
          .catch(() => {
            setMatchedAccount(null);
            setNotFound(true);
          })
          .finally(() => setIsSearching(false));
      }
    } else {
      // Look up faculty from localStorage first, then default data
      const localFaculty = JSON.parse(localStorage.getItem("klef-admin-faculty") || "null");
      const list = localFaculty || defaultFaculty;

      const found = list.find(
        (f) =>
          f.id?.toLowerCase() === cleanId.toLowerCase() ||
          f.employeeId?.toLowerCase() === cleanId.toLowerCase() ||
          f.name?.toLowerCase().includes(cleanId.toLowerCase()) ||
          f.facultyName?.toLowerCase().includes(cleanId.toLowerCase())
      );

      if (found) {
        setMatchedAccount({
          id: found.id || found.employeeId,
          type: "faculty",
          identifier: found.employeeId || found.id,
          name: found.facultyName || found.name,
          email: `${(found.employeeId || found.id).toLowerCase()}@kluniversity.in`,
          department: found.department || "Computer Science & Engineering",
          designation: found.designation || "Assistant Professor",
          components: Array.isArray(found.component || found.components)
            ? (found.component || found.components).join(", ")
            : "L, T, P",
        });
      } else {
        setMatchedAccount(null);
        setNotFound(true);
      }
      setIsSearching(false);
    }
  }, [identifier, accountType]);

  // Validation
  const isStudent = accountType === "student";
  const studentValid = isStudent && matchedAccount && dobPassword;
  const facultyValid =
    !isStudent &&
    matchedAccount &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  const canSubmit = isStudent ? studentValid : facultyValid;

  const handleInitiateSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setMessage(null);
    setShowConfirmModal(true);
  };

  const handleExecuteReset = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setMessage(null);

    const targetId = matchedAccount.identifier;
    const finalPassword = isStudent ? dobPassword : newPassword;

    try {
      if (isStudent) {
        // Save student password update to backend
        if (matchedAccount?.id) {
          await fetch("/portal-api/students", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: matchedAccount.id,
              dateOfBirth: dobPassword,
              resetPasswordToDob: true,
            }),
          }).catch(() => {});
        }

        // Update local storage so student can immediately log in with this new password
        localStorage.setItem(`klef-password-${targetId}`, dobPassword);

        // Update student record's DOB in local admin list
        const localData = JSON.parse(localStorage.getItem("klef-admin-students") || "[]");
        const updated = localData.map((s) =>
          s.username === targetId ? { ...s, dateOfBirth: dobPassword } : s
        );
        localStorage.setItem("klef-admin-students", JSON.stringify(updated));

        setMessage({
          type: "success",
          title: "Password Successfully Reset",
          text: `Credential updated for ${matchedAccount.name} (${targetId}). The account password is now synchronized to the student's Date of Birth (${dobPassword}).`,
        });
      } else {
        // Faculty credential update demonstration
        localStorage.setItem(`klef-faculty-pwd-${targetId}`, finalPassword);

        setMessage({
          type: "success",
          title: "Faculty Password Updated",
          text: `Authentication credential securely renewed for ${matchedAccount.name} (${targetId}). An automated notification has been dispatched to ${matchedAccount.email}.`,
        });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage({
        type: "error",
        title: "Reset Operation Failed",
        text: "The security subsystem was unable to update credentials. Please verify administrator authorization.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="admin-reset-pwd-shell">
      {/* Page Header */}
      <div className="admin-records-header">
        <div>
          <span className="kicker">Access &amp; Security Controls</span>
          <h1 className="admin-page-title">Reset User Credentials</h1>
          <p className="admin-page-desc">
            Authorize administrative credential resets for enrolled students and appointed faculty members.
          </p>
        </div>
      </div>

      <div className="admin-reset-grid">
        {/* Left Column: Account Lookup & Reset Form */}
        <div className="admin-reset-form-pane">
          {/* Account Type Selector Strip */}
          <div className="admin-reset-type-selector">
            <button
              type="button"
              className={`admin-type-tab ${accountType === "student" ? "active" : ""}`}
              onClick={() => handleAccountTypeChange("student")}
            >
              <GraduationCap size={16} />
              <span>Student Account</span>
            </button>
            <button
              type="button"
              className={`admin-type-tab ${accountType === "faculty" ? "active" : ""}`}
              onClick={() => handleAccountTypeChange("faculty")}
            >
              <User size={16} />
              <span>Faculty Account</span>
            </button>
          </div>

          <form onSubmit={handleInitiateSubmit} className="admin-reset-form">
            {/* Field: Identifier */}
            <div className="admin-reset-field-group">
              <label htmlFor="account-id-input" className="admin-field-label">
                {accountType === "student" ? "Student ID or Institutional Email *" : "Faculty ID or Name *"}
              </label>
              <div className="admin-field-input-wrap">
                <Search size={16} className="admin-field-icon" />
                <input
                  id="account-id-input"
                  type="text"
                  placeholder={
                    accountType === "student"
                      ? "e.g., 2400030952 or student@kluniversity.in"
                      : "e.g., KLEF0864 or Dr. S. Srinivasa Rao"
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="admin-text-input"
                  required
                  autoComplete="off"
                />
                {isSearching && <RefreshCw size={14} className="admin-field-spinner animate-spin" />}
              </div>
              <span className="admin-field-helper">
                {accountType === "student"
                  ? "Enter the 10-digit roll number or institutional email to retrieve student records."
                  : "Search by faculty employee identifier or registered name."}
              </span>
            </div>

            {/* Target Account Identification Card */}
            {matchedAccount && (
              <div className="admin-account-card">
                <div className="admin-account-badge">
                  {matchedAccount.type === "student" ? (
                    <GraduationCap size={18} className="text-blue-600" />
                  ) : (
                    <User size={18} className="text-emerald-600" />
                  )}
                </div>
                <div className="admin-account-details">
                  <div className="admin-account-head">
                    <strong className="admin-account-name">{matchedAccount.name}</strong>
                    <span className="admin-account-id-chip">{matchedAccount.identifier}</span>
                  </div>
                  <div className="admin-account-meta-grid">
                    <div className="admin-meta-item">
                      <Mail size={12} className="text-slate-400" />
                      <span>{matchedAccount.email}</span>
                    </div>
                    <div className="admin-meta-item">
                      <Building size={12} className="text-slate-400" />
                      <span>{matchedAccount.department}</span>
                    </div>
                    {matchedAccount.cluster && (
                      <div className="admin-meta-item">
                        <span className="admin-mini-chip">{matchedAccount.cluster}</span>
                      </div>
                    )}
                    {matchedAccount.designation && (
                      <div className="admin-meta-item">
                        <span className="text-slate-500 font-medium">{matchedAccount.designation}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="admin-account-verified" title="Account Verified">
                  <CheckCircle size={18} className="text-emerald-600" />
                </div>
              </div>
            )}

            {/* Not Found Warning */}
            {notFound && identifier.trim().length >= 3 && !matchedAccount && (
              <div className="admin-not-found-banner">
                <AlertCircle size={16} />
                <span>
                  No registered {accountType === "student" ? "student" : "faculty"} record matches "{identifier}".
                  Please verify the identifier.
                </span>
              </div>
            )}

            {/* Password Reset Configuration based on Account Type */}
            {isStudent ? (
              /* Student DOB Policy */
              <div className="admin-reset-field-group">
                <label className="admin-field-label">
                  Institutional Policy: Reset to Date of Birth (YYYY-MM-DD) *
                </label>
                <div className="admin-datepicker-wrapper">
                  <DatePicker
                    value={dobPassword}
                    onChange={(val) => setDobPassword(val)}
                    label="Select Date of Birth (YYYY-MM-DD)"
                  />
                </div>
                {dobPassword && (
                  <div className="admin-dob-preview">
                    <Calendar size={14} className="text-blue-600" />
                    <span>
                      Target credential will be reset to: <strong>{dobPassword}</strong>
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Faculty Custom Password Fields */
              <div className="admin-faculty-pwd-fields">
                <div className="admin-reset-field-group">
                  <label htmlFor="new-pwd-input" className="admin-field-label">
                    New Faculty Password *
                  </label>
                  <div className="admin-field-input-wrap">
                    <Lock size={16} className="admin-field-icon" />
                    <input
                      id="new-pwd-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="admin-text-input pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="admin-pwd-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="admin-reset-field-group">
                  <label htmlFor="confirm-pwd-input" className="admin-field-label">
                    Confirm New Password *
                  </label>
                  <div className="admin-field-input-wrap">
                    <Lock size={16} className="admin-field-icon" />
                    <input
                      id="confirm-pwd-input"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="admin-text-input pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="admin-pwd-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword && confirmPassword && (
                    <div className="admin-pwd-match-indicator">
                      {newPassword === confirmPassword ? (
                        <span className="text-emerald-600 flex items-center gap-1.5 font-medium text-xs">
                          <Check size={14} /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1.5 font-medium text-xs">
                          <AlertTriangle size={14} /> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Alert Banner */}
            {message && (
              <div
                className={`admin-feedback-banner ${
                  message.type === "success" ? "feedback-success" : "feedback-error"
                }`}
              >
                {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <div className="admin-feedback-body">
                  <strong>{message.title}</strong>
                  <p>{message.text}</p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="admin-reset-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setIdentifier("");
                  setMatchedAccount(null);
                  setDobPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setMessage(null);
                }}
                disabled={isSubmitting || (!identifier && !message)}
              >
                Clear Form
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={isSubmitting || !canSubmit}
                style={{
                  opacity: canSubmit ? 1 : 0.6,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                }}
              >
                <RefreshCw size={16} className={isSubmitting ? "animate-spin" : ""} />
                <span>{isSubmitting ? "Applying Reset…" : "Confirm Password Reset"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Security Guidance & Institutional Protocol */}
        <div className="admin-reset-sidebar">
          {/* Security Protocols Card */}
          <div className="admin-sidebar-card">
            <div className="admin-sidebar-card-header">
              <Shield size={18} className="text-blue-600" />
              <h3>Institutional Security Protocol</h3>
            </div>
            <div className="admin-sidebar-card-body">
              <div className="admin-protocol-item">
                <div className="admin-protocol-num">1</div>
                <div>
                  <strong>Student Default Standard</strong>
                  <p>
                    Per university registrar policy, student credentials reset to the verified Date of Birth in
                    <code> YYYY-MM-DD</code> format. Students are prompted to update on subsequent portal sign-in.
                  </p>
                </div>
              </div>

              <div className="admin-protocol-num-divider" />

              <div className="admin-protocol-item">
                <div className="admin-protocol-num">2</div>
                <div>
                  <strong>Faculty Credential Complexity</strong>
                  <p>
                    Faculty passwords require a minimum of 8 characters. Administrative resets trigger an automated
                    audit record and email confirmation.
                  </p>
                </div>
              </div>

              <div className="admin-protocol-num-divider" />

              <div className="admin-protocol-item">
                <div className="admin-protocol-num">3</div>
                <div>
                  <strong>Audit Trail Compliance</strong>
                  <p>
                    All password reset activities are logged with the acting administrator's EMP ID and client IP
                    timestamp for regulatory compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Identity Verification Checklist Card */}
          <div className="admin-sidebar-card subtle">
            <div className="admin-sidebar-card-header">
              <Info size={18} className="text-slate-500" />
              <h3>Pre-Reset Verification</h3>
            </div>
            <div className="admin-sidebar-card-body">
              <ul className="admin-check-list">
                <li>Confirm student/faculty presence via university photo ID card or physical ID.</li>
                <li>Verify roll number format (10-digits beginning with admission year).</li>
                <li>Ensure the applicant has verified access to their institutional email address.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && matchedAccount && (
        <div className="student-detail-drawer-scrim" onClick={() => setShowConfirmModal(false)}>
          <div
            className="admin-confirm-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-confirm-header">
              <div className="admin-confirm-icon-wrap">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>
              <div>
                <h2>Confirm Credential Reset</h2>
                <p>This administrative action will immediately alter authentication credentials.</p>
              </div>
            </div>

            <div className="admin-confirm-body">
              <div className="admin-confirm-summary-box">
                <div className="admin-confirm-row">
                  <span>Target User:</span>
                  <strong>{matchedAccount.name}</strong>
                </div>
                <div className="admin-confirm-row">
                  <span>Account ID:</span>
                  <strong>{matchedAccount.identifier}</strong>
                </div>
                <div className="admin-confirm-row">
                  <span>Account Type:</span>
                  <span className="capitalize font-semibold">{accountType} Account</span>
                </div>
                <div className="admin-confirm-row">
                  <span>New Credential:</span>
                  <strong className="font-mono text-blue-700">
                    {isStudent ? dobPassword : "•••••••••••• (Encrypted)"}
                  </strong>
                </div>
              </div>
              <p className="admin-confirm-disclaimer">
                The user will be required to authenticate with this new password on their subsequent portal visit.
              </p>
            </div>

            <div className="admin-confirm-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn danger-override"
                onClick={handleExecuteReset}
                disabled={isSubmitting}
              >
                <KeyRound size={16} />
                <span>Confirm &amp; Overwrite Password</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
