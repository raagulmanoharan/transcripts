import type { Prediction } from "../types";

// The one moment the system speaks first. A single focal card: what it will do
// (a statement, not a question), why it thinks so, and a confirm. Confirm, not
// ask.

export function PredictionCard({
  prediction,
  onConfirm,
  onDismiss,
}: {
  prediction: Prediction;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="prediction">
      <div className={`urgency urgency-${prediction.urgency}`}>
        <span className="urgency-dot" />
        {prediction.urgency === "now"
          ? "Now"
          : prediction.urgency === "soon"
            ? "Soon"
            : "Ambient"}
      </div>
      <h1 className="pred-headline">{prediction.headline}</h1>
      <p className="pred-because">{prediction.because}</p>
      <div className="pred-actions">
        <button className="btn pred-confirm" onClick={onConfirm}>
          {prediction.confirmLabel || "Confirm"}
        </button>
        <button className="pred-dismiss" onClick={onDismiss}>
          Not now
        </button>
      </div>
    </div>
  );
}
