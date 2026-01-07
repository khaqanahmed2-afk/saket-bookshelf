import { cn } from "@/lib/utils";

interface WaveSeparatorProps {
  className?: string;
  position?: "top" | "bottom";
  fill?: string;
}

export function WaveSeparator({ className, position = "bottom", fill = "currentColor" }: WaveSeparatorProps) {
  const isTop = position === "top";
  
  return (
    <div className={cn("absolute left-0 w-full overflow-hidden leading-none", isTop ? "top-0 rotate-180" : "bottom-0", className)}>
      <svg
        className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[100px]"
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
          style={{ fill }}
        />
      </svg>
    </div>
  );
}
