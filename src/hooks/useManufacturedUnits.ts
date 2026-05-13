"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  subscribeToManufacturedUnits,
  type ManufacturedUnit,
} from '@/lib/manufacturedUnits';

export function useManufacturedUnits(searchTerm = '') {
  const [units, setUnits] = useState<ManufacturedUnit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoadingUnits(true);
    setError(null);

    const unsubscribe = subscribeToManufacturedUnits(
      nextUnits => {
        setUnits(nextUnits);
        setIsLoadingUnits(false);
      },
      nextError => {
        setError(nextError);
        setIsLoadingUnits(false);
      }
    );

    return unsubscribe;
  }, []);

  const filteredUnits = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return units;

    return units.filter(unit =>
      unit.productNumber.toLowerCase().includes(term) ||
      unit.productName.toLowerCase().includes(term) ||
      unit.category.toLowerCase().includes(term)
    );
  }, [searchTerm, units]);

  return {
    units,
    filteredUnits,
    isLoadingUnits,
    error,
  };
}
