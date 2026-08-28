import type {
  TcoInputs,
  TcoResult,
  UnitSystem,
  VehicleInputs,
  VehicleResult,
} from "./types";

/**
 * Energy cost for one year. The two unit systems express efficiency in
 * opposite directions — metric is consumption per 100 distance, imperial is
 * distance per unit of energy — so they cannot share one formula.
 */
export const annualEnergyCost = ({
  vehicle,
  annualDistance,
  unitSystem,
}: {
  vehicle: VehicleInputs;
  annualDistance: number;
  unitSystem: UnitSystem;
}) => {
  if (vehicle.efficiency <= 0) {
    return 0;
  }

  const unitsUsed =
    unitSystem === "metric"
      ? (annualDistance / 100) * vehicle.efficiency
      : annualDistance / vehicle.efficiency;

  return unitsUsed * vehicle.energyPrice;
};

const vehicleResult = ({
  vehicle,
  years,
  annualDistance,
  unitSystem,
}: {
  vehicle: VehicleInputs;
  years: number;
  annualDistance: number;
  unitSystem: UnitSystem;
}): VehicleResult => {
  const netPurchase = vehicle.purchasePrice - vehicle.incentive;
  const depreciation = netPurchase - vehicle.resaleValue;
  const energyPerYear = annualEnergyCost({ vehicle, annualDistance, unitSystem });

  const energy = energyPerYear * years;
  const maintenance = vehicle.annualMaintenance * years;
  const insurance = vehicle.annualInsurance * years;
  const tax = vehicle.annualTax * years;
  const total = depreciation + energy + maintenance + insurance + tax;

  const runningPerYear =
    energyPerYear +
    vehicle.annualMaintenance +
    vehicle.annualInsurance +
    vehicle.annualTax;

  // Cash actually spent, starting with the price paid on day one. Net-of-resale
  // cost would start both vehicles at zero and rise in a straight line, so the
  // curves could never cross and break-even would never exist. Resale lands at
  // the end of the period and is carried in the totals, not in this curve.
  const cumulativeCash = Array.from(
    { length: years + 1 },
    (_, year) => netPurchase + runningPerYear * year,
  );

  const totalDistance = annualDistance * years;

  return {
    breakdown: { depreciation, energy, maintenance, insurance, tax, total },
    annualEnergyCost: energyPerYear,
    costPerDistanceUnit: totalDistance > 0 ? total / totalDistance : 0,
    cumulativeCash,
  };
};

/**
 * The year the two cash curves cross, linearly interpolated within the year it
 * happens. Returns null when one option leads for the whole period.
 */
const findBreakEven = (ev: number[], ice: number[]) => {
  for (let year = 1; year < Math.min(ev.length, ice.length); year += 1) {
    const previous = ev[year - 1] - ice[year - 1];
    const current = ev[year] - ice[year];

    if (previous === 0) {
      continue;
    }

    if (Math.sign(previous) !== Math.sign(current)) {
      const span = previous - current;
      return span === 0 ? year : year - 1 + previous / span;
    }
  }

  return null;
};

export const calculateTco = (inputs: TcoInputs): TcoResult => {
  const shared = {
    years: inputs.years,
    annualDistance: inputs.annualDistance,
    unitSystem: inputs.unitSystem,
  };

  const ev = vehicleResult({ vehicle: inputs.ev, ...shared });
  const ice = vehicleResult({ vehicle: inputs.ice, ...shared });

  return {
    ev,
    ice,
    savings: ice.breakdown.total - ev.breakdown.total,
    breakEvenYear: findBreakEven(ev.cumulativeCash, ice.cumulativeCash),
  };
};

export const UNIT_LABELS = {
  metric: {
    distance: "km",
    evEfficiency: "kWh/100km",
    iceEfficiency: "L/100km",
    fuelUnit: "litre",
  },
  imperial: {
    distance: "mi",
    evEfficiency: "mi/kWh",
    iceEfficiency: "MPG",
    fuelUnit: "gallon",
  },
} as const;

export const DEFAULT_INPUTS: TcoInputs = {
  years: 8,
  annualDistance: 15000,
  unitSystem: "metric",
  currency: "EUR",
  ev: {
    purchasePrice: 42000,
    resaleValue: 17000,
    efficiency: 17,
    energyPrice: 0.28,
    annualInsurance: 700,
    annualMaintenance: 250,
    annualTax: 50,
    incentive: 3000,
  },
  ice: {
    purchasePrice: 32000,
    resaleValue: 13000,
    efficiency: 6.5,
    energyPrice: 1.75,
    annualInsurance: 650,
    annualMaintenance: 550,
    annualTax: 180,
    incentive: 0,
  },
};

const KM_PER_MILE = 1.609344;
const LITRES_PER_GALLON = 3.785411784;
/** L/100km ↔ US MPG. */
const MPG_CONSTANT = 235.214583;
/** kWh/100km ↔ mi/kWh. */
const MI_PER_KWH_CONSTANT = 100 / KM_PER_MILE;

const round = (value: number, places: number) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Convert every distance- and volume-denominated figure when the unit system
 * changes. Without this the toggle silently reinterprets 6.5 L/100km as
 * 6.5 MPG, which is a different car entirely.
 */
export const convertInputs = (inputs: TcoInputs, target: UnitSystem): TcoInputs => {
  if (inputs.unitSystem === target) {
    return inputs;
  }

  const toImperial = target === "imperial";

  return {
    ...inputs,
    unitSystem: target,
    annualDistance: Math.round(
      toImperial
        ? inputs.annualDistance / KM_PER_MILE
        : inputs.annualDistance * KM_PER_MILE,
    ),
    ev: {
      ...inputs.ev,
      // kWh/100km ↔ mi/kWh: both directions are the same reciprocal.
      efficiency:
        inputs.ev.efficiency > 0
          ? round(MI_PER_KWH_CONSTANT / inputs.ev.efficiency, 2)
          : inputs.ev.efficiency,
    },
    ice: {
      ...inputs.ice,
      // L/100km ↔ MPG is also reciprocal through a constant.
      efficiency:
        inputs.ice.efficiency > 0
          ? round(MPG_CONSTANT / inputs.ice.efficiency, 2)
          : inputs.ice.efficiency,
      energyPrice: round(
        toImperial
          ? inputs.ice.energyPrice * LITRES_PER_GALLON
          : inputs.ice.energyPrice / LITRES_PER_GALLON,
        3,
      ),
    },
  };
};
