import { useState } from "react";
import PageHeading from "../components/common/PageHeading";
import { ArrowLeft, CheckCircle2, Info, Layers, Sparkles } from "lucide-react";

export default function ClusterSelection({ cluster, setCluster, goTo }) {
  const [pending, setPending] = useState(cluster || "Cluster 2");

  const clusters = [
    {
      id: "Cluster 1",
      name: "Cluster 1",
      range: "S1 — S50",
      description: "Section range 1 through 50 for primary cohort registrations.",
      recommended: false,
    },
    {
      id: "Cluster 2",
      name: "Cluster 2",
      range: "S51 — S100",
      description: "Section range 51 through 100 aligned with your specialization cohort.",
      recommended: true,
    },
  ];

  return (
    <>
      <PageHeading
        title="Cluster Selection"
        description="Confirm the section cluster assigned to your specialization before choosing semester subjects."
        aside={
          <div className="status-stamp">
            <span>SELECTED COHORT</span>
            <strong>{pending}</strong>
          </div>
        }
      />

      <section className="specialization-banner">
        <div className="specialization-tag">
          <Sparkles size={14} />
          <span>YOUR SPECIALIZATION COHORT</span>
        </div>
        <strong>Generative AI for Agentic and Multi-Modal Intelligence</strong>
      </section>

      <div className="cluster-grid">
        {clusters.map((item) => {
          const selected = pending === item.name;
          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              className={`cluster-card ${selected ? "selected" : ""}`}
              onClick={() => setPending(item.name)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPending(item.name);
                }
              }}
            >
              <div className="cluster-card-header">
                <span className="cluster-icon" aria-hidden="true">
                  <Layers size={20} className={selected ? "text-amber-600" : "text-stone-400"} />
                </span>
                {selected && (
                  <span className="cluster-check">
                    <CheckCircle2 size={18} className="text-amber-600" />
                  </span>
                )}
              </div>

              <div className="cluster-body">
                <strong>{item.name}</strong>
                <div className="cluster-range-pill">
                  <span>Section range</span>
                  <em>{item.range}</em>
                </div>
                <p className="cluster-desc">{item.description}</p>
              </div>

              {item.recommended && (
                <div className="cluster-badge">
                  <span>Recommended for your specialization</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="cluster-notice">
        <div className="notice-icon-wrap">
          <Info size={17} className="text-amber-600" />
        </div>
        <span>
          Your cluster is based on your specialization cohort. All course buckets will display faculty
          and section allocations from this cluster only.
        </span>
      </div>

      <div className="cluster-actions">
        <button
          type="button"
          className="secondary-btn"
          onClick={() => goTo("overview")}
        >
          <ArrowLeft size={16} />
          <span>Back to Overview</span>
        </button>
        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            setCluster(pending);
            goTo("subjects");
          }}
        >
          <span>Confirm {pending}</span>
          <CheckCircle2 size={16} />
        </button>
      </div>
    </>
  );
}
