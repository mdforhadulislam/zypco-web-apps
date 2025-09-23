"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function StatsCard({ title, value, change, icon: Icon, trend = "neutral" }: StatsCardProps) {
  const trendColor = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <Card data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`stats-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {change && (
          <p className={`text-xs ${trendColor[trend]} mt-1`} data-testid={`stats-change-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}