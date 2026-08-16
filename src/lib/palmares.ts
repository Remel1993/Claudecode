// @ts-nocheck
// src/lib/palmares.ts

export interface WinnerRow {
  teamName: string;
  titles: number;
  color1?: string;
  color2?: string;
  isFlag?: boolean;
  seasons: number[];
}

export interface TitleEntry {
  id?: string | number;
  compId: string;
  compName: string;
  type?: 'league' | 'cup';
  div: number;
  winner: { name: string; color1?: string; color2?: string; isFlag?: boolean };
  season: number;
  date?: string;
}

const STORAGE_KEY = 'dice-football-hub-elite-v6_palmares';

const isDuplicate = (existing: TitleEntry, candidate: TitleEntry) => {
  if (candidate.id && existing.id && candidate.id === existing.id) return true;
  if (candidate.type === 'league' || (!candidate.type && candidate.compId !== 'C1' && candidate.compId !== 'C2')) {
    return existing.compId === candidate.compId &&
      existing.div === candidate.div &&
      existing.season === candidate.season;
  }
  return existing.compId === candidate.compId &&
    existing.div === candidate.div &&
    existing.season === candidate.season &&
    existing.winner?.name === candidate.winner?.name;
};

// Obtener todos los títulos guardados
export const getTitles = (): TitleEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Guardar un único título (evita duplicados por temporada/competición)
export const registerTitle = (entry: TitleEntry) => {
  if (!entry || !entry.winner || !entry.winner.name) return;
  const all = getTitles();
  const exists = all.some((e) => isDuplicate(e, entry));
  if (!exists) {
    all.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    // Notificar a los suscriptores
    notifySubscribers();
  }
};

// Guardar múltiples títulos de una vez (para temporadas completas)
export const registerTitles = (entries: TitleEntry[]) => {
  if (!Array.isArray(entries) || !entries.length) return;
  const all = getTitles();
  let changed = false;
  entries.forEach((entry) => {
    if (!entry || !entry.winner || !entry.winner.name) return;
    const exists = all.some((e) => isDuplicate(e, entry));
    if (!exists) {
      all.push(entry);
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    notifySubscribers();
  }
};

// Obtener los máximos ganadores de una competición y división
export const getTopWinners = (compId: string, div: number): WinnerRow[] => {
  const all = getTitles();
  const filtered = all.filter((t) => t.compId === compId && t.div === div);
  const map = new Map<string, WinnerRow>();
  filtered.forEach((t) => {
    const name = t.winner.name;
    const row = map.get(name) || {
      teamName: name,
      titles: 0,
      color1: t.winner.color1,
      color2: t.winner.color2,
      isFlag: t.winner.isFlag,
      seasons: [],
    };
    row.titles += 1;
    if (!row.seasons.includes(t.season)) row.seasons.push(t.season);
    map.set(name, row);
  });
  return Array.from(map.values()).sort((a, b) => b.titles - a.titles || a.teamName.localeCompare(b.teamName));
};

// Sistema de suscripción para actualizar la UI cuando cambien los títulos
type Listener = () => void;
const listeners: Listener[] = [];

export const subscribeTitles = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

const notifySubscribers = () => {
  // Incrementar una versión en localStorage para forzar re-render
  const version = Date.now().toString();
  localStorage.setItem('dice-football-hub-elite-v6_palmares_version', version);
  listeners.forEach((fn) => fn());
};