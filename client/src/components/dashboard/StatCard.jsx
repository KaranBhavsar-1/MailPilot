
import { ArrowUpRight } from "lucide-react";

const colorStyles = {
  purple: "bg-purple-50 text-purple-700",
  blue: "bg-blue-50 text-blue-700",
  pink: "bg-pink-50 text-pink-700",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-green-50 text-green-700",
};

export default function StatCard({
  title,
  value = 0,
  description,
  icon: Icon,
  color = "purple",
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value ?? 0}
          </p>
        </div>

        {Icon && (
          <div className={`rounded-xl p-3 ${colorStyles[color] || colorStyles.purple}`}>
            <Icon size={21} />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {description}
        </p>

        <ArrowUpRight size={16} className="text-slate-400" />
      </div>
    </button>
  );
}
