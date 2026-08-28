"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

import {
  calculateTco,
  convertInputs,
  DEFAULT_INPUTS,
  UNIT_LABELS,
} from "../../lib/tco/calculate";
import type { TcoInputs, UnitSystem, VehicleInputs } from "../../lib/tco/types";
import { CumulativeChart } from "../../components/tco/cumulative-chart";
import { Button } from "../../components/ui/button";
import { Card, CardTitle } from "../../components/ui/card";
import { Input, Label, Select } from "../../components/ui/field";
import { cn, currencyFormatter } from "../../lib/utils";

const CURRENCIES = ["EUR", "USD", "GBP", "BRL", "CAD"];

const NumberField = ({
  id,
  label,
  suffix,
  value,
  onChange,
  step = "1",
}: {
  id: string;
  label: string;
  suffix?: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) => (
  <div className="flex h-full flex-col">
    <Label htmlFor={id}>
      {label}
      {suffix ? <span className="text-muted-foreground"> ({suffix})</span> : null}
    </Label>
    <Input
      id={id}
      className="mt-auto"
      type="number"
      inputMode="decimal"
      min="0"
      step={step}
      value={Number.isFinite(value) ? value : ""}
      onChange={(event) => onChange(event.target.valueAsNumber)}
    />
  </div>
);

const VehicleFields = ({
  prefix,
  title,
  accent,
  vehicle,
  efficiencyLabel,
  energyLabel,
  onChange,
}: {
  prefix: string;
  title: string;
  accent: string;
  vehicle: VehicleInputs;
  efficiencyLabel: string;
  energyLabel: string;
  onChange: (patch: Partial<VehicleInputs>) => void;
}) => (
  <Card className="space-y-3">
    <CardTitle className="flex items-center gap-2">
      <span className="size-3 rounded-full" style={{ background: accent }} aria-hidden />
      {title}
    </CardTitle>

    <div className="grid grid-cols-2 gap-3">
      <NumberField
        id={`${prefix}-price`}
        label="Purchase price"
        value={vehicle.purchasePrice}
        step="500"
        onChange={(purchasePrice) => onChange({ purchasePrice })}
      />
      <NumberField
        id={`${prefix}-resale`}
        label="Resale value"
        value={vehicle.resaleValue}
        step="500"
        onChange={(resaleValue) => onChange({ resaleValue })}
      />
      <NumberField
        id={`${prefix}-incentive`}
        label="Incentive"
        value={vehicle.incentive}
        step="250"
        onChange={(incentive) => onChange({ incentive })}
      />
      <NumberField
        id={`${prefix}-efficiency`}
        label="Efficiency"
        suffix={efficiencyLabel}
        value={vehicle.efficiency}
        step="0.1"
        onChange={(efficiency) => onChange({ efficiency })}
      />
      <NumberField
        id={`${prefix}-energy`}
        label="Energy price"
        suffix={energyLabel}
        value={vehicle.energyPrice}
        step="0.01"
        onChange={(energyPrice) => onChange({ energyPrice })}
      />
      <NumberField
        id={`${prefix}-insurance`}
        label="Insurance"
        suffix="per year"
        value={vehicle.annualInsurance}
        step="50"
        onChange={(annualInsurance) => onChange({ annualInsurance })}
      />
      <NumberField
        id={`${prefix}-maintenance`}
        label="Maintenance"
        suffix="per year"
        value={vehicle.annualMaintenance}
        step="50"
        onChange={(annualMaintenance) => onChange({ annualMaintenance })}
      />
      <NumberField
        id={`${prefix}-tax`}
        label="Road tax"
        suffix="per year"
        value={vehicle.annualTax}
        step="10"
        onChange={(annualTax) => onChange({ annualTax })}
      />
    </div>
  </Card>
);

const ROWS = [
  ["Depreciation", "depreciation"],
  ["Energy", "energy"],
  ["Maintenance", "maintenance"],
  ["Insurance", "insurance"],
  ["Road tax", "tax"],
] as const;

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<TcoInputs>(DEFAULT_INPUTS);
  const [showTable, setShowTable] = useState(false);

  const result = useMemo(() => calculateTco(inputs), [inputs]);
  const labels = UNIT_LABELS[inputs.unitSystem];
  const currency = inputs.currency;

  const evCheaper = result.savings > 0;

  const setUnitSystem = (unitSystem: UnitSystem) =>
    setInputs((current) => convertInputs(current, unitSystem));

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground"
      >
        ← ShareSpent
      </Link>

      <h1 className="mt-2 text-2xl font-bold tracking-tight">
        Electric vs petrol: cost of ownership
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Compare what each car actually costs you over the years you keep it.
      </p>

      <Card className="mt-5 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Over {inputs.years} years, the{" "}
            <strong className="text-foreground">
              {evCheaper ? "electric car" : "petrol car"}
            </strong>{" "}
            costs less by
          </p>
          <p
            className="text-3xl font-bold tabular-nums"
            style={{ color: evCheaper ? "var(--series-ev)" : "var(--series-ice)" }}
          >
            {currencyFormatter({ amount: Math.abs(result.savings), currency })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.breakEvenYear === null
              ? "The cheaper car stays ahead for the whole period."
              : `The electric car catches up on cash spent after ${result.breakEvenYear.toFixed(1)} years.`}
          </p>
        </div>

        <CumulativeChart
          ev={result.ev.cumulativeCash}
          ice={result.ice.cumulativeCash}
          currency={currency}
          breakEvenYear={result.breakEvenYear}
        />
      </Card>

      <Card className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Where the money goes</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => setShowTable((v) => !v)}>
            {showTable ? "Hide table" : "Show table"}
          </Button>
        </div>

        <div className="mt-3 space-y-3">
          {ROWS.map(([label, key]) => {
            const evValue = result.ev.breakdown[key];
            const iceValue = result.ice.breakdown[key];
            const largest = Math.max(evValue, iceValue, 1);

            return (
              <div key={key}>
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {currencyFormatter({ amount: evValue, currency })} ·{" "}
                    {currencyFormatter({ amount: iceValue, currency })}
                  </span>
                </div>
                {/* Paired bars, 2px gap, ends rounded and anchored at the left. */}
                <div className="mt-1 space-y-0.5">
                  {[
                    { value: evValue, color: "var(--series-ev)" },
                    { value: iceValue, color: "var(--series-ice)" },
                  ].map(({ value, color }, index) => (
                    <div
                      key={index}
                      className="h-2 rounded-r"
                      style={{
                        width: `${Math.max((value / largest) * 100, 1)}%`,
                        background: color,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {showTable ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Cost of ownership by category, electric versus petrol
              </caption>
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th scope="col" className="py-1 font-medium">Category</th>
                  <th scope="col" className="py-1 text-right font-medium">EV</th>
                  <th scope="col" className="py-1 text-right font-medium">Petrol</th>
                </tr>
              </thead>
              <tbody>
                {[...ROWS, ["Total", "total"] as const].map(([label, key]) => (
                  <tr key={key} className="border-t border-border">
                    <th scope="row" className="py-1.5 text-left font-normal">{label}</th>
                    <td className="py-1.5 text-right tabular-nums">
                      {currencyFormatter({ amount: result.ev.breakdown[key], currency })}
                    </td>
                    <td className="py-1.5 text-right tabular-nums">
                      {currencyFormatter({ amount: result.ice.breakdown[key], currency })}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border">
                  <th scope="row" className="py-1.5 text-left font-normal">
                    Per {labels.distance}
                  </th>
                  <td className="py-1.5 text-right tabular-nums">
                    {currencyFormatter({ amount: result.ev.costPerDistanceUnit, currency })}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {currencyFormatter({ amount: result.ice.costPerDistanceUnit, currency })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <Card className="mt-4 space-y-3">
        <CardTitle>Your driving</CardTitle>

        <div className="grid grid-cols-2 gap-3">
          <NumberField
            id="years"
            label="Years kept"
            value={inputs.years}
            onChange={(years) =>
              setInputs((current) => ({
                ...current,
                years: Math.min(Math.max(Math.round(years) || 1, 1), 25),
              }))
            }
          />
          <NumberField
            id="distance"
            label="Distance per year"
            suffix={labels.distance}
            value={inputs.annualDistance}
            step="1000"
            onChange={(annualDistance) =>
              setInputs((current) => ({ ...current, annualDistance }))
            }
          />
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select
              id="currency"
              value={inputs.currency}
              onChange={(event) =>
                setInputs((current) => ({ ...current, currency: event.target.value }))
              }
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </Select>
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium">Units</span>
            <div className="flex rounded-xl border border-border bg-surface-muted p-1">
              {(["metric", "imperial"] as const).map((system) => (
                <button
                  key={system}
                  type="button"
                  aria-pressed={inputs.unitSystem === system}
                  onClick={() => setUnitSystem(system)}
                  className={cn(
                    "min-h-11 flex-1 rounded-lg text-xs font-semibold capitalize",
                    inputs.unitSystem === system
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  {system}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        <VehicleFields
          prefix="ev"
          title="Electric"
          accent="var(--series-ev)"
          vehicle={inputs.ev}
          efficiencyLabel={labels.evEfficiency}
          energyLabel="per kWh"
          onChange={(patch) =>
            setInputs((current) => ({ ...current, ev: { ...current.ev, ...patch } }))
          }
        />
        <VehicleFields
          prefix="ice"
          title="Petrol"
          accent="var(--series-ice)"
          vehicle={inputs.ice}
          efficiencyLabel={labels.iceEfficiency}
          energyLabel={`per ${labels.fuelUnit}`}
          onChange={(patch) =>
            setInputs((current) => ({ ...current, ice: { ...current.ice, ...patch } }))
          }
        />
      </div>

      <Button
        variant="secondary"
        size="block"
        className="mt-4"
        onClick={() => setInputs(DEFAULT_INPUTS)}
      >
        <RotateCcw className="size-4" aria-hidden />
        Reset to defaults
      </Button>

      <p className="mt-4 text-xs text-muted-foreground">
        Depreciation is the price you pay minus the resale value you expect, so the
        accuracy of the comparison rests mostly on that resale figure. Financing
        interest, charger installation, and tyre wear are not modelled.
      </p>
    </main>
  );
}
