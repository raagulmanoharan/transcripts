import type { Prediction } from "../types";
import { Glyph } from "./Glyph";

// Presented as an Apple-style suggestion: a legible material with a single
// meaningful glyph, the confident statement, the signals it fused as small
// evidence chips, and one clean confirm. No eyebrow; no reasoning diagram.
// Urgency lives in the glyph tile's quiet accent.

export function PredictionCard({
  prediction,
  onConfirm,
  onDismiss,
}: {
  prediction: Prediction;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const factors = prediction.factors.filter(Boolean).slice(0, 3);
  return (
    <div className="sugg">
      <div className={`sugg-glyph urgency-${prediction.urgency}`}>
        <Glyph name={prediction.icon} className="glyph" />
      </div>
      <h1 className="sugg-title">{prediction.headline}</h1>
      {factors.length > 0 ? (
        <div className="evidence">
          {factors.map((f, i) => (
            <span key={i} className="ev">
              <span className="ev-dot" />
              {f}
            </span>
          ))}
        </div>
      ) : null}
      <div className="sugg-actions">
        <button className="confirm" onClick={onConfirm}>
          {prediction.confirmLabel || "Confirm"}
        </button>
        <button className="let-go" onClick={onDismiss}>
          Not now
        </button>
      </div>
    </div>
  );
}
