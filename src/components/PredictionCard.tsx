import type { Prediction } from "../types";
import { Reasoning } from "./Reasoning";

// The one moment the system speaks first — presented as a surfaced thought, not
// a modal. Reasoning constellation, then the statement, then a quiet commit.
// No eyebrow label; urgency lives in the focal glow and the commit's pulse.

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
    <div className="thought">
      <Reasoning factors={prediction.factors} urgency={prediction.urgency} />
      <h1 className="thought-headline">{prediction.headline}</h1>
      <button className={`commit urgency-${prediction.urgency}`} onClick={onConfirm}>
        <span>{prediction.confirmLabel || "Confirm"}</span>
        <span className="commit-arrow" aria-hidden="true">→</span>
      </button>
      <button className="let-go" onClick={onDismiss}>
        Not now
      </button>
    </div>
  );
}
