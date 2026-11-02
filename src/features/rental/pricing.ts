import type { Choice, Engine, QuoteResult, Trim } from './types';
import { vehiclePhotos } from '../../data/vehicle';

// Public comparative lowest monthly rent figures, 2026-11-02 (2027 Grandeur).
// 20,000 km/year, no added equipment, and rates for zero upfront, 30% prepay,
// and 30% refundable deposit. Figures for these three terms can originate from
// different providers; interpolation is illustrative, NOT an executable offer.
// https://www.autosign.kr/장기렌트/그랜저
type Months = Choice['months'];
type Rate = { base: number; prepay30: number; deposit30: number };
const marketRates: Record<Engine, Partial<Record<Trim, Record<Months, Rate>>>> = {
  gasoline: {
    premium: {
      36: { base: 658500, prepay30: 284800, deposit30: 600200 },
      48: { base: 612200, prepay30: 328688, deposit30: 553900 },
      60: { base: 591300, prepay30: 351180, deposit30: 526730 },
    },
    exclusive: {
      36: { base: 719000, prepay30: 303270, deposit30: 654500 },
      48: { base: 667900, prepay30: 352330, deposit30: 603400 },
      60: { base: 644900, prepay30: 378880, deposit30: 574270 },
    },
    calligraphy: {
      36: { base: 801900, prepay30: 328600, deposit30: 728900 },
      48: { base: 744300, prepay30: 384340, deposit30: 671300 },
      60: { base: 718400, prepay30: 414630, deposit30: 640020 },
    },
  },
  lpg: {
    premium: {
      36: { base: 738500, prepay30: 359920, deposit30: 678100 },
      48: { base: 684400, prepay30: 402490, deposit30: 624000 },
      60: { base: 659000, prepay30: 426930, deposit30: 598600 },
    },
    exclusive: {
      36: { base: 803300, prepay30: 384100, deposit30: 736800 },
      48: { base: 743900, prepay30: 431190, deposit30: 677300 },
      60: { base: 715900, prepay30: 458050, deposit30: 649400 },
    },
  },
};

const vehiclePrices: Record<Engine, Partial<Record<Trim, number>>> = {
  gasoline: { premium: 42450000, exclusive: 46940000, calligraphy: 53100000 },
  lpg: { premium: 43930000, exclusive: 48420000 },
};

// No standardized public quote for every mileage selection. These are transparent
// monthly estimation adjustments relative to the published 20k-km benchmark.
const mileageAdjustments: Record<Choice['mileage'], number> = {
  10000: -30000, 15000: -15000, 20000: 0, 30000: 30000, unlimited: 75000,
};

// Fitcar's own lender-rate API should replace this entire adapter in production.
export function simulateQuote(s: Choice): QuoteResult {
  // An unavailable LPG Calligraphy legacy selection is guarded in the UI/store.
  const availableTrim = s.engine === 'lpg' && s.trim === 'calligraphy' ? 'exclusive' : s.trim;
  const rate = marketRates[s.engine][availableTrim]![s.months];
  const baseVehiclePrice = vehiclePrices[s.engine][availableTrim]!;
  const colorPremium = vehiclePhotos[s.color].surcharge;
  const referencePrice = baseVehiclePrice + colorPremium;

  const prepayReduction = (rate.base - rate.prepay30) * s.prepay / 30;
  const depositReduction = (rate.base - rate.deposit30) * s.deposit / 30;
  // Illustrative 1.4% monthly pass-through on one-time color premium.
  const colorMonthly = colorPremium * .014;
  const estimate = rate.base - prepayReduction - depositReduction +
    mileageAdjustments[s.mileage] + colorMonthly;
  return {
    amount: Math.round(Math.max(0, estimate) / 100) * 100,
    referencePrice,
    status: 'reference',
    calculationVersion: 'market-reference-v2',
  };
}
