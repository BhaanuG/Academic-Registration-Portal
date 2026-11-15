import { useRef, useState, useMemo } from "react";
import { toPng } from "html-to-image";
import PageHeading from "../components/common/PageHeading";
import { buckets, componentNames, faculty, getSubSectionFaculty, sectionBase, sectionFor } from "../services/academicData";
import { CheckCircle2, Download, Layers, ShieldCheck, AlertCircle } from "lucide-react";

export default function MyPreference({ selections, prefs, cluster }) {
  const tableRef = useRef(null);
  const [downloadState, setDownloadState] = useState("idle");

  const downloadTable = async () => {
    if (!tableRef.current || downloadState === "working") return;
    setDownloadState("working");
    try {
      const dataUrl = await toPng(tableRef.current, {
        backgroundColor: "#FFFFFF",
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = "KLEF-faculty-preferences.png";
      link.href = dataUrl;
      link.click();
      setDownloadState("idle");
    } catch {
      setDownloadState("error");
    }
  };

  const rows = useMemo(() => {
    return buckets
      .map((bucket) => {
        const subject = bucket.subjects.find((item) => item.code === selections[bucket.id]);
        return subject ? { bucket, subject } : null;
      })
      .filter(Boolean);
  }, [selections]);

  const totalPossibleComponents = useMemo(() => {
    return rows.reduce((acc, r) => acc + r.subject.components.length, 0);
  }, [rows]);

  const completedLecturePrefs = useMemo(() => {
    return rows.filter((r) => {
      const lPrefs = prefs[`${r.subject.code}-L`] || [];
      return lPrefs.filter(Boolean).length === 3;
    }).length;
  }, [rows, prefs]);

  const preferenceCell = (subject, component, rank) => {
    if (component === "L") {
      const facultyId = prefs[`${subject.code}-L`]?.[rank];
      const person = faculty.find((item) => item.id === facultyId);
      if (!person) {
        return (
          <div className="pref-cell-empty">
            <span>Rank {rank + 1} pending</span>
          </div>
        );
      }
      return (
        <div className="pref-cell-filled">
          <div className="pref-cell-top">
            <span className="pref-cell-sec">{sectionFor(subject.code, person.id, "L", cluster)}</span>
            <span className="pref-cell-rank">Choice {rank + 1}</span>
          </div>
          <strong>{person.name}</strong>
          <span className="pref-cell-empid">ID · {person.id}</span>
        </div>
      );
    }

    const lectureFacultyId = prefs[`${subject.code}-L`]?.[rank];
    const lectureFaculty = faculty.find((item) => item.id === lectureFacultyId);
    const baseSec = lectureFaculty ? sectionBase(sectionFor(subject.code, lectureFaculty.id, "L", cluster)) : null;

    if (!baseSec) {
      return (
        <div className="pref-cell-empty">
          <span>Set Lecture Pref {rank + 1}</span>
        </div>
      );
    }

    const subRanks = [1, 2, 3].map((subR) => {
      const key = `${subject.code}-${component}-L${rank + 1}-R${subR}`;
      const subCode = prefs[key];
      if (!subCode) return null;
      const subLetter = subCode.slice(-1);
      const fPerson = getSubSectionFaculty(subject.code, baseSec, subLetter, component);
      return {
        subRank: subR,
        subCode,
        faculty: fPerson,
      };
    }).filter(Boolean);

    if (!subRanks.length) {
      return (
        <div className="pref-cell-empty">
          <span>Sub-sections pending</span>
        </div>
      );
    }

    return (
      <div className="sub-ranked-grid">
        {subRanks.map((item) => (
          <div key={item.subRank} className="sub-ranked-chip">
            <div className="sub-chip-header">
              <span className="sub-chip-code">{item.subCode}</span>
              <span className="sub-chip-rank">Pref {item.subRank}</span>
            </div>
            <strong>{item.faculty ? item.faculty.name : "Faculty Member"}</strong>
            <span className="sub-chip-empid">{item.faculty ? `ID · ${item.faculty.id}` : ""}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <PageHeading
        title="My Preference"
        description="A consolidated, automatically saved view of your lecture preferences and corresponding sub-section rankings (A, B, C) for every selected course."
        aside={
          <button
            className="summary-download-btn"
            type="button"
            onClick={downloadTable}
            disabled={downloadState === "working"}
            title="Download preferences as PNG"
          >
            <Download size={15} />
            <span>{downloadState === "working" ? "Exporting PNG…" : "Download PNG"}</span>
          </button>
        }
      />

      {/* Metric / Status Strip */}
      <div className="summary-metrics-strip">
        <div className="metric-chip">
          <Layers size={18} className="text-blue-600" />
          <div>
            <span>Enrolled Subjects</span>
            <strong>{rows.length} Courses Selected</strong>
          </div>
        </div>

        <div className="metric-chip">
          <ShieldCheck size={18} className="text-emerald-600" />
          <div>
            <span>Lecture Rankings</span>
            <strong>{completedLecturePrefs} of {rows.length} Fully Ranked</strong>
          </div>
        </div>

        <div className="metric-chip">
          <CheckCircle2 size={18} className="text-indigo-600" />
          <div>
            <span>Academic Cohort</span>
            <strong>{cluster || "Cluster 2"}</strong>
          </div>
        </div>
      </div>

      <div className="my-preferences-container">
        <div className="my-preferences-table-wrap" ref={tableRef}>
          <div className="summary-print-header">
            <div>
              <h2>Koneru Lakshmaiah Education Foundation</h2>
              <p>Academic Registration Portal · Student Course &amp; Faculty Preferences</p>
            </div>
            <div className="print-cohort-tag">
              <span>Cohort: <strong>{cluster || "Cluster 2"}</strong></span>
            </div>
          </div>

          <table className="summary-table">
            <thead>
              <tr>
                <th style={{ width: "22%" }}>Subject &amp; Bucket</th>
                <th style={{ width: "12%" }}>Component</th>
                <th style={{ width: "22%" }}>1st Preference</th>
                <th style={{ width: "22%" }}>2nd Preference</th>
                <th style={{ width: "22%" }}>3rd Preference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ bucket, subject }) => (
                subject.components.map((component, compIdx) => (
                  <tr
                    key={`${subject.code}-${component}`}
                    className={`${compIdx === 0 ? "subject-group-start" : "subject-group-row"}`}
                  >
                    {compIdx === 0 && (
                      <td rowSpan={subject.components.length} className="subject-meta-cell">
                        <span className="summary-bucket-tag">{bucket.short}</span>
                        <strong>{subject.name}</strong>
                        <div className="summary-subject-sub">
                          <span>{subject.code}</span>
                          <span>·</span>
                          <span>{subject.credits} Credits</span>
                        </div>
                      </td>
                    )}
                    <td className="component-tag-cell">
                      <span className={`comp-pill comp-${component}`}>
                        {componentNames[component] || component}
                      </span>
                    </td>
                    <td>{preferenceCell(subject, component, 0)}</td>
                    <td>{preferenceCell(subject, component, 1)}</td>
                    <td>{preferenceCell(subject, component, 2)}</td>
                  </tr>
                ))
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="summary-empty-cell">
                    <AlertCircle size={24} className="text-slate-400 mb-2" />
                    <p>No subjects selected yet. Return to Subject Selection to register courses.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
