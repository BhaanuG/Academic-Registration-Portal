import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  BookOpen,
  Boxes,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  X,
  ChevronRight,
} from "lucide-react";
import Brand from "../components/common/Brand";

import AdminDashboard from "./admin/DashboardPage";
import StudentsPage from "./admin/StudentsPage";
import FacultyPage from "./admin/FacultyPage";
import BucketsPage from "./admin/BucketsPage";
import CoursesPage from "./admin/CoursesPage";
import AdminProfilePage from "./admin/AdminProfilePage";
import AdminResetPasswordPage from "./admin/ResetPasswordPage";
import RecordModal from "./admin/RecordModal";
import {
  adminNavigation,
  resources,
  singularLabels,
  fields,
  normalizeForm,
} from "./admin/adminConfig";

const iconMap = {
  Dashboard: LayoutDashboard,
  Students: GraduationCap,
  Faculty: UserRound,
  Buckets: Boxes,
  Courses: BookOpen,
  "Reset-Password": KeyRound,
  "My-Profile": ShieldCheck,
};

export default function Admin() {
  const { pageName = "Dashboard" } = useParams();
  const navigate = useNavigate();
  const active = adminNavigation.some(([key]) => key === pageName) ? pageName : "Dashboard";
  const [admin, setAdmin] = useState(null);
  const [records, setRecords] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [status, setStatus] = useState("");
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [summary, setSummary] = useState({ students: [], faculty: [], buckets: [], courses: [] });
  const resource = resources[active];

  useEffect(() => {
    fetch("/portal-api/auth")
      .then((response) => response.json())
      .then((result) => {
        if (!result.ok || result.user.role !== "admin") navigate("/");
        else setAdmin(result.user);
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  const load = async () => {
    if (!resource) return;
    setLoadingRecords(true);
    try {
      const result = await fetch(`/portal-api/${resource}`).then((response) => response.json()).catch(() => ({ ok: false }));
      if (result && result.ok && Array.isArray(result.docs)) {
        setRecords(result.docs);
      } else {
        const localKey = `klef-admin-${resource}`;
        const localData = JSON.parse(localStorage.getItem(localKey) || "null");
        if (localData) {
          setRecords(localData);
        } else {
          let initial = [];
          if (resource === "students") {
            initial = [
              {
                id: "student-1",
                name: "Anirudh Varma",
                username: "2400030952",
                dateOfBirth: "2005-04-18",
                universityEmail: "2400030952@kluniversity.in",
                personalEmail: "anirudh.varma@gmail.com",
                mobileNumber: "9876543210",
                gender: "Male",
                aadhaarNumber: "1234 5678 9012",
                aapaarNumber: "APAAR-9876-5432",
                residencyStatus: "Hosteler",
                parentName: "K. R. Varma",
                parentPhoneNumber: "9876500000",
                cluster: "Cluster 2",
                counselor: {
                  name: "Dr. Arvind Rao",
                  employeeId: "KLEF1184",
                  designation: "Associate Professor",
                  mobileNumber: "9876541111",
                  email: "arvind.rao@kluniversity.in",
                },
                updatedAt: new Date().toISOString(),
              },
            ];
          } else if (resource === "faculty") {
            const { faculty: defaultFaculty } = require("../services/academicData");
            initial = defaultFaculty.map((f, i) => ({
              id: `fac-${i + 1}`,
              employeeId: f.id,
              facultyName: f.name,
              designation: f.designation,
              department: f.department,
              section: "S - 1",
              component: f.components,
              courseCode: "24CS3105",
              courseName: f.subjects[0] || "Core Course",
              updatedAt: new Date().toISOString(),
            }));
          } else if (resource === "buckets") {
            const { buckets: defaultBuckets } = require("../services/academicData");
            initial = defaultBuckets.map((b, i) => ({
              id: `bucket-${b.id}`,
              code: b.id,
              shortName: b.short,
              title: b.title,
              sortOrder: i + 1,
              active: true,
              updatedAt: new Date().toISOString(),
            }));
          } else if (resource === "courses") {
            const { buckets: defaultBuckets } = require("../services/academicData");
            initial = defaultBuckets.flatMap((b) =>
              b.subjects.map((s, idx) => ({
                id: `course-${b.id}-${idx}`,
                bucket: b.id,
                courseCode: s.code,
                name: s.name,
                credits: s.credits,
                lectureHours: s.ltps[0],
                tutorialHours: s.ltps[1],
                practicalHours: s.ltps[2],
                skillHours: s.ltps[3],
                components: s.components,
                description: s.description || "",
                prerequisite: s.prerequisite || "",
                active: true,
                updatedAt: new Date().toISOString(),
              })),
            );
          }
          localStorage.setItem(localKey, JSON.stringify(initial));
          setRecords(initial);
        }
      }
    } finally {
      setLoadingRecords(false);
    }
  };

  const loadBuckets = async () => {
    try {
      const result = await fetch("/portal-api/buckets").then((response) => response.json()).catch(() => ({ ok: false }));
      if (result && result.ok && Array.isArray(result.docs)) {
        setBuckets(result.docs);
      } else {
        const localBuckets = JSON.parse(localStorage.getItem("klef-admin-buckets") || "null");
        if (localBuckets) {
          setBuckets(localBuckets);
        } else {
          const { buckets: defaultBuckets } = require("../services/academicData");
          const initBuckets = defaultBuckets.map((b, i) => ({
            id: `bucket-${b.id}`,
            code: b.id,
            shortName: b.short,
            title: b.title,
            sortOrder: i + 1,
            active: true,
          }));
          setBuckets(initBuckets);
        }
      }
    } catch {
      // fallback
    }
  };

  const loadSummary = async () => {
    try {
      const [sRes, fRes, bRes, cRes] = await Promise.all([
        fetch("/portal-api/students").then((r) => r.json()).catch(() => ({ ok: false })),
        fetch("/portal-api/faculty").then((r) => r.json()).catch(() => ({ ok: false })),
        fetch("/portal-api/buckets").then((r) => r.json()).catch(() => ({ ok: false })),
        fetch("/portal-api/courses").then((r) => r.json()).catch(() => ({ ok: false })),
      ]);

      const getFallback = (key, defaultArr) => {
        const local = JSON.parse(localStorage.getItem(`klef-admin-${key}`) || "null");
        return local || defaultArr;
      };

      const { faculty: defaultFaculty, buckets: defaultBuckets } = require("../services/academicData");

      setSummary({
        students: sRes.ok && Array.isArray(sRes.docs) ? sRes.docs : getFallback("students", []),
        faculty: fRes.ok && Array.isArray(fRes.docs) ? fRes.docs : getFallback("faculty", defaultFaculty),
        buckets: bRes.ok && Array.isArray(bRes.docs) ? bRes.docs : getFallback("buckets", defaultBuckets),
        courses: cRes.ok && Array.isArray(cRes.docs) ? cRes.docs : getFallback("courses", defaultBuckets.flatMap((b) => b.subjects)),
      });
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    setStatus("");
    setQuery("");
    if (active === "Dashboard") {
      loadSummary();
    } else {
      load();
    }
    loadBuckets();
  }, [active]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      const searchFields = [
        r.name,
        r.username,
        r.facultyName,
        r.employeeId,
        r.title,
        r.code,
        r.courseCode,
        r.shortName,
      ].filter(Boolean);
      return searchFields.some((f) => String(f).toLowerCase().includes(q));
    });
  }, [records, query]);

  const beginCreate = () => {
    const initial = {};
    (fields[active] || []).forEach((field) => {
      initial[field.name] = field.type === "number" ? 0 : field.type === "checkbox" ? true : "";
    });
    setForm(initial);
    setEditing("new");
  };

  const beginEdit = (record) => {
    const initial = {};
    (fields[active] || []).forEach((field) => {
      const val = record[field.name];
      if (val !== undefined) {
        if (typeof val === "object" && val !== null) {
          initial[field.name] = val.id || val.code || "";
        } else {
          initial[field.name] = val;
        }
      } else {
        initial[field.name] = field.type === "number" ? 0 : field.type === "checkbox" ? true : "";
      }
    });
    setForm(initial);
    setEditing(record);
  };

  const save = async () => {
    const payloadData = normalizeForm(form, fields[active]);
    const method = editing === "new" ? "POST" : "PATCH";
    const body = editing === "new" ? payloadData : { id: editing.id, ...payloadData };

    const res = await fetch(`/portal-api/${resource}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((response) => response.json()).catch(() => ({ ok: false }));

    const localKey = `klef-admin-${resource}`;
    let currentList = JSON.parse(localStorage.getItem(localKey) || "null") || records;

    if (editing === "new") {
      const newRec = res.ok && res.doc ? res.doc : { id: `local-${Date.now()}`, ...payloadData, updatedAt: new Date().toISOString() };
      currentList = [newRec, ...currentList];
    } else {
      const updatedRec = res.ok && res.doc ? res.doc : { ...editing, ...payloadData, updatedAt: new Date().toISOString() };
      currentList = currentList.map((r) => (r.id === editing.id ? updatedRec : r));
    }

    localStorage.setItem(localKey, JSON.stringify(currentList));
    setRecords(currentList);
    setEditing(null);
    setStatus("Record saved successfully.");
  };

  const remove = async (record) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    await fetch(`/portal-api/${resource}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: record.id }),
    }).catch(() => {});

    const localKey = `klef-admin-${resource}`;
    const updatedList = records.filter((r) => r.id !== record.id);
    localStorage.setItem(localKey, JSON.stringify(updatedList));
    setRecords(updatedList);
    setStatus("Record deleted.");
  };

  const resetPassword = async (record) => {
    if (!record.dateOfBirth) return setStatus("Add a date of birth before resetting this password.");
    await fetch("/portal-api/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: record.id, dateOfBirth: record.dateOfBirth, resetPasswordToDob: true }),
    }).catch(() => {});
    localStorage.setItem(`klef-password-${record.username}`, record.dateOfBirth);
    setStatus(`Password for ${record.name} reset to their date of birth (${record.dateOfBirth}).`);
  };

  const logout = async () => {
    await fetch("/portal-api/auth", { method: "DELETE" });
    sessionStorage.clear();
    navigate("/");
  };

  if (!admin) return <main className="admin-loading">Verifying administrator access…</main>;

  return (
    <div className="admin-shell">
      {menuOpen && <button className="admin-sidebar-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`admin-sidebar ${menuOpen ? "open" : ""}`}>
        <button className="admin-sidebar-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={20} /></button>
        <div className="admin-sidebar-brand">
          <Brand compact />
        </div>
        <div className="admin-identity">
          <span>Central Administration</span>
          <strong>Academic Registration Portal</strong>
        </div>
        <nav className="admin-nav">
          {adminNavigation.map(([key, label]) => {
            const Icon = iconMap[key];
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setMenuOpen(false);
                  navigate(`/KLEF/3-2/Admin/G-Bhaanu-Sai/${key}`);
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="admin-nav-chevron" />}
              </button>
            );
          })}
        </nav>
        <button type="button" className="admin-logout" onClick={logout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-trigger" aria-label="Open navigation" onClick={() => setMenuOpen(true)}>
            <Menu size={21} />
          </button>
          
          <div className="admin-topbar-breadcrumb">
            <span className="text-slate-400">Workspace</span>
            <ChevronRight size={14} className="text-slate-400" />
            <strong className="text-slate-800">{active}</strong>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-user-info">
              <span>Authorized Administrator</span>
              <strong>{admin.name}</strong>
            </div>
            <div className="admin-avatar" title={admin.name}>
              {admin.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <button type="button" className="admin-topbar-logout" onClick={logout}>
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <div className="admin-content-area">
          {active === "Dashboard" && (
            <AdminDashboard
              summary={summary}
              onNavigate={(key) => navigate(`/KLEF/3-2/Admin/G-Bhaanu-Sai/${key}`)}
            />
          )}

          {active === "Students" && (
            <StudentsPage
              records={records}
              filtered={filtered}
              query={query}
              setQuery={setQuery}
              loading={loadingRecords}
              status={status}
              onRefresh={load}
              onAdd={beginCreate}
              onEdit={beginEdit}
              onDelete={remove}
              onResetPassword={resetPassword}
            />
          )}

          {active === "Faculty" && (
            <FacultyPage
              records={records}
              filtered={filtered}
              query={query}
              setQuery={setQuery}
              loading={loadingRecords}
              status={status}
              onRefresh={load}
              onAdd={beginCreate}
              onEdit={beginEdit}
              onDelete={remove}
            />
          )}

          {active === "Buckets" && (
            <BucketsPage
              records={records}
              filtered={filtered}
              query={query}
              setQuery={setQuery}
              loading={loadingRecords}
              status={status}
              onRefresh={load}
              onAdd={beginCreate}
              onEdit={beginEdit}
              onDelete={remove}
            />
          )}

          {active === "Courses" && (
            <CoursesPage
              records={records}
              filtered={filtered}
              query={query}
              setQuery={setQuery}
              loading={loadingRecords}
              status={status}
              onRefresh={load}
              onAdd={beginCreate}
              onEdit={beginEdit}
              onDelete={remove}
            />
          )}

          {active === "Reset-Password" && (
            <AdminResetPasswordPage />
          )}

          {active === "My-Profile" && (
            <AdminProfilePage admin={admin} />
          )}
        </div>
      </main>

      {editing && (
        <RecordModal
          editing={editing}
          active={active}
          singularLabel={singularLabels[active]}
          fields={fields[active]}
          form={form}
          setForm={setForm}
          buckets={buckets}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
