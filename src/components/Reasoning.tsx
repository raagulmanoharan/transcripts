// The reasoning made visible. The signal fragments the Oracle fused are drawn
// as nodes; thin lines converge to one luminous focal point — the conclusion.
// This is the "because" as a picture: intelligence you can see connecting dots.

const W = 320;
const H = 132;
const FOCAL = { x: W / 2, y: H - 18 };

export function Reasoning({
  factors,
  urgency,
}: {
  factors: string[];
  urgency: "ambient" | "soon" | "now";
}) {
  const f = factors.filter(Boolean).slice(0, 3);
  if (f.length === 0) return null;
  const nodes = f.map((label, i) => {
    const t = f.length === 1 ? 0.5 : i / (f.length - 1);
    const x = 48 + t * (W - 96);
    const y = 26 + (i % 2) * 20;
    return { x, y, label };
  });

  return (
    <svg
      className={`reasoning urgency-${urgency}`}
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label={`Reasoning: ${f.join(", ")}`}
    >
      {nodes.map((n, i) => (
        <line
          key={`l${i}`}
          className="r-line"
          x1={n.x}
          y1={n.y}
          x2={FOCAL.x}
          y2={FOCAL.y}
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={`n${i}`} className="r-node" cx={n.x} cy={n.y} r={2.5} />
      ))}
      {nodes.map((n, i) => (
        <text
          key={`t${i}`}
          className="r-label"
          x={n.x}
          y={n.y + (i % 2 ? 15 : -9)}
          textAnchor="middle"
        >
          {n.label}
        </text>
      ))}
      <circle className="r-focal-glow" cx={FOCAL.x} cy={FOCAL.y} r={12} />
      <circle className="r-focal" cx={FOCAL.x} cy={FOCAL.y} r={4} />
    </svg>
  );
}
