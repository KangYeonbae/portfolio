import type { FlowLane, FlowNode } from "@/data/case-studies";

/**
 * Web rendering of the deep case-study architecture lanes.
 * Mirrors the print portfolio's flow diagram, including decision splits and
 * retry loops — the parts a shallow "A → B → C" strip cannot express.
 */
export function CaseFlow({ lanes }: { lanes: FlowLane[] }) {
  return (
    <div className="case-flow">
      {lanes.map((lane) => (
        <section className="flow-lane" key={lane.name}>
          <header className="flow-lane-head">
            <strong>{lane.name}</strong>
            {lane.caption && <span>{lane.caption}</span>}
          </header>

          {lane.nodes && <FlowNodes nodes={lane.nodes} />}

          {lane.split && (
            <div className="flow-split">
              <p className="flow-split-condition">{lane.split.condition}</p>
              {lane.split.paths.map((path) => (
                <div className="flow-split-path" key={path.label}>
                  <div className="flow-split-label">
                    <strong>{path.label}</strong>
                    {path.weight && <span>{path.weight}</span>}
                  </div>
                  <FlowNodes nodes={path.nodes} />
                </div>
              ))}
            </div>
          )}

          {lane.loop && <p className="flow-loop">{lane.loop}</p>}
        </section>
      ))}
    </div>
  );
}

function FlowNodes({ nodes }: { nodes: FlowNode[] }) {
  return (
    <div className="flow-nodes">
      {nodes.map((node, index) => (
        <div className="flow-node-wrap" key={node.title}>
          <div className={`flow-node ${node.kind ? `flow-node-${node.kind}` : ""}`}>
            {node.tag && <span className="flow-node-tag">{node.tag}</span>}
            <strong>{node.title}</strong>
            {node.detail && <small>{node.detail}</small>}
          </div>
          {index < nodes.length - 1 && <i className="flow-node-arrow" aria-hidden="true">→</i>}
        </div>
      ))}
    </div>
  );
}
