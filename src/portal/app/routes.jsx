import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router";
import PortalShell from "../components/layout/PortalShell";
import { useAuth } from "../hooks/useAuth";
import { useSubjects } from "../hooks/useSubjects";
import AcademicOverview from "../pages/AcademicOverview";
import ClusterSelection from "../pages/ClusterSelection";
import Developer from "../pages/Developer";
import FacultyDirectory from "../pages/FacultyDirectory";
import FacultyPreferences from "../pages/FacultyPreferences";
import Login from "../pages/Login";
import MyPreferences from "../pages/MyPreferences";
import MyProfile from "../pages/MyProfile";
import ResetPassword from "../pages/ResetPassword";
import SubjectSelection from "../pages/SubjectSelection";
import Admin from "../pages/Admin";
import { loadPreferences, savePreferences } from "../services/preferenceService";
import { buckets, faculty, initialSelections } from "../services/academicData";
import { getStudentCluster, saveLastRoute, saveStudentCluster } from "../services/studentService";
import { portalPath, segmentPages } from "../utils/routes";

function PortalRoute() {
  const navigate = useNavigate();
  const { studentId = "", studentName = "Anirudh-Varma", pageName = "" } = useParams();
  const page = segmentPages[pageName] || "overview";
  const { studentId: authenticatedStudent, signOut } = useAuth();
  const { selections, setSelections } = useSubjects(studentId);
  const [preferences, setPreferences] = useState(() => loadPreferences(studentId));
  const [cluster, setCluster] = useState(() => getStudentCluster(studentId));
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/portal-api/buckets").then((response) => response.json()),
      fetch("/portal-api/courses").then((response) => response.json()),
      fetch("/portal-api/faculty").then((response) => response.json()),
      fetch("/portal-api/preferences").then((response) => response.json()),
    ]).then(([bucketResult, courseResult, facultyResult, preferenceResult]) => {
      if (bucketResult.ok && courseResult.ok) {
        const nextBuckets = bucketResult.docs.map((bucket) => ({
          id: bucket.code,
          databaseId: bucket.id,
          short: bucket.shortName,
          title: bucket.title,
          subjects: courseResult.docs
            .filter((course) => (typeof course.bucket === "object" ? course.bucket.id : course.bucket) === bucket.id && course.active !== false)
            .map((course) => ({
              id: course.id,
              code: course.courseCode,
              name: course.name,
              credits: course.credits,
              ltps: [course.lectureHours || 0, course.tutorialHours || 0, course.practicalHours || 0, course.skillHours || 0],
              components: course.components,
              description: course.description || "",
              prerequisite: course.prerequisite || "",
            })),
        }));
        buckets.splice(0, buckets.length, ...nextBuckets);
      }
      if (facultyResult.ok) {
        faculty.splice(0, faculty.length, ...facultyResult.docs.map((person) => ({
          databaseId: person.id,
          id: person.employeeId,
          name: person.facultyName,
          designation: person.designation || "Faculty",
          department: person.department || "Computer Science & Engineering",
          subjects: [person.courseName],
          components: person.component,
          allocation: `${person.section} · ${person.component.join(" / ")}`,
          section: person.section,
        })));
      }
      if (preferenceResult.ok && preferenceResult.docs.length) {
        const saved = {};
        preferenceResult.docs.forEach((preference) => {
          const courseCode =
            typeof preference.course === "object" ? preference.course.courseCode : "";
          if (!courseCode) return;
          saved[`${courseCode}-${preference.component}`] = preference.rankings
            .sort((a, b) => a.rank - b.rank)
            .map((ranking) =>
              typeof ranking.faculty === "object"
                ? ranking.faculty.employeeId
                : "",
            );
        });
        setPreferences((current) => ({ ...current, ...saved }));
      }
      setDataVersion((value) => value + 1);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    savePreferences(studentId, preferences);
  }, [preferences, studentId]);

  useEffect(() => {
    if (authenticatedStudent === studentId) saveLastRoute(window.location.pathname);
  }, [authenticatedStudent, page, studentId]);

  const setPage = (nextPage) => navigate(portalPath(studentId, studentName, nextPage));
  const content = useMemo(() => {
    if (page === "overview") return <AcademicOverview studentId={studentId} />;
    if (page === "cluster")
      return (
        <ClusterSelection
          cluster={cluster}
          setCluster={(nextCluster) => {
            setCluster(nextCluster);
            saveStudentCluster(studentId, nextCluster);
          }}
          goTo={setPage}
        />
      );
    if (page === "subjects")
      return (
        <SubjectSelection selections={selections} setSelections={setSelections} goTo={setPage} />
      );
    if (page === "preferences")
      return (
        <FacultyPreferences
          selections={selections}
          prefs={preferences}
          setPrefs={setPreferences}
          cluster={cluster || "Cluster 2"}
        />
      );
    if (page === "directory") return <FacultyDirectory cluster={cluster || "Cluster 2"} />;
    if (page === "my-preference")
      return (
        <MyPreferences
          selections={selections}
          prefs={preferences}
          cluster={cluster || "Cluster 2"}
          onResetAll={() => {
            setSelections(initialSelections);
            setPreferences({});
          }}
        />
      );
    return <MyProfile studentId={studentId} />;
  }, [cluster, dataVersion, page, preferences, selections, studentId]);

  if (authenticatedStudent !== studentId) return <Navigate to="/" replace />;

  return (
    <PortalShell
      page={page}
      setPage={setPage}
      studentId={studentId}
      onLogout={() => {
        fetch("/portal-api/auth", { method: "DELETE" }).catch(() => {});
        signOut();
        navigate("/");
      }}
    >
      {content}
    </PortalShell>
  );
}

export function PortalRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/KLEF/3-2/Developer/G-Bhaanu-Sai" element={<Developer />} />
      <Route path="/KLEF/3-2/Admin/G-Bhaanu-Sai/:pageName?" element={<Admin />} />
      <Route path="/KLEF/3-2/:studentId/:studentName/:pageName" element={<PortalRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
