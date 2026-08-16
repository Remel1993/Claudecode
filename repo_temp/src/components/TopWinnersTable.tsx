// @ts-nocheck
import { Star, Trophy } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";
import { getTopWinners, subscribeTitles, type WinnerRow } from "@/lib/palmares";
import { getCountryCode } from "@/lib/countries";

const useTitlesVersion = () =>
  useSyncExternalStore(
    (cb) => subscribeTitles(cb),
    () => {
      try {
        return typeof window === "undefined"
          ? "0"
          : (window.localStorage.getItem(
              "dice-football-hub-elite-v6_palmares",
            ) ?? "0");
      } catch {
        return "0";
      }
    },
    () => "0",
  );

const Stars = ({ count }: { count: number }) => (
  <div className="flex flex-wrap gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <Star
        key={i}
        size={11}
        className="fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]"
      />
    ))}
  </div>
);

/** Escudo/bandera compacto para la tabla de máximos ganadores. */
const Crest = ({
  name,
  color1,
  color2,
  isFlag,
}: {
  name: string;
  color1?: string | undefined;
  color2?: string | undefined;
  isFlag?: boolean | undefined;
}) => {
  const initial = name ? name[0] : "?";
  if (isFlag) {
    const code = getCountryCode(name);
    if (code) {
      return (
        <div className="relative h-6 w-8 shrink-0 overflow-hidden rounded-sm border border-white/10 shadow-md">
          <img
            src={`https://flagcdn.com/${code}.svg`}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      );
    }
    return (
      <div className="relative h-8 w-7 shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-md">
        <div className="absolute inset-0 flex flex-col">
          <div className="h-1/2 w-full" style={{ backgroundColor: color1 || "#333" }} />
          <div className="h-1/2 w-full" style={{ backgroundColor: color2 || "#666" }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black italic text-white mix-blend-difference">
            {initial}
          </span>
        </div>
      </div>
    );
  }
  return (
    <div
      className="relative h-9 w-7 shrink-0 overflow-hidden shadow-md"
      style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 80%, 50% 100%, 0% 80%)" }}
    >
      <div className="absolute inset-0 flex">
        <div className="h-full w-1/2" style={{ backgroundColor: color1 || "#333" }} />
        <div className="h-full w-1/2" style={{ backgroundColor: color2 || "#666" }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-black italic text-white mix-blend-difference">
          {initial}
        </span>
      </div>
    </div>
  );
};

export interface LocalChampionRecord {
  season: number;
  champion: {
    name: string;
    color1?: string | undefined;
    color2?: string | undefined;
    isFlag?: boolean | undefined;
  };
}

/** Fusiona el registro global de títulos con el historial local de la competición. */
const mergeRows = (base: WinnerRow[], records: LocalChampionRecord[]): WinnerRow[] => {
  const map = new Map<string, WinnerRow>();
  base.forEach((r) => map.set(r.teamName, { ...r, seasons: [...r.seasons] }));
  records.forEach((rec) => {
    const c = rec?.champion;
    if (!c?.name) return;
    const row = map.get(c.name) ?? {
      teamName: c.name,
      titles: 0,
      color1: c.color1,
      color2: c.color2,
      isFlag: c.isFlag,
      seasons: [] as number[],
    };
    if (row.seasons.includes(rec.season)) return;
    row.titles += 1;
    row.seasons.push(rec.season);
    if (!row.color1) row.color1 = c.color1;
    if (!row.color2) row.color2 = c.color2;
    if (row.isFlag === undefined) row.isFlag = c.isFlag;
    map.set(c.name, row);
  });
  return [...map.values()].sort(
    (a, b) => b.titles - a.titles || a.teamName.localeCompare(b.teamName),
  );
};

export const TopWinnersTable = ({
  compId,
  div = 1,
  records = [],
  emptyLabel = "Todavía no hay campeones registrados.",
}: {
  compId: string;
  div?: number;
  records?: LocalChampionRecord[];
  emptyLabel?: string;
}) => {
  const version = useTitlesVersion();
  const rows: WinnerRow[] = useMemo(
    () => mergeRows(getTopWinners(compId, div), records),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compId, div, version, records],
  );

  if (!rows.length) {
    return (
      <p className="py-10 text-center text-[11px] font-bold italic text-slate-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-400/20 bg-slate-950/70">
      <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 bg-amber-500/10 px-3 py-2">
        <span className="text-[8px] font-black uppercase tracking-widest text-amber-300">
          #
        </span>
        <span className="w-8 text-[8px] font-black uppercase tracking-widest text-amber-300" />
        <span className="text-[8px] font-black uppercase tracking-widest text-amber-300">
          Equipo
        </span>
        <span className="text-[8px] font-black uppercase tracking-widest text-amber-300">
          Títulos
        </span>
      </div>
      <div className="divide-y divide-white/5">
        {rows.map((r, i) => (
          <div
            key={r.teamName}
            className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5"
          >
            <span className="w-4 text-[10px] font-black italic text-slate-400">
              {i + 1}
            </span>
            <div className="flex w-8 justify-center">
              <Crest
                name={r.teamName}
                color1={r.color1}
                color2={r.color2}
                isFlag={r.isFlag}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-black uppercase italic text-white">
                {r.teamName}
              </p>
              <Stars count={r.titles} />
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-500/15 px-2 py-1 text-[10px] font-black text-amber-300">
              <Trophy size={10} /> {r.titles}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopWinnersTable; 
 
