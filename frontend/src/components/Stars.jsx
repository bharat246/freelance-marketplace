export default function Stars({ value = 0 }) {
  const rounded = Math.round(value);
  return <span className="text-amber-500" aria-label={`${value} stars`}>
    {"★".repeat(rounded)}<span className="text-slate-300">{"★".repeat(5 - rounded)}</span>
  </span>;
}
