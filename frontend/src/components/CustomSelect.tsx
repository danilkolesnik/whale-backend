import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CustomSelectProps {
  value: number | null;
  onChange: (value: number) => void;
  options?: number[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string; // для интеграции с формой
}

export default function CustomSelect({
  value,
  onChange,
  options = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  placeholder = "Level",
  disabled = false,
  required = false,
  name = "custom-select",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-[60px] text-[10px] font-encode text-center",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      {/* Поле отображения выбранного значения */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "bg-[#21262f] text-[#E4F1FF] pl-2.5 pr-2 py-1 rounded-[5px] border border-[#AED2FF4D] cursor-pointer text-start",
          value ? "text-[#AED2FF]" : "opacity-60"
        )}
      >
        {value ?? placeholder}
      </div>

      {/* Выпадающее меню */}
      {open && (
        <ul className="absolute z-50 left-0 right-0 mt-0 top-[-1] bg-gradient-to-b from-[#21262F] to-[#3F5770] border border-[#3F5770] rounded-[5px] rounded-t-none max-h-40 overflow-y-auto shadow-md">
          {options.map((option) => (
            <li
              key={option}
              className="px-2 py-1 hover:bg-[#3F5770]/40 text-[#6DA0E1] cursor-pointer flex items-center justify-center "
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              <span className="text-center w-[90%] h-full border-b border-[#61758E]">
                {option}
               </span>
            </li>
          ))}
        </ul>
      )}

      {/* Скрытое поле для формы */}
      {required && (
        <input
          type="hidden"
          name={name}
          value={value ?? ""}
          required={required}
        />
      )}
    </div>
  );
}
