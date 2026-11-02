import { create } from 'zustand';
import type { Choice } from './types';

type ChoiceStore = Choice & {
  setChoice: <K extends keyof Choice>(key: K, value: Choice[K]) => void;
};

export const useChoice = create<ChoiceStore>((set) => ({
  engine: 'gasoline', trim: 'premium', color: 'biophilicBlue', months: 48,
  mileage: 15000, prepay: 0, deposit: 0,
  setChoice: (key, value) => set((current) => {
    if (key === 'engine' && value === 'lpg' && current.trim === 'calligraphy') {
      return { engine: 'lpg', trim: 'premium' };
    }
    if (key === 'trim' && value === 'calligraphy' && current.engine === 'lpg') return {};
    return { [key]: value } as Partial<Choice>;
  }),
}));
