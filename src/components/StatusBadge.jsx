import { Check, X, Clock, Minus } from "lucide-react";

const CONFIG = {
  present: {
    icon: Check,
    label: "Present",
    text: "text-present",
    bg: "bg-present-bg",
  },
  absent: {
    icon: X,
    label: "Absent",
    text: "text-absent",
    bg: "bg-absent-bg",
  },
  pending: {
    icon: Clock,
    label: "Not yet arrived",
    text: "text-pending",
    bg: "bg-pending-bg",
  },
  "no-record": {
    icon: Minus,
    label: "No record",
    text: "text-ink-dim",
    bg: "bg-rule/40",
  },
};

export default function StatusBadge({ status, compact = false }) {
  const cfg = CONFIG[status] || CONFIG["no-record"];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cfg.bg} ${cfg.text} ${
        compact ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <Icon size={compact ? 12 : 14} strokeWidth={3} />
      {cfg.label}
    </span>
  );
}
