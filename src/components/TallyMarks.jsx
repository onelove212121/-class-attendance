function TallyGroup({ count }) {
  // count is 1-5. Draws up to 4 vertical strokes, with a diagonal strike for the 5th.
  const bars = Math.min(count, 5);
  return (
    <svg width="26" height="22" viewBox="0 0 26 22" className="inline-block">
      {Array.from({ length: bars }).map((_, i) => (
        <line
          key={i}
          x1={3 + i * 5}
          y1={2}
          x2={3 + i * 5}
          y2={20}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      {count === 5 && (
        <line
          x1={1}
          y1={20}
          x2={22}
          y2={2}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export default function TallyMarks({ count, className = "" }) {
  if (!count) return null;
  const fullGroups = Math.floor(count / 5);
  const remainder = count % 5;
  const groups = Array.from({ length: fullGroups }, () => 5);
  if (remainder) groups.push(remainder);

  return (
    <div className={`flex flex-wrap items-center gap-1.5 text-absent ${className}`}>
      {groups.map((g, i) => (
        <TallyGroup key={i} count={g} />
      ))}
    </div>
  );
}
