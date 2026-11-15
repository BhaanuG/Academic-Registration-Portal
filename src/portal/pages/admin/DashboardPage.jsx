import { BookOpen, Boxes, GraduationCap, UserRound, Plus, ArrowRight, ShieldCheck, Clock } from "lucide-react";

export default function AdminDashboard({ summary, onNavigate, onQuickCreate }) {
  const statCards = [
    { key: "Students", label: "Registered Students", count: summary.students.length, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
    { key: "Faculty", label: "Faculty Allocations", count: summary.faculty.length, icon: UserRound, color: "text-indigo-600", bg: "bg-indigo-50" },
    { key: "Buckets", label: "Curriculum Buckets", count: summary.buckets.length, icon: Boxes, color: "text-amber-600", bg: "bg-amber-50" },
    { key: "Courses", label: "Offered Courses", count: summary.courses.length, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <section className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <div>
          <span className="kicker">System Overview</span>
          <h1 className="admin-page-title">Registration Control Center</h1>
          <p className="admin-page-desc">
            Centralized monitoring for student enrollments, faculty component assignments, and active course curriculum.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-stat-grid">
        {statCards.map(({ key, label, count, icon: Icon, color, bg }) => (
          <div
            key={key}
            className="admin-stat-card"
            role="button"
            tabIndex={0}
            onClick={() => onNavigate(key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNavigate(key);
              }
            }}
          >
            <div className="stat-card-top">
              <div className={`stat-icon-wrap ${bg}`}>
                <Icon size={20} className={color} />
              </div>
              <span className="stat-open-link">
                <span>Manage</span>
                <ArrowRight size={14} />
              </span>
            </div>

            <div className="stat-card-bottom">
              <strong className="stat-count">{count}</strong>
              <span className="stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-split">
        {/* Recent Student Activity Panel */}
        <section className="admin-panel admin-recent-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="kicker">Student Directory</span>
              <h2>Recently Updated Students</h2>
            </div>
            <button
              type="button"
              className="secondary-btn btn-sm"
              onClick={() => onNavigate("Students")}
            >
              <span>View All Students</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="admin-recent-list">
            {summary.students.slice(0, 4).map((student) => (
              <div
                key={student.id}
                className="admin-recent-row"
                role="button"
                tabIndex={0}
                onClick={() => onNavigate("Students")}
              >
                <div className="admin-student-avatar">
                  {student.name?.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div className="admin-recent-info">
                  <strong>{student.name}</strong>
                  <small>{student.username} · {student.cluster || "Cluster 2"}</small>
                </div>
                <div className="admin-recent-badge">
                  <span>{student.residencyStatus || "Hosteler"}</span>
                </div>
              </div>
            ))}

            {!summary.students.length && (
              <div className="admin-empty-state">
                <Clock size={24} className="text-slate-400" />
                <p>No student records are currently registered in the database.</p>
              </div>
            )}
          </div>
        </section>

        {/* Common Quick Actions Panel */}
        <aside className="admin-panel admin-actions-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="kicker">Administration Tasks</span>
              <h2>Quick Actions</h2>
            </div>
          </div>

          <div className="admin-actions-list">
            <button
              type="button"
              className="admin-action-btn"
              onClick={() => (onQuickCreate ? onQuickCreate("Students") : onNavigate("Students"))}
            >
              <div className="action-icon-wrap bg-blue-50 text-blue-600">
                <Plus size={18} />
              </div>
              <div className="action-info">
                <strong>Create Student Profile</strong>
                <span>Add new student registration record</span>
              </div>
            </button>

            <button
              type="button"
              className="admin-action-btn"
              onClick={() => (onQuickCreate ? onQuickCreate("Faculty") : onNavigate("Faculty"))}
            >
              <div className="action-icon-wrap bg-indigo-50 text-indigo-600">
                <UserRound size={18} />
              </div>
              <div className="action-info">
                <strong>Allocate Faculty Member</strong>
                <span>Assign teaching components to courses</span>
              </div>
            </button>

            <button
              type="button"
              className="admin-action-btn"
              onClick={() => (onQuickCreate ? onQuickCreate("Buckets") : onNavigate("Buckets"))}
            >
              <div className="action-icon-wrap bg-amber-50 text-amber-600">
                <Boxes size={18} />
              </div>
              <div className="action-info">
                <strong>Manage Academic Buckets</strong>
                <span>Configure registration groups and limits</span>
              </div>
            </button>

            <button
              type="button"
              className="admin-action-btn"
              onClick={() => (onQuickCreate ? onQuickCreate("Courses") : onNavigate("Courses"))}
            >
              <div className="action-icon-wrap bg-emerald-50 text-emerald-600">
                <BookOpen size={18} />
              </div>
              <div className="action-info">
                <strong>Add Course Offering</strong>
                <span>Register new course in academic catalog</span>
              </div>
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
