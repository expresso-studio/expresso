"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

type ChartDataType = {
  day: string;
  high: number;
  low: number;
};

type FillerWordStats = {
  id: number;
  created_at: string;
  max_wpm: string;
  min_wpm: string;
  session_wpm: string;
};

const chartConfig = {
  desktop: {
    label: "high",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "low",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function WPMChart() {
  const [chartData, setChartData] = useState<ChartDataType[]>([]);
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    const fetchWPM = async () => {
      if (!isAuthenticated || !user?.sub) {
        console.error("User not authenticated");
        return;
      }

      try {
        const response = await fetch(
          `/api/fillerwords/wpm?userId=${encodeURIComponent(user.sub)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch filler words");
        }

        const data = await response.json();
        if (data.fillerWords) {
          const formattedData: ChartDataType[] = data.fillerWords.map(
            (entry: FillerWordStats) => ({
              day: new Date(entry.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              high: parseFloat(entry.max_wpm),
              low: parseFloat(entry.min_wpm),
            })
          );

          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching filler words:", error);
      }
    };

    fetchWPM();
  }, [isAuthenticated, user?.sub]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md font-normal">
          WPM - Words per Minute
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 4,
              right: 4,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="high"
              type="natural"
              fill="var(--color-mobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="low"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
