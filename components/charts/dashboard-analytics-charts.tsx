"use client";

import { Card } from "@/components/ui/card";
import {
  VictoryChart,
  VictoryArea,
  VictoryLine,
  VictoryAxis,
  VictoryBar,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryLegend,
  VictoryGroup,
} from "victory";
import { formatCurrency } from "@/lib/currency";

export type AnalyticsChartsProps = {
  chartData: any[];
  activeCurrency: string;
};

export default function DashboardAnalyticsCharts({
  chartData,
  activeCurrency,
}: AnalyticsChartsProps) {
  return (
    <>
      <Card className="border border-border p-4 md:p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Revenue Trend
        </h3>
        <div className="w-full h-[320px]">
          <VictoryChart
            theme={VictoryTheme.material}
            height={320}
            padding={{ top: 40, bottom: 60, left: 60, right: 40 }}
            containerComponent={
              <VictoryVoronoiContainer
                labels={({ datum }) =>
                  datum
                    ? `${datum.childName === "expenses" ? "Expenses" : "Revenue"}: ${formatCurrency(
                        datum.y,
                        activeCurrency,
                      )}`
                    : ""
                }
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{
                      fill: "var(--card)",
                      stroke: "var(--border)",
                      borderRadius: 8,
                    }}
                  />
                }
              />
            }
          >
            <VictoryAxis
              style={{
                axis: { stroke: "var(--border)" },
                tickLabels: {
                  fill: "var(--muted-foreground)",
                  fontSize: 10,
                },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: "var(--border)" },
                tickLabels: {
                  fill: "var(--muted-foreground)",
                  fontSize: 10,
                },
                grid: { stroke: "var(--border)", strokeDasharray: "4, 4" },
              }}
            />
            <VictoryLegend
              x={100}
              y={0}
              orientation="horizontal"
              gutter={20}
              style={{
                labels: { fill: "var(--muted-foreground)", fontSize: 10 },
              }}
              data={[
                { name: "Revenue", symbol: { fill: "#2563eb" } },
                { name: "Expenses", symbol: { fill: "#dc2626" } },
              ]}
            />
            <VictoryGroup>
              <VictoryArea
                name="revenue"
                data={chartData}
                x="month"
                y="revenue"
                style={{
                  data: {
                    fill: "rgba(37, 99, 235, 0.25)",
                    stroke: "#2563eb",
                    strokeWidth: 2,
                  },
                }}
              />
              <VictoryLine
                name="expenses"
                data={chartData}
                x="month"
                y="expenses"
                style={{ data: { stroke: "#dc2626", strokeWidth: 2 } }}
              />
            </VictoryGroup>
          </VictoryChart>
        </div>
      </Card>

      <Card className="border border-border p-4 md:p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Monthly Comparison
        </h3>
        <div className="w-full h-[320px]">
          <VictoryChart
            theme={VictoryTheme.material}
            height={320}
            padding={{ top: 40, bottom: 60, left: 60, right: 40 }}
            domainPadding={20}
            containerComponent={
              <VictoryVoronoiContainer
                labels={({ datum }) =>
                  datum
                    ? `${datum.x}: ${formatCurrency(datum.y, activeCurrency)}`
                    : ""
                }
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{
                      fill: "var(--card)",
                      stroke: "var(--border)",
                      borderRadius: 8,
                    }}
                  />
                }
              />
            }
          >
            <VictoryAxis
              style={{
                axis: { stroke: "var(--border)" },
                tickLabels: {
                  fill: "var(--muted-foreground)",
                  fontSize: 10,
                },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: "var(--border)" },
                tickLabels: {
                  fill: "var(--muted-foreground)",
                  fontSize: 10,
                },
                grid: { stroke: "var(--border)", strokeDasharray: "4, 4" },
              }}
            />
            <VictoryGroup offset={20}>
              <VictoryBar
                data={chartData}
                x="month"
                y="revenue"
                style={{ data: { fill: "#2563eb" } }}
              />
              <VictoryBar
                data={chartData}
                x="month"
                y="expenses"
                style={{ data: { fill: "#dc2626" } }}
              />
            </VictoryGroup>
          </VictoryChart>
        </div>
      </Card>
    </>
  );
}
