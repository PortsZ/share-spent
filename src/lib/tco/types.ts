export type UnitSystem = "metric" | "imperial";

export type VehicleInputs = {
  purchasePrice: number;
  /** Expected resale value at the end of the ownership period. */
  resaleValue: number;
  /**
   * Metric: kWh/100km (electric) or L/100km (combustion).
   * Imperial: mi/kWh (electric) or MPG (combustion).
   */
  efficiency: number;
  /** Per kWh (electric), per litre (metric combustion), per gallon (imperial). */
  energyPrice: number;
  annualInsurance: number;
  annualMaintenance: number;
  annualTax: number;
  /** One-off purchase incentive or rebate, subtracted from the price. */
  incentive: number;
};

export type TcoInputs = {
  years: number;
  /** km when metric, miles when imperial. */
  annualDistance: number;
  unitSystem: UnitSystem;
  currency: string;
  ev: VehicleInputs;
  ice: VehicleInputs;
};

export type CostBreakdown = {
  depreciation: number;
  energy: number;
  maintenance: number;
  insurance: number;
  tax: number;
  total: number;
};

export type VehicleResult = {
  breakdown: CostBreakdown;
  annualEnergyCost: number;
  costPerDistanceUnit: number;
  /**
   * Cash spent after t years, index 0 = the price paid on day one. Excludes
   * resale, which is realised at the end and carried in the breakdown.
   */
  cumulativeCash: number[];
};

export type TcoResult = {
  ev: VehicleResult;
  ice: VehicleResult;
  /** Positive when the EV costs less over the full period. */
  savings: number;
  /**
   * Year at which the cash curves cross, interpolated. null when the cheaper
   * option is cheaper from day one or never catches up within the period.
   */
  breakEvenYear: number | null;
};
