export default function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed border-rule rounded-xl bg-white/40">
      {Icon && <Icon size={36} strokeWidth={1.6} className="text-ink-dim mb-4" />}
      <p className="font-display text-lg font-medium text-ink">{title}</p>
      {hint && <p className="text-sm text-ink-dim mt-1.5 max-w-sm">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
