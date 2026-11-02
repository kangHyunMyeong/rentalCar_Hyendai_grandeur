import type { Choice, Color, Engine, Trim } from '../features/rental/types';

// Seven user-supplied car cutouts, paired with official exterior color names.
// Surcharges are reference vehicle-price differences, not rental quotations.
export const vehiclePhotos: Record<Color, { url: string; name: string; hex: string; surcharge: number }> = {
  artisanalBurgundy: {
    url: '/images/colors/artisanal-burgundy-pearl-hd.webp',
    name: '아티스널 버건디 펄', hex: '#602935', surcharge: 0,
  },
  serenityWhite: {
    url: '/images/colors/serenity-white-pearl-hd.webp',
    name: '세레니티 화이트 펄', hex: '#ecebe7', surcharge: 100000,
  },
  aeroSilver: {
    url: '/images/colors/aero-silver-metallic-hd.webp',
    name: '에어로 실버 메탈릭', hex: '#b7bbbe', surcharge: 0,
  },
  transmissionBlue: {
    url: '/images/colors/transmission-blue-pearl-hd.webp',
    name: '트랜스미션 블루 펄', hex: '#26394e', surcharge: 0,
  },
  nocturneMetallic: {
    url: '/images/colors/nocturne-gray-metallic-hd.webp',
    name: '녹턴 그레이 메탈릭', hex: '#5e6267', surcharge: 0,
  },
  biophilicBlue: {
    url: '/images/colors/biophilic-blue-pearl-hd.webp',
    name: '바이오필릭 블루 펄', hex: '#42657a', surcharge: 0,
  },
  abyssBlack: {
    url: '/images/colors/abyss-black-pearl-hd.webp',
    name: '어비스 블랙 펄', hex: '#17191d', surcharge: 0,
  },
};

export const engineNames: Record<Engine, string> = {
  gasoline: '가솔린', lpg: 'LPG',
};
export const trimNames: Record<Trim, string> = {
  premium: '프리미엄', exclusive: '익스클루시브', calligraphy: '캘리그래피',
};
export const money = (num: number) => new Intl.NumberFormat('ko-KR').format(num);
export const mileageLabel = (mileage: Choice['mileage']) =>
  mileage === 'unlimited' ? '무제한' : `${money(mileage)}km`;
