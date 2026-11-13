// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Zap, RefreshCw } from 'lucide-react';

const EDH_GAME_CHANGERS = new Set([
  'ancient tomb',
  "bolas's citadel",
  'chrome mox',
  'cyclonic rift',
  'demonic tutor',
  'drannith magistrate',
  'enlightened tutor',
  'expropriate',
  'fierce guardianship',
  'force of will',
  "gaea's cradle",
  'glacial chasm',
  'grand arbiter augustin iv',
  'grim monolith',
  'imperial seal',
  "jeska's will",
  'jin-gitaxias, core augur',
  'kinnan, bonder prodigy',
  "lion's eye diamond",
  'mana vault',
  'mox diamond',
  'mystical tutor',
  'notion thief',
  'opposition agent',
  'rhystic study',
  "serra's sanctum",
  'smothering tithe',
  'survival of the fittest',
  'tergrid, god of fright',
  "thassa's oracle",
  'the one ring',
  'the tabernacle at pendrell vale',
  'trinisphere',
  'trouble in pairs',
  'underworld breach',
  'urza, lord high artificer',
  'vampiric tutor',
  'vorinclex, voice of hunger',
  'winota, joiner of forces',
  'worldly tutor'
]);

export default function DeckAnalyticsTab({ decklist = [], onPreviewCard }) {
  const [enrichedCards, setEnrichedCards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!Array.isArray(decklist) || decklist.length === 0) {
      setEnrichedCards([]);
      return;
    }
    let active = true;
    setLoading(true);

    const fetchBatchMetadata = async () => {
      try {
        const uniqueNames = Array.from(
          new Set(decklist.map((c) => c.name.split('//')[0].trim()))
        );
        const chunks = [];
        for (let i = 0; i < uniqueNames.length; i += 75) {
          chunks.push(uniqueNames.slice(i, i + 75));
        }

        const metaMap = new Map();
        for (const chunk of chunks) {
          const res = await fetch('https://api.scryfall.com/cards/collection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifiers: chunk.map((name) => ({ name }))
            })
          });
          if (res.ok) {
            const json = await res.json();
            (json.data || []).forEach((card) => {
              metaMap.set(card.name.toLowerCase(), card);
              if (card.name.includes('//')) {
                metaMap.set(card.name.split('//')[0].trim().toLowerCase(), card);
              }
            });
          }
        }

        if (!active) return;
        const merged = decklist.map((entry) => {
          const primaryKey = entry.name.split('//')[0].trim().toLowerCase();
          const scry = metaMap.get(entry.name.toLowerCase()) || metaMap.get(primaryKey);
          return {
            ...entry,
            cmc: typeof scry?.cmc === 'number' ? scry.cmc : null,
            typeLine: scry?.type_line || ''
          };
        });
        setEnrichedCards(merged);
      } catch {
        if (active) setEnrichedCards(decklist);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBatchMetadata();
    return () => {
      active = false;
    };
  }, [decklist]);

  const stats = useMemo(() => {
    const gameChangers = decklist.filter((c) =>
      EDH_GAME_CHANGERS.has(c.name.toLowerCase())
    );

    const curveBuckets = [
      { label: '0', count: 0 },
      { label: '1', count: 0 },
      { label: '2', count: 0 },
      { label: '3', count: 0 },
      { label: '4', count: 0 },
      { label: '5', count: 0 },
      { label: '6', count: 0 },
      { label: '7+', count: 0 }
    ];

    const typeCounts = {
      Creatures: 0,
      Instants: 0,
      Sorceries: 0,
      Artifacts: 0,
      Enchantments: 0,
      Planeswalkers: 0,
      Lands: 0
    };

    let nonLandCards = 0;
    let totalCmc = 0;

    enrichedCards.forEach((c) => {
      const qty = c.qty || 1;
      const tl = (c.typeLine || '').toLowerCase();
      const isLand = tl.includes('land');

      if (isLand) {
        typeCounts.Lands += qty;
      } else {
        if (tl.includes('creature')) typeCounts.Creatures += qty;
        if (tl.includes('instant')) typeCounts.Instants += qty;
        if (tl.includes('sorcery')) typeCounts.Sorceries += qty;
        if (tl.includes('artifact')) typeCounts.Artifacts += qty;
        if (tl.includes('enchantment')) typeCounts.Enchantments += qty;
        if (tl.includes('planeswalker')) typeCounts.Planeswalkers += qty;

        if (typeof c.cmc === 'number') {
          nonLandCards += qty;
          totalCmc += c.cmc * qty;
          const idx = Math.min(7, Math.max(0, Math.floor(c.cmc)));
          curveBuckets[idx].count += qty;
        }
      }
    });

    const maxBucket = Math.max(...curveBuckets.map((b) => b.count), 1);
    const avgCmc = nonLandCards > 0 ? (totalCmc / nonLandCards).toFixed(2) : '—';

    return {
      gameChangers,
      curveBuckets,
      maxBucket,
      typeCounts,
      avgCmc
    };
  }, [decklist, enrichedCards]);

  if (decklist.length === 0) {
    return (
      <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 space-y-2">
        <PieChart className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="text-sm font-semibold text-slate-300">
          Add or sync your decklist first to unlock Curve & Game Changers analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Official EDH Game Changers Check */}
      <div className="rounded-2xl bg-slate-950/70 border border-amber-500/30 p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Official EDH "Game Changers" Detector
            </h3>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
              stats.gameChangers.length === 0
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {stats.gameChangers.length}{' '}
            {stats.gameChangers.length === 1 ? 'Game Changer' : 'Game Changers'}
          </span>
        </div>

        {stats.gameChangers.length === 0 ? (
          <p className="text-xs text-slate-400">
            Zero official EDH Game Changers detected — great fit for Bracket 2 (Core) or lower-power pods!
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              Flagged high-impact staples in this list (click any card to preview):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {stats.gameChangers.map((gc) => (
                <button
                  key={gc.name}
                  type="button"
                  onClick={() => onPreviewCard(gc.name)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/35 text-xs font-semibold transition-colors"
                >
                  ⚡ {gc.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mana Curve & Card Type Breakdown */}
      {loading ? (
        <div className="py-10 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
          <span>Analyzing mana curve & card types via Scryfall...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Mana Curve Chart */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Mana Curve (Non-Land Spells)</h3>
              <span className="text-xs text-slate-400">
                Avg Mana Value: <strong className="text-indigo-300">{stats.avgCmc}</strong>
              </span>
            </div>

            <div className="h-44 pt-4 flex items-end justify-between gap-2">
              {stats.curveBuckets.map((b) => {
                const heightPct = Math.round((b.count / stats.maxBucket) * 100);
                return (
                  <div
                    key={b.label}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                  >
                    <span className="text-[11px] font-bold text-slate-300">{b.count}</span>
                    <div className="w-full bg-slate-900 rounded-t-lg h-28 flex items-end overflow-hidden border border-slate-800/80">
                      <div
                        style={{ height: `${Math.max(b.count > 0 ? 10 : 0, heightPct)}%` }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-sky-400 rounded-t-md transition-all duration-500"
                      />
                    </div>
                    <span className="text-xs font-extrabold text-slate-400">{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card Type Breakdown */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-2.5">
            <h3 className="text-sm font-bold text-white mb-1">Card Type Breakdown</h3>
            {Object.entries(stats.typeCounts).map(([typeName, count]) => (
              <div
                key={typeName}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80"
              >
                <span className="text-slate-300 font-medium">{typeName}</span>
                <span className="font-extrabold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
