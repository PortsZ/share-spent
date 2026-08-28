"use client";

import { useId, useState } from "react";

import { currencyFormatter } from "../../lib/utils";

const WIDTH = 340;
const HEIGHT = 190;
const PADDING = { top: 14, right: 46, bottom: 26, left: 44 };

const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

const compact = (value: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);

export type CumulativeChartProps = {
  ev: number[];
  ice: number[];
  currency: string;
  breakEvenYear: number | null;
};

export const CumulativeChart = ({
  ev,
  ice,
  currency,
  breakEvenYear,
}: CumulativeChartProps) => {
  const titleId = useId();
  const [hoverYear, setHoverYear] = useState<number | null>(null);

  const years = ev.length - 1;
  const maxValue = Math.max(...ev, ...ice);
  const minValue = Math.min(...ev, ...ice, 0);
  const span = maxValue - minValue || 1;

  const x = (year: number) =>
    PADDING.left + (years === 0 ? 0 : (year / years) * PLOT_WIDTH);
  const y = (value: number) =>
    PADDING.top + PLOT_HEIGHT - ((value - minValue) / span) * PLOT_HEIGHT;

  const path = (series: number[]) =>
    series.map((value, year) => `${year === 0 ? "M" : "L"}${x(year)},${y(value)}`).join(" ");

  // Snap the pointer to the nearest whole year; touch targets are coarse.
  const handlePointer = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const year = Math.round(((ratio * WIDTH - PADDING.left) / PLOT_WIDTH) * years);
    setHoverYear(Number.isFinite(year) ? Math.min(Math.max(year, 0), years) : null);
  };

  const gridValues = [0, 0.5, 1].map((step) => minValue + step * span);

  return (
    <figure className="m-0">
      {/* Legend as well as the direct labels: two series must never rely on
          colour alone to be identified. */}
      <div className="mb-1 flex gap-4 text-xs text-muted-foreground">
        {[
          { label: "Electric", color: "var(--series-ev)" },
          { label: "Petrol", color: "var(--series-ice)" },
        ].map(({ label, color }) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: color }} aria-hidden />
            {label}
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none"
        role="img"
        aria-labelledby={titleId}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        // A tap fires pointerleave immediately after, so clearing on leave
        // would make the readout unusable on a phone; only a mouse clears it.
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") {
            setHoverYear(null);
          }
        }}
      >
        {/* One interpolated string, not several children: React serialises a
            multi-child <title> as a single text node server-side and then
            expects separate nodes on the client, which fails hydration. */}
        <title id={titleId}>
          {`Cumulative cash spent over ${years} years, electric versus combustion`}
        </title>

        {gridValues.map((value) => (
          <g key={value}>
            <line
              x1={PADDING.left}
              x2={PADDING.left + PLOT_WIDTH}
              y1={y(value)}
              y2={y(value)}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={PADDING.left - 6}
              y={y(value) + 3}
              textAnchor="end"
              fontSize="8"
              fill="var(--muted-foreground)"
            >
              {compact(value, currency)}
            </text>
          </g>
        ))}

        {[0, Math.round(years / 2), years].map((year) => (
          <text
            key={year}
            x={x(year)}
            y={HEIGHT - 8}
            textAnchor="middle"
            fontSize="8"
            fill="var(--muted-foreground)"
          >
            {year}y
          </text>
        ))}

        {breakEvenYear !== null ? (
          <line
            x1={x(breakEvenYear)}
            x2={x(breakEvenYear)}
            y1={PADDING.top}
            y2={PADDING.top + PLOT_HEIGHT}
            stroke="var(--muted-foreground)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        ) : null}

        <path d={path(ice)} fill="none" stroke="var(--series-ice)" strokeWidth="2" />
        <path d={path(ev)} fill="none" stroke="var(--series-ev)" strokeWidth="2" />

        {/* Direct labels: identity is never carried by colour alone. */}
        <text
          x={x(years) + 5}
          y={y(ice[years]) + 3}
          fontSize="9"
          fontWeight="600"
          fill="var(--series-ice)"
        >
          Petrol
        </text>
        <text
          x={x(years) + 5}
          y={y(ev[years]) + 3}
          fontSize="9"
          fontWeight="600"
          fill="var(--series-ev)"
        >
          EV
        </text>

        {hoverYear !== null ? (
          <g>
            <line
              x1={x(hoverYear)}
              x2={x(hoverYear)}
              y1={PADDING.top}
              y2={PADDING.top + PLOT_HEIGHT}
              stroke="var(--muted-foreground)"
              strokeWidth="1"
            />
            {/* 2px surface ring keeps the markers legible where lines overlap. */}
            <circle cx={x(hoverYear)} cy={y(ice[hoverYear])} r="4"
              fill="var(--series-ice)" stroke="var(--surface)" strokeWidth="2" />
            <circle cx={x(hoverYear)} cy={y(ev[hoverYear])} r="4"
              fill="var(--series-ev)" stroke="var(--surface)" strokeWidth="2" />
          </g>
        ) : null}
      </svg>

      <figcaption className="mt-2 space-y-1 text-xs text-muted-foreground">
        {hoverYear !== null ? (
          <p className="font-medium text-foreground tabular-nums">
            Year {hoverYear}: EV{" "}
            {currencyFormatter({ amount: ev[hoverYear], currency })} · Petrol{" "}
            {currencyFormatter({ amount: ice[hoverYear], currency })}
          </p>
        ) : (
          <p>Cash spent to date, including the purchase price. Resale is not deducted here — it is in the totals below.</p>
        )}
      </figcaption>
    </figure>
  );
};
