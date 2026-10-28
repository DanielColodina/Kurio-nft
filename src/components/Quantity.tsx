import { Minus, Plus } from "lucide-react";
export function Quantity({
  value,
  onChange,
  max = 50,
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center gap-3">
      <button
        aria-label="Diminuir quantidade"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-8 h-8 rounded-full bg-[#d98e49] text-[#140d0a] grid place-items-center"
      >
        <Minus size={15} />
      </button>
      <span>{value}</span>
      <button
        aria-label="Aumentar quantidade"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-full bg-[#d98e49] text-[#140d0a] grid place-items-center"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
