type ArchitectureDiagramProps = {
  steps: string[];
  signals: string[];
};

export function ArchitectureDiagram({ steps, signals }: ArchitectureDiagramProps) {
  return (
    <div className="architecture-diagram" role="img" aria-label={`시스템 흐름: ${steps.join("에서 ")}`}>
      <div className="architecture-title">
        <span>SYSTEM ARCHITECTURE</span>
        <span>REQUEST → RESULT</span>
      </div>
      <div className="architecture-nodes">
        {steps.map((step, index) => (
          <div className="architecture-step" key={step}>
            <div className="architecture-node">
              <small>{String(index + 1).padStart(2, "0")}</small>
              <strong>{step}</strong>
            </div>
            {index < steps.length - 1 && <span className="architecture-arrow" aria-hidden="true">→</span>}
          </div>
        ))}
      </div>
      <div className="architecture-signals">
        {signals.map((signal) => <span key={signal}><i />{signal}</span>)}
      </div>
    </div>
  );
}
