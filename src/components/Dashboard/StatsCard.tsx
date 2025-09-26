"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  trend = "neutral", 
  icon: Icon,
  className = ""
}: StatsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <div className="space-y-1">
              <p className="text-2xl font-bold tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {change && (
                <div className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span>{change}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div className="p-2 bg-muted rounded-lg">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}