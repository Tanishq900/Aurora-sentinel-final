import { createPortal } from 'react-dom';
import type { ValidationSnapshot } from '../risk/hybrid-motion';

interface AIValidationModalProps {
  isOpen: boolean;
  snapshot: ValidationSnapshot | null;
  maxDurationMs: number;
  onSendNow: () => void;
  onDismiss: () => void;
}

function getStatusLabel(snapshot: ValidationSnapshot | null): string {
  if (!snapshot) {
    return 'Listening for more motion data...';
  }

  if (snapshot.cooldownRemainingMs > 0) {
    return `Abnormal motion detected. Rechecking in ${(snapshot.cooldownRemainingMs / 1000).toFixed(1)}s.`;
  }

  if (snapshot.decision.shouldEarlyConfirm) {
    return 'High-confidence event detected. Escalating immediately.';
  }

  if (snapshot.decision.shouldEarlyReject) {
    return 'Pattern looks low-risk. Closing validation.';
  }

  return snapshot.decision.reason;
}

export default function AIValidationModal({
  isOpen,
  snapshot,
  maxDurationMs,
  onSendNow,
  onDismiss,
}: AIValidationModalProps) {
  if (!isOpen) return null;

  const elapsedMs = snapshot?.elapsedMs ?? 0;
  const progress = Math.max(0, Math.min(100, (elapsedMs / maxDurationMs) * 100));
  const confidence = Math.round((snapshot?.decision.confidence ?? 0) * 100);
  const classification = snapshot?.decision.classification ?? 'inconclusive';

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99997]">
      <div className="glass-panel rounded-2xl p-6 max-w-lg w-full mx-4 border border-amber-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="pb-4 mb-4 border-b border-border/40">
          <div className="text-xs uppercase tracking-[0.25em] text-amber-300/90">AI Validation</div>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Unusual movement detected</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We are validating the motion pattern before opening the emergency SOS countdown.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Validation progress</span>
              <span>{Math.ceil(Math.max(maxDurationMs - elapsedMs, 0) / 1000)}s</span>
            </div>
            <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-300 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/40 bg-secondary/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Class</div>
              <div className="mt-1 text-sm font-semibold text-foreground capitalize">{classification}</div>
            </div>
            <div className="rounded-xl border border-border/40 bg-secondary/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Confidence</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{confidence}%</div>
            </div>
            <div className="rounded-xl border border-border/40 bg-secondary/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Motion Max</div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {snapshot?.features.max?.toFixed(2) ?? '0.00'}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-secondary/25 px-4 py-3 text-sm text-muted-foreground">
            {getStatusLabel(snapshot)}
          </div>

          {snapshot?.cooldownRemainingMs ? (
            <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Retry cooldown: {(snapshot.cooldownRemainingMs / 1000).toFixed(1)}s
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onDismiss}
              className="flex-1 px-5 py-3 bg-secondary/60 hover:bg-secondary/80 text-foreground rounded-xl border border-border/50"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={onSendNow}
              className="flex-1 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-semibold border border-amber-300/40 shadow-[0_15px_40px_rgba(245,158,11,0.2)]"
            >
              Send Now
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
