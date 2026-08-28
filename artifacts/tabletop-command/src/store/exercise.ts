import { useState, useEffect, useCallback } from 'react';

export type InjectStatus = 'pending' | 'active' | 'completed';
export type InjectType = 'public' | 'private';

export interface Inject {
  id: string;
  title: string;
  content: string;
  type: InjectType;
  status: InjectStatus;
  audience?: string;
  deployedAt?: number;
}

export interface HotWashItem {
  id: string;
  text: string;
  timestamp: number;
  team?: string;
  question?: string;
}

export type TheatricalEffect = 'none' | 'alarm' | 'wrong-assumption';

export interface ExerciseState {
  status: 'setup' | 'running' | 'paused' | 'completed';
  endTime: number | null; 
  durationLeft: number; 
  scenarioTitle: string;
  objective: string;
  publicBriefing: string;
  phase: string;
  injects: Inject[];
  notes: string;
  hotWash: HotWashItem[];
  effect: TheatricalEffect;
  customMessage: string | null;
}

export const SAMPLE_INJECTS: Inject[] = [
  { id: '1', title: 'Ransomware Note Detected', content: 'Helpdesk reports a user seeing a red skull on their screen. The text demands 50 BTC.', type: 'public', status: 'pending' },
  { id: '2', title: 'CISO Inquiry', content: 'The CISO is asking for a status update. They need to know if data has been exfiltrated.', type: 'private', status: 'pending' },
  { id: '3', title: 'Media Leak', content: 'A tech blog just published an article claiming your company is breached.', type: 'public', status: 'pending' },
  { id: '4', title: 'Domain Controller Offline', content: 'DC-01 has stopped responding to ping. Authentication is failing for 30% of users.', type: 'public', status: 'pending' },
];

export const INITIAL_STATE: ExerciseState = {
  status: 'setup',
  endTime: null,
  durationLeft: 60 * 60 * 1000,
  scenarioTitle: 'Operation Black Lantern',
  objective: 'Coordinate containment, communications, and recovery under incomplete information.',
  publicBriefing: 'A series of failed logins and a sudden finance outage suggest a coordinated compromise. The source and scope are unknown.',
  phase: 'Phase 1: Initial Compromise',
  injects: SAMPLE_INJECTS,
  notes: '',
  hotWash: [],
  effect: 'none',
  customMessage: null,
};

export function useExerciseStore() {
  const [state, setState] = useState<ExerciseState>(() => {
    try {
      const item = window.localStorage.getItem('tabletop_state');
      if (!item) return INITIAL_STATE;
      return { ...INITIAL_STATE, ...JSON.parse(item) };
    } catch (error) {
      return INITIAL_STATE;
    }
  });

  const setSharedState = useCallback((updater: ExerciseState | ((prev: ExerciseState) => ExerciseState)) => {
    setState(prev => {
      const next = updater instanceof Function ? updater(prev) : updater;
      window.localStorage.setItem('tabletop_state', JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tabletop_state' && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { state, setState: setSharedState };
}
