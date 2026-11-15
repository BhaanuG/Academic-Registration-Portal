import { readLocalRecord, writeLocalRecord } from "./api";

export function getPreferenceStorageKey(studentId) {
  return `klef-faculty-preferences-${studentId}`;
}

export function loadPreferences(studentId) {
  return readLocalRecord(getPreferenceStorageKey(studentId), {});
}

export function savePreferences(studentId, preferences) {
  writeLocalRecord(getPreferenceStorageKey(studentId), preferences);
  Object.entries(preferences).forEach(([key, values]) => {
    if (!Array.isArray(values)) return;
    const separator = key.lastIndexOf("-");
    const courseCode = key.slice(0, separator);
    const component = key.slice(separator + 1);
    const rankings = values.filter(Boolean).map((employeeId) => ({ employeeId }));
    if (!rankings.length) return;
    fetch("/portal-api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseCode, component, rankings }),
    }).catch(() => {});
  });
}
