"use client";

interface ColorSelectorProps {
  colors: string[];
  selected: string;
  onChange: (color: string) => void;
}

const COLOR_MAP: Record<string, string> = {
  Black: "#0F0F0F",
  White: "#FFFFFF",
  Gray: "#9CA3AF",
  Navy: "#1E3A5F",
  Khaki: "#C3B091",
  Olive: "#6B7246",
  Charcoal: "#36454F",
  Brown: "#7C3F00",
  Red: "#FF3B30",
  Cream: "#FFFDD0",
  "Light Blue": "#ADD8E6",
  "Medium Blue": "#4682B4",
  "Dark Blue": "#00008B",
  Tan: "#D2B48C",
};

export default function ColorSelector({
  colors,
  selected,
  onChange,
}: ColorSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-10 h-10 rounded-full transition-all flex-shrink-0 ${
            selected === color
              ? "ring-2 ring-[#0F0F0F] ring-offset-2 scale-110"
              : "ring-1 ring-[#E5E5E5] hover:ring-[#0F0F0F]"
          }`}
          style={{ backgroundColor: COLOR_MAP[color] || "#9CA3AF" }}
          title={color}
          aria-label={color}
          role="radio"
          aria-checked={selected === color}
        />
      ))}
    </div>
  );
}
