import { useMemo, useState, useEffect } from 'react';
import nichesData from '@/data/niches.json';
import { useI18n } from '@/contexts/I18nContext';

export interface Niche {
  id: string;
  name_en: string;
  name_ar: string;
}

const CUSTOM_NICHES_KEY = 'craftfolio_custom_niches';

export const useNiches = () => {
  const { locale } = useI18n();
  const [customNiches, setCustomNiches] = useState<string[]>([]);

  // Load custom niches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CUSTOM_NICHES_KEY);
    if (saved) {
      try {
        setCustomNiches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load custom niches:', e);
      }
    }
  }, []);

  // Built-in niches
  const builtInNiches: Niche[] = useMemo(() => {
    const data = nichesData as { en: string[]; ar: string[] };
    return data.en.map((nameEn, idx) => ({
      id: `builtin-${idx}`,
      name_en: nameEn,
      name_ar: data.ar[idx] || nameEn,
    }));
  }, []);

  // All niches (built-in + custom)
  const allNiches = useMemo(() => {
    const customNicheObjects: Niche[] = customNiches.map((name, idx) => ({
      id: `custom-${idx}`,
      name_en: name,
      name_ar: name,
    }));
    return [...builtInNiches, ...customNicheObjects];
  }, [builtInNiches, customNiches]);

  const getNicheDisplay = (niche: Niche) => {
    return locale === 'ar' ? niche.name_ar : niche.name_en;
  };

  const findNiche = (searchTerm: string): Niche | undefined => {
    return allNiches.find(
      (n) =>
        n.name_en.toLowerCase() === searchTerm.toLowerCase() ||
        n.name_ar.toLowerCase() === searchTerm.toLowerCase()
    );
  };

  const addCustomNiche = (nicheName: string) => {
    if (!nicheName.trim()) return;
    
    const exists = allNiches.some(
      (n) =>
        n.name_en.toLowerCase() === nicheName.toLowerCase() ||
        n.name_ar.toLowerCase() === nicheName.toLowerCase()
    );
    
    if (exists) return;

    const updated = [...customNiches, nicheName.trim()];
    setCustomNiches(updated);
    localStorage.setItem(CUSTOM_NICHES_KEY, JSON.stringify(updated));
  };

  return {
    niches: allNiches,
    builtInNiches,
    customNiches,
    getNicheDisplay,
    findNiche,
    addCustomNiche,
  };
};
