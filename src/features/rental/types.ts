export type Engine = 'gasoline' | 'lpg';
export type Trim = 'premium' | 'exclusive' | 'calligraphy';
export type Color =
  | 'artisanalBurgundy' | 'serenityWhite' | 'aeroSilver' | 'transmissionBlue'
  | 'nocturneMetallic' | 'biophilicBlue' | 'abyssBlack';

export type Choice = {
  engine: Engine;
  trim: Trim;
  color: Color;
  months: 36 | 48 | 60;
  mileage: 10000 | 15000 | 20000 | 30000 | 'unlimited';
  prepay: 0 | 10 | 20 | 30;
  deposit: 0 | 10 | 20 | 30;
};

export type QuoteResult = {
  amount: number;
  referencePrice: number;
  status: 'reference';
  calculationVersion: 'market-reference-v2';
};
