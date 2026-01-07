import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: "orange" | "blue" | "green" | "pink";
  delay?: number;
}

const colorMap = {
  orange: "bg-orange-100 text-orange-600 border-orange-200",
  blue: "bg-blue-100 text-blue-600 border-blue-200",
  green: "bg-emerald-100 text-emerald-600 border-emerald-200",
  pink: "bg-pink-100 text-pink-600 border-pink-200",
};

export function StatCard({ title, value, icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both")} style={{ animationDelay: `${delay}ms` }}>
      <Card className={cn("border-2 shadow-sm hover:shadow-md transition-all duration-300", colorMap[color])}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-80 font-sans uppercase tracking-wider">
            {title}
          </CardTitle>
          <Icon className="h-5 w-5 opacity-70" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-display">{value}</div>
        </CardContent>
      </Card>
    </div>
  );
}
