// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Trophy,
  Plus,
  ExternalLink,
  BarChart3,
  History,
  Layers,
  Sparkles,
  Trash2,
  Edit3,
  Download,
  Upload,
  Check,
  X,
  Search,
  ArrowUpDown,
  Flame,
  Calendar,
  Users,
  Award,
  AlertCircle,
  RefreshCw,
  Star,
  Smile,
  GitCommit,
  FileText,
  Eye,
  ChevronRight,
  Copy,
  CheckCircle2,
  Dices,
  Shield,
  TrendingUp,
  TrendingDown,
  Scissors,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Cloud,
  Lock,
  Mail,
  Zap,
  Share2,
  PieChart
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  writeBatch
} from 'firebase/firestore';

// ============================================================================
// CLOUD PERSISTENCE & AUTHENTICATION INITIALIZATION
// ============================================================================
const firebaseConfig =
  typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : {
        apiKey: 'AIzaSyCOiQYNfcRqZ9WGb5wPXBdQUlsf-Oa-iGk',
        authDomain: 'commander-vault-a94e1.firebaseapp.com',
        projectId: 'commander-vault-a94e1'
      };
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// ============================================================================
// MTG COLOR IDENTITY DEFINITIONS & AUTHENTIC SVG MANA PIPS
// ============================================================================
const MTG_COLORS = {
  W: { name: 'White', bg: '#F8F6D8', border: '#D4AF37', text: '#1E293B', glow: 'rgba(248, 246, 216, 0.35)' },
  U: { name: 'Blue', bg: '#0E68AB', border: '#38BDF8', text: '#FFFFFF', glow: 'rgba(14, 104, 171, 0.45)' },
  B: { name: 'Black', bg: '#27242B', border: '#A855F7', text: '#E2E8F0', glow: 'rgba(168, 85, 247, 0.4)' },
  R: { name: 'Red', bg: '#D3202A', border: '#FB7185', text: '#FFFFFF', glow: 'rgba(211, 32, 42, 0.45)' },
  G: { name: 'Green', bg: '#00733E', border: '#34D399', text: '#FFFFFF', glow: 'rgba(0, 115, 62, 0.45)' }
};

const COLOR_ORDER = ['W', 'U', 'B', 'R', 'G'];

const getGuildOrShardName = (colors) => {
  const sorted = [...colors].sort((a, b) => COLOR_ORDER.indexOf(a) - COLOR_ORDER.indexOf(b)).join('');
  const map = {
    '': 'Colorless',
    W: 'Mono-White',
    U: 'Mono-Blue',
    B: 'Mono-Black',
    R: 'Mono-Red',
    G: 'Mono-Green',
    WU: 'Azorius',
    UB: 'Dimir',
    BR: 'Rakdos',
    RG: 'Gruul',
    WG: 'Selesnya',
    WB: 'Orzhov',
    UR: 'Izzet',
    BG: 'Golgari',
    WR: 'Boros',
    UG: 'Simic',
    WUB: 'Esper',
    UBR: 'Grixis',
    BRG: 'Jund',
    WRG: 'Naya',
    WUG: 'Bant',
    WBG: 'Abzan',
    WUR: 'Jeskai',
    UBG: 'Sultai',
    WBR: 'Mardu',
    URG: 'Temur',
    WUBR: 'Yore-Tiller (No Green)',
    UBRG: 'Glint-Eye (No White)',
    WBRG: 'Dune-Brood (No Blue)',
    WURG: 'Ink-Treader (No Black)',
    WUBG: 'Witch-Maw (No Red)',
    WUBRG: 'Five-Color (WUBRG)'
  };
  return map[sorted] || sorted;
};

const ManaPip = ({ color, size = 'sm' }) => {
  const c = MTG_COLORS[color];
  if (!c) return null;
  const dims = size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs';
  return (
    <span
      title={c.name}
      style={{
        backgroundColor: c.bg,
        borderColor: c.border,
        color: c.text,
        boxShadow: `0 0 8px ${c.glow}`
      }}
      className={`${dims} inline-flex items-center justify-center rounded-full border font-extrabold tracking-tighter select-none shrink-0`}
    >
      {color}
    </span>
  );
};

// ============================================================================
// COMMANDER BRACKETS (1-5) DEFINITIONS
// ============================================================================
const COMMANDER_BRACKETS = {
  1: {
    label: 'Bracket 1',
    short: 'B1 • Exhibition',
    desc: 'Theme / Exhibition / Ultra-Casual',
    badge: 'bg-slate-800 text-slate-300 border-slate-600'
  },
  2: {
    label: 'Bracket 2',
    short: 'B2 • Core',
    desc: 'Modern Precon Level / Core',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
  },
  3: {
    label: 'Bracket 3',
    short: 'B3 • Upgraded',
    desc: 'Upgraded / Synergistic',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/35'
  },
  4: {
    label: 'Bracket 4',
    short: 'B4 • Optimized',
    desc: 'High Power / Optimized',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/35'
  },
  5: {
    label: 'Bracket 5',
    short: 'B5 • cEDH',
    desc: 'Competitive EDH',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/35'
  }
};

// ============================================================================
// OFFICIAL EDH "GAME CHANGERS" LIST (FOR BRACKET & DECK POWER VERIFICATION)
// ============================================================================
const EDH_GAME_CHANGERS = new Set([
  'ancient tomb',
  'bolas\'s citadel',
  'chrome mox',
  'cyclonic rift',
  'demonic tutor',
  'drannith magistrate',
  'enlightened tutor',
  'expropriate',
  'fierce guardianship',
  'force of will',
  'gaea\'s cradle',
  'glacial chasm',
  'grand arbiter augustin iv',
  'grim monolith',
  'imperial seal',
  'jeska\'s will',
  'jin-gitaxias, core augur',
  'kinnan, bonder prodigy',
  'lion\'s eye diamond',
  'mana vault',
  'mox diamond',
  'mystical tutor',
  'notion thief',
  'opposition agent',
  'rhystic study',
  'serra\'s sanctum',
  'smothering tithe',
  'survival of the fittest',
  'tergrid, god of fright',
  'thassa\'s oracle',
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

// ============================================================================
// SCRYFALL COMMANDER ART CACHE & FETCHER (OPTION 1)
// ============================================================================
const commanderArtCache = new Map();

async function fetchCommanderArtCrop(cardName) {
  if (!cardName) return null;
  const cleanName = cardName.split('//')[0].trim();
  const key = cleanName.toLowerCase();
  if (commanderArtCache.has(key)) {
    return commanderArtCache.get(key);
  }
  try {
    const res = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cleanName)}`
    );
    if (!res.ok) {
      commanderArtCache.set(key, null);
      return null;
    }
    const data = await res.json();
    const artUrl =
      data.image_uris?.art_crop ||
      data.card_faces?.[0]?.image_uris?.art_crop ||
      data.image_uris?.normal ||
      null;
    commanderArtCache.set(key, artUrl);
    return artUrl;
  } catch {
    return null;
  }
}

const CommanderArtBanner = ({ deck, heightClass = 'h-24', children }) => {
  const [primaryArt, setPrimaryArt] = useState(deck?.primaryArtUrl || null);
  const [partnerArt, setPartnerArt] = useState(deck?.partnerArtUrl || null);

  useEffect(() => {
    let active = true;
    const primaryName =
      deck?.primaryCommander || (deck?.name ? deck.name.split(' & ')[0].trim() : '');
    const partnerName =
      deck?.partnerCommander ||
      (deck?.name && deck.name.includes(' & ')
        ? deck.name.split(' & ').slice(1).join(' & ').trim()
        : '');

    if (deck?.primaryArtUrl) {
      setPrimaryArt(deck.primaryArtUrl);
    } else if (primaryName) {
      fetchCommanderArtCrop(primaryName).then((url) => {
        if (active && url) setPrimaryArt(url);
      });
    } else {
      setPrimaryArt(null);
    }

    if (deck?.partnerArtUrl) {
      setPartnerArt(deck.partnerArtUrl);
    } else if (partnerName) {
      fetchCommanderArtCrop(partnerName).then((url) => {
        if (active && url) setPartnerArt(url);
      });
    } else {
      setPartnerArt(null);
    }

    return () => {
      active = false;
    };
  }, [deck?.id, deck?.name, deck?.primaryCommander, deck?.partnerCommander, deck?.primaryArtUrl, deck?.partnerArtUrl]);

  return (
    <div className={`relative ${heightClass} w-full overflow-hidden bg-slate-950`}>
      {primaryArt && partnerArt ? (
        <div className="absolute inset-0 grid grid-cols-2">
          <img
            src={primaryArt}
            alt={deck?.name || 'Primary Commander'}
            className="w-full h-full object-cover object-center opacity-55 group-hover:scale-105 transition-transform duration-500"
          />
          <img
            src={partnerArt}
            alt={deck?.partnerCommander || 'Partner Commander'}
            className="w-full h-full object-cover object-center opacity-55 group-hover:scale-105 transition-transform duration-500 border-l border-slate-900/80"
          />
        </div>
      ) : primaryArt ? (
        <img
          src={primaryArt}
          alt={deck?.name || 'Commander Art'}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-55 group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-slate-900 to-indigo-950/60" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/55 to-slate-950/40" />
      <div className="relative z-10 h-full flex flex-col justify-between p-4">{children}</div>
    </div>
  );
};

// ============================================================================
// DECK ANALYTICS PANEL: MANA CURVE, CARD TYPES & GAME CHANGERS (OPTION 3)
// ============================================================================
const DeckAnalyticsTab = ({ decklist = [], onPreviewCard }) => {
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
      avgCmc,
      nonLandCards
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
                  <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
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
};

// ============================================================================
// DECKLIST PARSING, SERIALIZATION & DIFF UTILITIES
// ============================================================================
function parseDecklistText(rawText) {
  if (!rawText || !rawText.trim()) return [];
  const lines = rawText.split(/\r?\n/);
  const map = new Map();

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (
      line.startsWith('//') ||
      line.startsWith('#') ||
      /^(deck|commander|sideboard|companion|maybeboard):?$/i.test(line)
    ) {
      continue;
    }

    const match = line.match(/^(\d+)x?\s+(.+)$/i);
    let qty = 1;
    let rest = line;
    if (match) {
      qty = parseInt(match[1], 10) || 1;
      rest = match[2];
    }

    let name = rest
      .replace(/\s+\([A-Za-z0-9]{2,6}\)\s*[A-Za-z0-9\-★]*.*$/, '')
      .replace(/\s+\*[A-Za-z]+\*\s*$/, '')
      .trim();

    if (!name) continue;
    const key = name.toLowerCase();
    if (map.has(key)) {
      const existing = map.get(key);
      existing.qty += qty;
    } else {
      map.set(key, { name, qty });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function serializeDecklist(cards) {
  if (!Array.isArray(cards) || cards.length === 0) return '';
  return cards.map((c) => `${c.qty} ${c.name}`).join('\n');
}

function diffDecklists(oldCards = [], newCards = []) {
  const oldMap = new Map(oldCards.map((c) => [c.name.toLowerCase(), c]));
  const newMap = new Map(newCards.map((c) => [c.name.toLowerCase(), c]));

  const added = [];
  const removed = [];

  for (const [key, newCard] of newMap.entries()) {
    const oldCard = oldMap.get(key);
    if (!oldCard) {
      added.push({ name: newCard.name, qty: newCard.qty });
    } else if (newCard.qty > oldCard.qty) {
      added.push({ name: newCard.name, qty: newCard.qty - oldCard.qty });
    }
  }

  for (const [key, oldCard] of oldMap.entries()) {
    const newCard = newMap.get(key);
    if (!newCard) {
      removed.push({ name: oldCard.name, qty: oldCard.qty });
    } else if (oldCard.qty > newCard.qty) {
      removed.push({ name: oldCard.name, qty: oldCard.qty - newCard.qty });
    }
  }

  return { added, removed };
}

function extractMoxfieldId(url) {
  if (!url) return null;
  const match = url.match(/moxfield\.com\/decks\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
}

function extractArchidektId(url) {
  if (!url) return null;
  const match = url.match(/archidekt\.com\/decks\/(\d+)/i);
  return match ? match[1] : null;
}

function getDeckSiteName(url) {
  if (!url) return 'Decklist';
  if (/archidekt\.com/i.test(url)) return 'Archidekt';
  if (/moxfield\.com/i.test(url)) return 'Moxfield';
  return 'Decklist';
}

function parseArchidektApiPayload(data) {
  if (!data || !Array.isArray(data.cards)) return [];
  const excludedCategories = new Set(
    (data.categories || [])
      .filter((cat) => cat && cat.includedInDeck === false)
      .map((cat) => (cat.name || '').toLowerCase())
  );

  const merged = new Map();
  for (const entry of data.cards) {
    const cardName = entry?.card?.oracleCard?.name || entry?.card?.name;
    if (!cardName) continue;

    const cats = Array.isArray(entry.categories) ? entry.categories : [];
    const isExcluded =
      cats.length > 0 &&
      cats.every((c) => {
        const lower = String(c).toLowerCase();
        return (
          excludedCategories.has(lower) ||
          lower === 'maybeboard' ||
          lower === 'sideboard'
        );
      });
    if (isExcluded) continue;

    const key = cardName.toLowerCase();
    const qty = entry.quantity || 1;
    if (merged.has(key)) {
      merged.get(key).qty += qty;
    } else {
      merged.set(key, { name: cardName, qty });
    }
  }
  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchArchidektCardsByUrl(url) {
  const archId = extractArchidektId(url);
  if (!archId) return null;

  // 1. Primary: Private Vercel Serverless Proxy (/api/moxfield?site=archidekt)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const response = await fetch(
      `/api/moxfield?site=archidekt&id=${encodeURIComponent(archId)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        const parsed = parseArchidektApiPayload(json);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // Fallback to public relays if serverless endpoint isn't deployed yet
  }

  // 2. Fallback: Public CORS relays
  const target = `https://archidekt.com/api/decks/${archId}/`;
  const endpoints = [
    `https://corsproxy.io/?url=${encodeURIComponent(target)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        let json = await response.json();
        if (json && typeof json.contents === 'string') {
          json = JSON.parse(json.contents);
        }
        const parsed = parseArchidektApiPayload(json);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Try next endpoint
    }
  }
  return null;
}

function parseMoxfieldApiPayload(data) {
  if (!data) return [];
  const result = [];
  const addSection = (sectionObj) => {
    if (!sectionObj || typeof sectionObj !== 'object') return;
    Object.values(sectionObj).forEach((entry) => {
      if (entry && entry.card && entry.card.name) {
        result.push({
          name: entry.card.name,
          qty: entry.quantity || 1
        });
      }
    });
  };
  addSection(data.commanders);
  addSection(data.companions);
  addSection(data.mainboard);

  // Also handle Moxfield v2 boards structure if returned
  if (data.boards) {
    addSection(data.boards.commanders?.cards);
    addSection(data.boards.companions?.cards);
    addSection(data.boards.mainboard?.cards);
  }

  const merged = new Map();
  for (const item of result) {
    const key = item.name.toLowerCase();
    if (merged.has(key)) {
      merged.get(key).qty += item.qty;
    } else {
      merged.set(key, { ...item });
    }
  }
  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchMoxfieldCardsByUrl(url) {
  const moxId = extractMoxfieldId(url);
  if (!moxId) return null;

  // 1. Primary: Private Vercel Serverless Proxy (/api/moxfield) when hosted
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`/api/moxfield?id=${encodeURIComponent(moxId)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        const parsed = parseMoxfieldApiPayload(json);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // Not yet deployed on Vercel or endpoint unavailable; try browser relays below
  }

  // 2. Fallback: Public proxy relays
  const jsonTargets = [
    `https://api2.moxfield.com/v3/decks/all/${moxId}`,
    `https://api2.moxfield.com/v2/decks/all/${moxId}`
  ];

  const jsonEndpoints = [];
  for (const target of jsonTargets) {
    jsonEndpoints.push(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`);
    jsonEndpoints.push(`https://corsproxy.io/?${encodeURIComponent(target)}`);
    jsonEndpoints.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`);
  }

  for (const endpoint of jsonEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const json = await response.json();
        const parsed = parseMoxfieldApiPayload(json);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Try next proxy endpoint
    }
  }

  // 3. Secondary fallback: Moxfield's plain-text MTGO export endpoint
  const exportUrl = `https://api2.moxfield.com/v2/decks/all/${moxId}/export?format=mtgo`;
  const textEndpoints = [
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(exportUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(exportUrl)}`
  ];

  for (const endpoint of textEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const rawText = await response.text();
        if (rawText && !rawText.trim().startsWith('<')) {
          const parsed = parseDecklistText(rawText);
          if (parsed && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // Ignore and fall back to clipboard paste
    }
  }

  return null;
}

async function fetchDeckCardsByUrl(url) {
  if (!url) return null;
  if (extractArchidektId(url)) {
    return fetchArchidektCardsByUrl(url);
  }
  if (extractMoxfieldId(url)) {
    return fetchMoxfieldCardsByUrl(url);
  }
  return null;
}

const VERCEL_MOXFIELD_PROXY_CODE = `export default async function handler(req, res) {
  const { id, site } = req.query;
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid deck ID' });
  }

  const headers = {
    'User-Agent': 'CommanderVaultApp/1.0 (+https://vercel.app)',
    'Accept': 'application/json'
  };

  try {
    if (site === 'archidekt') {
      const archRes = await fetch(\`https://archidekt.com/api/decks/\${id}/\`, { headers });
      if (!archRes.ok) {
        return res.status(archRes.status).json({ error: 'Archidekt fetch failed' });
      }
      const data = await archRes.json();
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json(data);
    }

    let response = await fetch(\`https://api2.moxfield.com/v3/decks/all/\${id}\`, { headers });
    if (!response.ok) {
      response = await fetch(\`https://api2.moxfield.com/v2/decks/all/\${id}\`, { headers });
    }
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Moxfield fetch failed' });
    }
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy request error' });
  }
}`;

// ============================================================================
// SCRYFALL COMMANDER SEARCH INPUT (AUTO-DETECTS COLOR IDENTITY & LEGALITY)
// ============================================================================
const ScryfallCommanderInput = ({
  label,
  placeholder,
  value,
  onChange,
  onSelectCommander,
  required = false
}) => {
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const scryfallQuery = `${q} is:commander`;
      fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          scryfallQuery
        )}&order=edhrec`
      )
        .then((res) => (res.ok ? res.json() : { data: [] }))
        .then((data) => {
          const cards = (data.data || []).slice(0, 7).map((card) => ({
            name: card.name,
            colors: card.color_identity || [],
            typeLine: card.type_line || '',
            imageUrl:
              card.image_uris?.art_crop ||
              card.card_faces?.[0]?.image_uris?.art_crop ||
              card.image_uris?.small ||
              null
          }));
          setResults(cards);
          setIsSearching(false);
        })
        .catch(() => {
          setResults([]);
          setIsSearching(false);
        });
    }, 260);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={value}
          required={required}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setResults([]);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (isSearching || results.length > 0) && (
        <div className="absolute z-40 mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {isSearching && results.length === 0 ? (
            <div className="px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Searching Scryfall commanders...</span>
            </div>
          ) : (
            results.map((card) => (
              <button
                key={card.name}
                type="button"
                onClick={() => {
                  onSelectCommander(card);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center justify-between gap-2.5 transition-colors border-b border-slate-800/60 last:border-b-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-9 h-7 rounded object-cover border border-slate-700 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-100 truncate">
                      {card.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {card.typeLine}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {card.colors.length > 0 ? (
                    card.colors.map((c) => <ManaPip key={c} color={c} size="sm" />)
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-400">
                      C
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SCRYFALL CARD PREVIEW & AUTOCOMPLETE HELPER
// ============================================================================
const ScryfallCardPreview = ({ cardName }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [cardType, setCardType] = useState('');
  const [manaCost, setManaCost] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!cardName) {
      setImageUrl(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError(false);

    const primaryName = cardName.split('//')[0].trim();
    fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(primaryName)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Card not found');
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        const img =
          data.image_uris?.normal ||
          data.card_faces?.[0]?.image_uris?.normal ||
          null;
        setImageUrl(img);
        setCardType(data.type_line || '');
        setManaCost(data.mana_cost || '');
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [cardName]);

  if (!cardName) {
    return (
      <div className="h-full min-h-[260px] rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center justify-center p-6 text-center text-slate-500">
        <Eye className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-xs font-medium">Hover or click any card in the list to preview</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 flex flex-col items-center text-center space-y-2.5">
      <div className="text-xs font-bold text-amber-300 line-clamp-1">{cardName}</div>
      {loading && (
        <div className="w-52 h-72 rounded-xl bg-slate-900 animate-pulse flex items-center justify-center text-xs text-slate-500">
          Loading Scryfall...
        </div>
      )}
      {!loading && error && (
        <div className="w-52 h-72 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-4 text-xs text-slate-400">
          <AlertCircle className="w-6 h-6 text-slate-500 mb-2" />
          Could not fetch card image for "{cardName}"
        </div>
      )}
      {!loading && !error && imageUrl && (
        <img
          src={imageUrl}
          alt={cardName}
          className="w-56 max-w-full rounded-xl shadow-2xl border border-slate-700/80"
        />
      )}
      {!loading && !error && cardType && (
        <div className="text-[11px] text-slate-400">
          {cardType} {manaCost && <span className="text-slate-300 font-semibold">• {manaCost}</span>}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CARD NOMINATION INPUT WITH DECKLIST + SCRYFALL AUTOCOMPLETE
// ============================================================================
const CardNominationInput = ({
  label,
  icon: Icon,
  iconColor,
  placeholder,
  value,
  onChange,
  deckCards = []
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    const lower = q.toLowerCase();
    const localMatches = deckCards
      .filter((c) => c.name.toLowerCase().includes(lower))
      .map((c) => ({ name: c.name, inDeck: true }))
      .slice(0, 6);

    if (localMatches.length >= 4) {
      setSuggestions(localMatches);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => {
          const remote = (data.data || [])
            .filter((name) => !localMatches.some((m) => m.name.toLowerCase() === name.toLowerCase()))
            .slice(0, 6 - localMatches.length)
            .map((name) => ({ name, inDeck: false }));
          setSuggestions([...localMatches, ...remote]);
        })
        .catch(() => {
          setSuggestions(localMatches);
        });
    }, 220);

    return () => clearTimeout(timer);
  }, [value, deckCards]);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        <span>{label}</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-30 mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
          {suggestions.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                onChange(item.name);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs hover:bg-slate-800 flex items-center justify-between gap-2 text-slate-200 transition-colors"
            >
              <span className="truncate font-medium">{item.name}</span>
              {item.inDeck && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold shrink-0">
                  In Deck
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // Authentication & Per-User Cloud Sync State
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [cloudLoading, setCloudLoading] = useState(true);
  const [decks, setDecks] = useState([]);
  const [matches, setMatches] = useState([]);

  // Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signin' | 'signup'
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'decks' | 'pod' | 'history'
  const [sortBy, setSortBy] = useState('least_played');
  const [bracketFilter, setBracketFilter] = useState('all'); // 'all' | '1' | '2' | '3' | '4' | '5'
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Modals & Drawers State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSpinModalOpen, setIsSpinModalOpen] = useState(false);
  const [isWrappedModalOpen, setIsWrappedModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Shared Playgroup / Pod Room State (Option 2)
  const [activePodId, setActivePodId] = useState('');
  const [podJoinInput, setPodJoinInput] = useState('');
  const [podNameInput, setPodNameInput] = useState('');
  const [podData, setPodData] = useState(null);
  const [podLoading, setPodLoading] = useState(false);

  // "Spin the Pod" Weighted Randomizer State
  const [spinBracketFilter, setSpinBracketFilter] = useState('all');
  const [spinExcludeToday, setSpinExcludeToday] = useState(true);
  const [spinResultDeckId, setSpinResultDeckId] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Interactive Deck Detail Drawer State
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [drawerTab, setDrawerTab] = useState('decklist'); // 'decklist' | 'awards' | 'history'
  const [isEditingList, setIsEditingList] = useState(false);
  const [decklistDraft, setDecklistDraft] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [previewCardName, setPreviewCardName] = useState('');
  const [decklistSearch, setDecklistSearch] = useState('');
  const [isSyncingMoxfield, setIsSyncingMoxfield] = useState(false);
  const [moxfieldSyncBanner, setMoxfieldSyncBanner] = useState(null);

  // Quick Post-Game Award Prompt (after tapping + Win or + Loss on a card)
  const [quickAwardMatchId, setQuickAwardMatchId] = useState(null);
  const [quickMvpCard, setQuickMvpCard] = useState('');
  const [quickFunCard, setQuickFunCard] = useState('');

  // Log Game Form State
  const [logDeckId, setLogDeckId] = useState('');
  const [logResult, setLogResult] = useState('win');
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [logPodSize, setLogPodSize] = useState(4);
  const [logMvpCard, setLogMvpCard] = useState('');
  const [logFunCard, setLogFunCard] = useState('');
  const [logNotes, setLogNotes] = useState('');

  // Add/Edit Deck Form State
  const [editingDeck, setEditingDeck] = useState(null);
  const [deckName, setDeckName] = useState('');
  const [hasPartner, setHasPartner] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [primaryColors, setPrimaryColors] = useState([]);
  const [partnerColors, setPartnerColors] = useState([]);
  const [deckColors, setDeckColors] = useState(['G']);
  const [deckBracket, setDeckBracket] = useState(3);
  const [deckArchetype, setDeckArchetype] = useState('');
  const [deckMoxfield, setDeckMoxfield] = useState('');
  const [primaryArtUrl, setPrimaryArtUrl] = useState(null);
  const [partnerArtUrl, setPartnerArtUrl] = useState(null);
  const [initialDecklistText, setInitialDecklistText] = useState('');
  const [isSavingDeck, setIsSavingDeck] = useState(false);

  const fileInputRef = useRef(null);
  const hasAutoSyncedRef = useRef(false);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3400);
  };

  // ============================================================================
  // FIREBASE AUTHENTICATION & LIVE FIRESTORE SYNC
  // ============================================================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch {
        // Fallback if anonymous auth is disabled on custom Firebase project
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (!currentUser) {
        setDecks([]);
        setMatches([]);
        setCloudLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setDecks([]);
      setMatches([]);
      setActivePodId('');
      setPodData(null);
      setCloudLoading(false);
      return;
    }

    setCloudLoading(true);
    const decksRef = collection(db, 'artifacts', appId, 'users', user.uid, 'decks');
    const matchesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'matches');
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'settings');

    const unsubProfile = onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists() && snap.data()?.activePodId) {
          setActivePodId(snap.data().activePodId);
        } else {
          setActivePodId('');
          setPodData(null);
        }
      },
      () => {}
    );

    const unsubDecks = onSnapshot(
      decksRef,
      (snapshot) => {
        const loadedDecks = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setDecks(loadedDecks);
        setCloudLoading(false);
      },
      () => {
        setCloudLoading(false);
      }
    );

    const unsubMatches = onSnapshot(
      matchesRef,
      (snapshot) => {
        const loadedMatches = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setMatches(loadedMatches);
      },
      () => {}
    );

    return () => {
      unsubProfile();
      unsubDecks();
      unsubMatches();
    };
  }, [authReady, user]);

  // Live Pod Listener (Option 2)
  useEffect(() => {
    if (!authReady || !user || !activePodId) {
      setPodData(null);
      return;
    }
    setPodLoading(true);
    const podDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'pods', activePodId);
    const unsubPod = onSnapshot(
      podDocRef,
      (snap) => {
        if (snap.exists()) {
          setPodData({ id: snap.id, ...snap.data() });
        } else {
          setPodData(null);
        }
        setPodLoading(false);
      },
      () => {
        setPodLoading(false);
      }
    );
    return () => unsubPod();
  }, [authReady, user, activePodId]);

  // Firestore Cloud Write Helpers
  const saveDeckToCloud = async (deckObj) => {
    if (!user) {
      openAccountModal('signup');
      showToast('Sign in or create an account to save decks', 'error');
      return;
    }
    await setDoc(
      doc(db, 'artifacts', appId, 'users', user.uid, 'decks', deckObj.id),
      deckObj
    );
  };

  const deleteDeckFromCloud = async (deckId, relatedMatchIds = []) => {
    if (!user) return;
    const batch = writeBatch(db);
    batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'decks', deckId));
    relatedMatchIds.forEach((mId) => {
      batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'matches', mId));
    });
    await batch.commit();
  };

  const saveMatchToCloud = async (matchObj) => {
    if (!user) {
      openAccountModal('signup');
      showToast('Sign in or create an account to log matches', 'error');
      return;
    }
    await setDoc(
      doc(db, 'artifacts', appId, 'users', user.uid, 'matches', matchObj.id),
      matchObj
    );
  };

  const deleteMatchFromCloud = async (matchId) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'matches', matchId));
  };

  // Account Modal & Auth Handlers
  const openAccountModal = (mode = 'signin') => {
    setAuthMode(mode);
    setAuthError('');
    setAuthPassword('');
    setIsAccountModalOpen(true);
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    try {
      if (authMode === 'signup') {
        const cred = await createUserWithEmailAndPassword(
          auth,
          authEmail.trim(),
          authPassword
        );
        if (authDisplayName.trim()) {
          await updateProfile(cred.user, { displayName: authDisplayName.trim() });
          setUser({ ...cred.user, displayName: authDisplayName.trim() });
        }
        hasAutoSyncedRef.current = false;
        setIsAccountModalOpen(false);
        showToast('Account created! Welcome to Commander Vault.');
      } else {
        await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        hasAutoSyncedRef.current = false;
        setIsAccountModalOpen(false);
        showToast('Signed in! Your decks are synced.');
      }
    } catch (err) {
      const code = err?.code || '';
      if (code.includes('email-already-in-use')) {
        setAuthError('An account with that email already exists. Try signing in instead.');
      } else if (
        code.includes('invalid-credential') ||
        code.includes('wrong-password') ||
        code.includes('user-not-found')
      ) {
        setAuthError('Incorrect email or password. Please try again.');
      } else if (code.includes('weak-password')) {
        setAuthError('Password must be at least 6 characters.');
      } else {
        setAuthError(err?.message || 'Authentication failed. Check your Firebase config.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOutAndGuest = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth);
      hasAutoSyncedRef.current = false;
      setSelectedDeckId(null);
      setIsAccountModalOpen(false);
      showToast('Signed out');
    } catch {
      setIsAccountModalOpen(false);
    }
  };

  // ============================================================================
  // DECKLIST SYNC & AUTO-CHECK ENGINE (MOXFIELD & ARCHIDEKT)
  // ============================================================================
  const syncDeckFromUrl = async (deck, silent = false) => {
    const siteName = getDeckSiteName(deck?.moxfieldUrl);
    if (!deck?.moxfieldUrl) {
      if (!silent) {
        setMoxfieldSyncBanner({
          type: 'warning',
          message: 'Add a Moxfield or Archidekt deck URL first using the Edit button.'
        });
      }
      return;
    }

    const moxId = extractMoxfieldId(deck.moxfieldUrl);
    const archId = extractArchidektId(deck.moxfieldUrl);
    if (!moxId && !archId) {
      if (!silent) {
        setMoxfieldSyncBanner({
          type: 'warning',
          message:
            'Could not find a valid Moxfield or Archidekt deck ID in that URL (expected moxfield.com/decks/... or archidekt.com/decks/...).'
        });
      }
      return;
    }

    if (!silent) {
      setIsSyncingMoxfield(true);
      setMoxfieldSyncBanner(null);
    }

    try {
      const parsedCards = await fetchDeckCardsByUrl(deck.moxfieldUrl);
      if (!parsedCards || parsedCards.length === 0) {
        throw new Error('Blocked or empty response');
      }

      const existingCards = deck.decklist || [];
      const { added, removed } = diffDecklists(existingCards, parsedCards);
      const nowIso = new Date().toISOString();

      let nextRevisions = deck.revisions || [];
      if (added.length > 0 || removed.length > 0 || existingCards.length === 0) {
        nextRevisions = [
          {
            id: `rev-${Date.now()}`,
            date: nowIso.split('T')[0],
            timestamp: Date.now(),
            note:
              existingCards.length === 0
                ? `Initial import from ${siteName}`
                : `${siteName} sync (+${added.length} / -${removed.length})`,
            added,
            removed,
            totalCards: parsedCards.reduce((sum, c) => sum + c.qty, 0)
          },
          ...nextRevisions
        ];
      }

      await saveDeckToCloud({
        ...deck,
        decklist: parsedCards,
        revisions: nextRevisions,
        lastMoxfieldCheck: nowIso
      });

      if (!silent) {
        if (added.length === 0 && removed.length === 0 && existingCards.length > 0) {
          showToast(`${deck.name} is already up to date with ${siteName}!`);
        } else {
          showToast(
            `Synced ${deck.name} from ${siteName} (+${added.length} added, -${removed.length} removed)`
          );
        }
      }
    } catch {
      if (!silent) {
        setMoxfieldSyncBanner({
          type: 'warning',
          message:
            siteName === 'Archidekt'
              ? 'Could not fetch this Archidekt deck (make sure the deck is set to Public), or click "Paste from Clipboard" below to import your text export!'
              : 'Moxfield’s Cloudflare protection blocked automatic browser fetch. Open your Moxfield deck → Export → Copy for MTGO, then click "Paste from Clipboard" below to import & diff all 100 cards in 1 tap!'
        });
      }
    } finally {
      if (!silent) setIsSyncingMoxfield(false);
    }
  };

  useEffect(() => {
    if (cloudLoading || hasAutoSyncedRef.current) return;
    const autoSyncDecks = decks.filter((d) => d.autoSync && d.moxfieldUrl);
    if (autoSyncDecks.length === 0) return;
    hasAutoSyncedRef.current = true;
    autoSyncDecks.forEach((d) => {
      syncDeckFromUrl(d, true);
    });
  }, [cloudLoading, decks]);

  // ============================================================================
  // COMPUTED ANALYTICS & DECK STATISTICS
  // ============================================================================
  const analytics = useMemo(() => {
    const totalGames = matches.length;
    const totalWins = matches.filter((m) => m.result === 'win').length;
    const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
    const idealPlayShare = decks.length > 0 ? Math.round((100 / decks.length) * 10) / 10 : 0;

    // Global MVP & Fun card counts
    const globalMvpMap = new Map();
    const globalFunMap = new Map();

    matches.forEach((m) => {
      if (m.mvpCard && m.mvpCard.trim()) {
        const key = m.mvpCard.trim();
        const curr = globalMvpMap.get(key) || { name: key, count: 0, wins: 0 };
        curr.count += 1;
        if (m.result === 'win') curr.wins += 1;
        globalMvpMap.set(key, curr);
      }
      if (m.funCard && m.funCard.trim()) {
        const key = m.funCard.trim();
        const curr = globalFunMap.get(key) || { name: key, count: 0 };
        curr.count += 1;
        globalFunMap.set(key, curr);
      }
    });

    const topGlobalMvp = Array.from(globalMvpMap.values())
      .sort((a, b) => b.count - a.count || b.wins - a.wins)
      .slice(0, 5);
    const topGlobalFun = Array.from(globalFunMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const basicLands = new Set([
      'plains',
      'island',
      'swamp',
      'mountain',
      'forest',
      'wastes',
      'snow-covered plains',
      'snow-covered island',
      'snow-covered swamp',
      'snow-covered mountain',
      'snow-covered forest'
    ]);

    const deckStats = decks.map((deck) => {
      const deckMatches = matches.filter((m) => m.deckId === deck.id);
      const games = deckMatches.length;
      const wins = deckMatches.filter((m) => m.result === 'win').length;
      const losses = games - wins;
      const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;
      const playShare = totalGames > 0 ? Math.round((games / totalGames) * 1000) / 10 : 0;

      // Sort deck matches newest-first for lastPlayed & streak
      const sortedMatches = [...deckMatches].sort(
        (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
      );
      const lastPlayed = sortedMatches[0]?.date || null;

      let streak = 0;
      let streakType = null;
      if (sortedMatches.length > 0) {
        streakType = sortedMatches[0].result;
        for (const m of sortedMatches) {
          if (m.result === streakType) streak += 1;
          else break;
        }
      }

      // Per-deck MVP & Fun Card tallies
      const mvpMap = new Map();
      const funMap = new Map();
      deckMatches.forEach((m) => {
        if (m.mvpCard && m.mvpCard.trim()) {
          const k = m.mvpCard.trim();
          const entry = mvpMap.get(k) || { name: k, count: 0, wins: 0 };
          entry.count += 1;
          if (m.result === 'win') entry.wins += 1;
          mvpMap.set(k, entry);
        }
        if (m.funCard && m.funCard.trim()) {
          const k = m.funCard.trim();
          const entry = funMap.get(k) || { name: k, count: 0 };
          entry.count += 1;
          funMap.set(k, entry);
        }
      });

      const topMvpCards = Array.from(mvpMap.values()).sort(
        (a, b) => b.count - a.count || b.wins - a.wins
      );
      const topFunCards = Array.from(funMap.values()).sort((a, b) => b.count - a.count);

      // All-stars vs Cut Candidates
      const nominatedLower = new Set([
        ...Array.from(mvpMap.keys()).map((n) => n.toLowerCase()),
        ...Array.from(funMap.keys()).map((n) => n.toLowerCase())
      ]);
      const allStarCards = Array.from(
        new Set([...topMvpCards.map((c) => c.name), ...topFunCards.map((c) => c.name)])
      );
      const cutCandidates = (deck.decklist || [])
        .map((c) => c.name)
        .filter(
          (name) =>
            !basicLands.has(name.toLowerCase()) && !nominatedLower.has(name.toLowerCase())
        );

      // Patch / Revision Win-Rate Impact
      let patchImpact = null;
      const latestRev = (deck.revisions || [])[0];
      if (latestRev && latestRev.timestamp) {
        const preMatches = deckMatches.filter((m) => (m.timestamp || 0) < latestRev.timestamp);
        const postMatches = deckMatches.filter((m) => (m.timestamp || 0) >= latestRev.timestamp);
        const preWins = preMatches.filter((m) => m.result === 'win').length;
        const postWins = postMatches.filter((m) => m.result === 'win').length;
        const preWinRate =
          preMatches.length > 0 ? Math.round((preWins / preMatches.length) * 100) : null;
        const postWinRate =
          postMatches.length > 0 ? Math.round((postWins / postMatches.length) * 100) : null;
        const delta =
          preWinRate !== null && postWinRate !== null ? postWinRate - preWinRate : null;

        patchImpact = {
          revision: latestRev,
          preGames: preMatches.length,
          preWins,
          preLosses: preMatches.length - preWins,
          preWinRate,
          postGames: postMatches.length,
          postWins,
          postLosses: postMatches.length - postWins,
          postWinRate,
          delta
        };
      }

      const totalCardCount = (deck.decklist || []).reduce((sum, c) => sum + c.qty, 0);

      return {
        ...deck,
        games,
        wins,
        losses,
        winRate,
        playShare,
        lastPlayed,
        streak,
        streakType,
        topMvpCards,
        topFunCards,
        allStarCards,
        cutCandidates,
        patchImpact,
        totalCardCount
      };
    });

    // KPI Highlights
    const leastPlayed =
      deckStats.length > 0
        ? [...deckStats].sort((a, b) => a.games - b.games || a.name.localeCompare(b.name))[0]
        : null;

    const playedDecks = deckStats.filter((d) => d.games > 0);
    const mostPlayed =
      playedDecks.length > 0
        ? [...playedDecks].sort((a, b) => b.games - a.games || b.winRate - a.winRate)[0]
        : null;

    const highestWinRate =
      playedDecks.length > 0
        ? [...playedDecks].sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)[0]
        : null;

    const topSignatureCommander =
      playedDecks.length > 0
        ? [...playedDecks].sort(
            (a, b) => b.wins - a.wins || b.winRate - a.winRate || b.games - a.games
          )[0]
        : null;

    // Bracket Breakdown (1-5)
    const bracketStats = [1, 2, 3, 4, 5].map((b) => {
      const bDecks = deckStats.filter((d) => (d.bracket || 3) === b);
      const games = bDecks.reduce((s, d) => s + d.games, 0);
      const wins = bDecks.reduce((s, d) => s + d.wins, 0);
      const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;
      return {
        bracket: b,
        deckCount: bDecks.length,
        games,
        wins,
        winRate
      };
    });

    return {
      totalGames,
      totalWins,
      overallWinRate,
      idealPlayShare,
      deckStats,
      leastPlayed,
      mostPlayed,
      highestWinRate,
      topSignatureCommander,
      topGlobalMvp,
      topGlobalFun,
      bracketStats
    };
  }, [decks, matches]);

  // Sync current player's stats into active Pod Room whenever stats change
  useEffect(() => {
    if (!user || user.isAnonymous || !activePodId || !podData || cloudLoading) return;
    const displayName = user.displayName || user.email?.split('@')[0] || 'Player';
    const currentStats = {
      uid: user.uid,
      name: displayName,
      totalDecks: decks.length,
      totalGames: analytics.totalGames,
      totalWins: analytics.totalWins,
      winRate: analytics.overallWinRate,
      signatureCommander: analytics.topSignatureCommander?.name || decks[0]?.name || '—',
      updatedAt: Date.now()
    };

    const existing = podData.members?.[user.uid];
    if (
      !existing ||
      existing.name !== currentStats.name ||
      existing.totalDecks !== currentStats.totalDecks ||
      existing.totalGames !== currentStats.totalGames ||
      existing.totalWins !== currentStats.totalWins ||
      existing.signatureCommander !== currentStats.signatureCommander
    ) {
      setDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'pods', activePodId),
        {
          members: {
            ...(podData.members || {}),
            [user.uid]: currentStats
          }
        },
        { merge: true }
      ).catch(() => {});
    }
  }, [user, activePodId, podData, cloudLoading, decks, analytics]);

  const handleCreatePod = async (e) => {
    e.preventDefault();
    if (!user || user.isAnonymous) {
      openAccountModal('signup');
      showToast('Create a free account first to host or join a Pod!', 'error');
      return;
    }
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    const podTitle = podNameInput.trim() || `${accountLabel}'s Playgroup`;
    const memberSnapshot = {
      uid: user.uid,
      name: accountLabel,
      totalDecks: decks.length,
      totalGames: analytics.totalGames,
      totalWins: analytics.totalWins,
      winRate: analytics.overallWinRate,
      signatureCommander: analytics.topSignatureCommander?.name || decks[0]?.name || '—',
      updatedAt: Date.now()
    };

    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pods', code), {
      name: podTitle,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      members: {
        [user.uid]: memberSnapshot
      }
    });
    await setDoc(
      doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'settings'),
      { activePodId: code },
      { merge: true }
    );
    setActivePodId(code);
    setPodNameInput('');
    showToast(`Created Pod ${code}! Share the code with your playgroup.`);
  };

  const handleJoinPod = async (e) => {
    e.preventDefault();
    if (!user || user.isAnonymous) {
      openAccountModal('signup');
      showToast('Create a free account first to join a Pod!', 'error');
      return;
    }
    const cleanCode = podJoinInput.trim().toUpperCase().replace(/^POD-/, '');
    if (cleanCode.length < 4) {
      showToast('Enter a valid 6-character Pod invite code', 'error');
      return;
    }
    const podSnap = await getDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'pods', cleanCode)
    );
    if (!podSnap.exists()) {
      showToast(`No Pod found with code "${cleanCode}"`, 'error');
      return;
    }
    const memberSnapshot = {
      uid: user.uid,
      name: accountLabel,
      totalDecks: decks.length,
      totalGames: analytics.totalGames,
      totalWins: analytics.totalWins,
      winRate: analytics.overallWinRate,
      signatureCommander: analytics.topSignatureCommander?.name || decks[0]?.name || '—',
      updatedAt: Date.now()
    };
    await setDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'pods', cleanCode),
      {
        members: {
          ...(podSnap.data()?.members || {}),
          [user.uid]: memberSnapshot
        }
      },
      { merge: true }
    );
    await setDoc(
      doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'settings'),
      { activePodId: cleanCode },
      { merge: true }
    );
    setActivePodId(cleanCode);
    setPodJoinInput('');
    showToast(`Joined Pod ${cleanCode}!`);
  };

  const handleLeavePod = async () => {
    if (!user) return;
    await setDoc(
      doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'settings'),
      { activePodId: '' },
      { merge: true }
    );
    setActivePodId('');
    setPodData(null);
    showToast('Left Pod room');
  };

  // Filtered & Sorted Roster
  const displayedDecks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = analytics.deckStats.filter((d) => {
      if (bracketFilter !== 'all' && String(d.bracket || 3) !== bracketFilter) {
        return false;
      }
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        (d.archetype || '').toLowerCase().includes(q) ||
        getGuildOrShardName(d.colors || []).toLowerCase().includes(q)
      );
    });

    switch (sortBy) {
      case 'least_played':
        return [...filtered].sort((a, b) => a.games - b.games || a.name.localeCompare(b.name));
      case 'most_played':
        return [...filtered].sort((a, b) => b.games - a.games || b.winRate - a.winRate);
      case 'win_rate':
        return [...filtered].sort((a, b) => b.winRate - a.winRate || b.games - a.games);
      case 'last_played':
        return [...filtered].sort((a, b) =>
          (b.lastPlayed || '').localeCompare(a.lastPlayed || '')
        );
      case 'alpha':
      default:
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [analytics.deckStats, bracketFilter, searchQuery, sortBy]);

  // ============================================================================
  // SPIN THE POD (WEIGHTED DECK PICKER) COMPUTATION & HANDLER
  // ============================================================================
  const spinCandidateDecks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const pool = analytics.deckStats.filter((d) => {
      if (spinBracketFilter !== 'all' && String(d.bracket || 3) !== spinBracketFilter) {
        return false;
      }
      if (spinExcludeToday && d.lastPlayed === todayStr) {
        return false;
      }
      return true;
    });

    if (pool.length === 0) return [];
    const maxGames = Math.max(...pool.map((d) => d.games), 0);
    const weighted = pool.map((d) => ({
      ...d,
      weight: Math.pow(maxGames - d.games + 1, 1.5)
    }));
    const totalWeight = weighted.reduce((s, d) => s + d.weight, 0);

    return weighted.map((d) => ({
      ...d,
      oddsPercent: Math.round((d.weight / totalWeight) * 1000) / 10
    }));
  }, [analytics.deckStats, spinBracketFilter, spinExcludeToday]);

  const spinSelectedDeck = useMemo(() => {
    if (!spinResultDeckId) return null;
    return spinCandidateDecks.find((d) => d.id === spinResultDeckId) || null;
  }, [spinCandidateDecks, spinResultDeckId]);

  const openSpinModal = () => {
    setSpinResultDeckId(null);
    setIsSpinning(false);
    setIsSpinModalOpen(true);
  };

  const handleSpinDeck = () => {
    if (spinCandidateDecks.length === 0 || isSpinning) return;
    setIsSpinning(true);

    const totalWeight = spinCandidateDecks.reduce((s, d) => s + d.weight, 0);
    let r = Math.random() * totalWeight;
    let chosen = spinCandidateDecks[0];
    for (const d of spinCandidateDecks) {
      r -= d.weight;
      if (r <= 0) {
        chosen = d;
        break;
      }
    }

    let ticks = 0;
    const interval = setInterval(() => {
      ticks += 1;
      const randomPreview =
        spinCandidateDecks[Math.floor(Math.random() * spinCandidateDecks.length)];
      setSpinResultDeckId(randomPreview.id);
      if (ticks >= 12) {
        clearInterval(interval);
        setSpinResultDeckId(chosen.id);
        setIsSpinning(false);
      }
    }, 75);
  };

  // ============================================================================
  // MATCH LOGGING & DRAWER INTERACTION HANDLERS
  // ============================================================================
  const openLogModal = (preselectedDeckId = '', preselectedResult = 'win') => {
    setLogDeckId(preselectedDeckId || decks[0]?.id || '');
    setLogResult(preselectedResult);
    setLogDate(new Date().toISOString().split('T')[0]);
    setLogPodSize(4);
    setLogMvpCard('');
    setLogFunCard('');
    setLogNotes('');
    setIsLogModalOpen(true);
  };

  const handleQuickLog = async (deckId, result, e) => {
    if (e) e.stopPropagation();
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;

    const newMatch = {
      id: `match-${Date.now()}`,
      deckId,
      result,
      date: new Date().toISOString().split('T')[0],
      podSize: 4,
      mvpCard: '',
      funCard: '',
      notes: '',
      timestamp: Date.now()
    };

    await saveMatchToCloud(newMatch);
    setQuickAwardMatchId(newMatch.id);
    setQuickMvpCard('');
    setQuickFunCard('');
    showToast(
      `Logged ${result === 'win' ? 'Victory' : 'Loss'} for ${deck.name}!`,
      result === 'win' ? 'win' : 'success'
    );
  };

  const handleSaveQuickAwards = async (e) => {
    e.preventDefault();
    const existing = matches.find((m) => m.id === quickAwardMatchId);
    if (existing) {
      await saveMatchToCloud({
        ...existing,
        mvpCard: quickMvpCard.trim(),
        funCard: quickFunCard.trim()
      });
      showToast('Match standout cards saved!');
    }
    setQuickAwardMatchId(null);
  };

  const handleDetailedLogSubmit = async (e) => {
    e.preventDefault();
    if (!logDeckId) return;
    const deck = decks.find((d) => d.id === logDeckId);

    const newMatch = {
      id: `match-${Date.now()}`,
      deckId: logDeckId,
      result: logResult,
      date: logDate,
      podSize: Number(logPodSize) || 4,
      mvpCard: logMvpCard.trim(),
      funCard: logFunCard.trim(),
      notes: logNotes.trim(),
      timestamp: Date.now()
    };

    await saveMatchToCloud(newMatch);
    setIsLogModalOpen(false);
    showToast(
      `Logged ${logResult === 'win' ? 'Victory' : 'Loss'} for ${deck?.name || 'Deck'}!`,
      logResult === 'win' ? 'win' : 'success'
    );
  };

  const handleDeleteMatch = async (matchId) => {
    await deleteMatchFromCloud(matchId);
    showToast('Match entry removed');
  };

  const openDeckDrawer = (deck) => {
    setSelectedDeckId(deck.id);
    setDrawerTab('decklist');
    setIsEditingList(false);
    setDecklistSearch('');
    setMoxfieldSyncBanner(null);
    setPreviewCardName(deck.primaryCommander || deck.name.split(' & ')[0] || '');
  };

  const toggleDeckAutoSync = async (deckId) => {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;
    const nextAuto = !deck.autoSync;
    await saveDeckToCloud({ ...deck, autoSync: nextAuto });
    showToast(
      nextAuto
        ? 'Auto-check deck URL enabled on app load'
        : 'Auto-check deck URL disabled'
    );
  };

  const handleSaveDecklist = async () => {
    const deck = decks.find((d) => d.id === selectedDeckId);
    if (!deck) return;

    const parsedCards = parseDecklistText(decklistDraft);
    const { added, removed } = diffDecklists(deck.decklist || [], parsedCards);
    const nowIso = new Date().toISOString();

    const newRevision = {
      id: `rev-${Date.now()}`,
      date: nowIso.split('T')[0],
      timestamp: Date.now(),
      note:
        revisionNote.trim() ||
        ((deck.decklist || []).length === 0
          ? 'Initial decklist saved'
          : `Decklist update (+${added.length} / -${removed.length})`),
      added,
      removed,
      totalCards: parsedCards.reduce((s, c) => s + c.qty, 0)
    };

    await saveDeckToCloud({
      ...deck,
      decklist: parsedCards,
      revisions: [newRevision, ...(deck.revisions || [])]
    });

    setIsEditingList(false);
    setMoxfieldSyncBanner(null);
    showToast(
      `Saved ${parsedCards.reduce((s, c) => s + c.qty, 0)} cards (+${added.length} / -${removed.length})`
    );
  };

  const handlePasteClipboardToDrawer = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      const parsed = parseDecklistText(clipText);
      if (!parsed || parsed.length === 0) {
        showToast('No valid MTG card list found in clipboard. Copy from Moxfield/Archidekt first!', 'error');
        return;
      }
      setDecklistDraft(clipText);
      setRevisionNote('Imported from clipboard');
      setIsEditingList(true);
      setMoxfieldSyncBanner(null);
      showToast(
        `Loaded ${parsed.reduce((s, c) => s + c.qty, 0)} cards from clipboard — review & click Save!`
      );
    } catch {
      setDecklistDraft(serializeDecklist(selectedDeck?.decklist || []));
      setIsEditingList(true);
      showToast('Paste your decklist into the box below', 'success');
    }
  };

  // ============================================================================
  // HANDLERS: DECK MANAGEMENT (WITH SCRYFALL COMMANDER SEARCH, PARTNERS & AUTO-IMPORT)
  // ============================================================================
  const openAddDeckModal = () => {
    setEditingDeck(null);
    setDeckName('');
    setHasPartner(false);
    setPartnerName('');
    setPrimaryColors(['G']);
    setPartnerColors([]);
    setDeckColors(['G']);
    setDeckBracket(3);
    setDeckArchetype('');
    setDeckMoxfield('');
    setPrimaryArtUrl(null);
    setPartnerArtUrl(null);
    setInitialDecklistText('');
    setIsDeckModalOpen(true);
  };

  const openEditDeckModal = (deck, e = null) => {
    if (e) e.stopPropagation();
    setEditingDeck(deck);

    if (deck.partnerCommander) {
      setDeckName(deck.primaryCommander || deck.name.split(' & ')[0] || deck.name);
      setHasPartner(true);
      setPartnerName(deck.partnerCommander);
    } else if (deck.name.includes(' & ')) {
      const [first, ...rest] = deck.name.split(' & ');
      setDeckName(first.trim());
      setHasPartner(true);
      setPartnerName(rest.join(' & ').trim());
    } else {
      setDeckName(deck.name);
      setHasPartner(false);
      setPartnerName('');
    }

    setPrimaryColors(deck.colors || []);
    setPartnerColors([]);
    setDeckColors(deck.colors || []);
    setDeckBracket(deck.bracket || 3);
    setDeckArchetype(deck.archetype || '');
    setDeckMoxfield(deck.moxfieldUrl || '');
    setPrimaryArtUrl(deck.primaryArtUrl || null);
    setPartnerArtUrl(deck.partnerArtUrl || null);
    setInitialDecklistText('');
    setIsDeckModalOpen(true);
  };

  const handleSelectPrimaryCommander = (card) => {
    setDeckName(card.name);
    setPrimaryArtUrl(card.imageUrl || null);
    const nextPrimary = card.colors || [];
    setPrimaryColors(nextPrimary);
    const combined = Array.from(
      new Set([...nextPrimary, ...(hasPartner ? partnerColors : [])])
    ).sort((a, b) => COLOR_ORDER.indexOf(a) - COLOR_ORDER.indexOf(b));
    setDeckColors(combined);
  };

  const handleSelectPartnerCommander = (card) => {
    setPartnerName(card.name);
    setPartnerArtUrl(card.imageUrl || null);
    const nextPartner = card.colors || [];
    setPartnerColors(nextPartner);
    const combined = Array.from(new Set([...primaryColors, ...nextPartner])).sort(
      (a, b) => COLOR_ORDER.indexOf(a) - COLOR_ORDER.indexOf(b)
    );
    setDeckColors(combined);
  };

  const handleTogglePartnerMode = (checked) => {
    setHasPartner(checked);
    if (!checked) {
      setPartnerName('');
      setPartnerColors([]);
      setPartnerArtUrl(null);
    }
  };

  const toggleDeckColor = (c) => {
    setDeckColors((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const handleDeckSave = async (e) => {
    e.preventDefault();
    if (!deckName.trim()) return;

    setIsSavingDeck(true);
    try {
      const primaryTrimmed = deckName.trim();
      const partnerTrimmed = hasPartner ? partnerName.trim() : '';
      const combinedName = partnerTrimmed
        ? `${primaryTrimmed} & ${partnerTrimmed}`
        : primaryTrimmed;

      const cleanUrl = deckMoxfield.trim();
      const formattedUrl =
        cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')
          ? `https://${cleanUrl}`
          : cleanUrl;

      const manualParsedCards = parseDecklistText(initialDecklistText);

      if (editingDeck) {
        let nextDecklist = editingDeck.decklist || [];
        let nextRevisions = editingDeck.revisions || [];
        let lastMoxfieldCheck = editingDeck.lastMoxfieldCheck || null;
        let autoSync = editingDeck.autoSync || false;
        let fetchedFromSite = false;

        const urlChanged = formattedUrl && formattedUrl !== (editingDeck.moxfieldUrl || '');
        const siteLabel = getDeckSiteName(formattedUrl);
        if (formattedUrl && (urlChanged || nextDecklist.length === 0)) {
          const imported = await fetchDeckCardsByUrl(formattedUrl);
          if (imported && imported.length > 0) {
            const { added, removed } = diffDecklists(nextDecklist, imported);
            if (added.length > 0 || removed.length > 0 || nextDecklist.length === 0) {
              nextRevisions = [
                {
                  id: `rev-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  timestamp: Date.now(),
                  note: `Imported from ${siteLabel} URL`,
                  added,
                  removed,
                  totalCards: imported.reduce((s, c) => s + c.qty, 0)
                },
                ...nextRevisions
              ];
            }
            nextDecklist = imported;
            lastMoxfieldCheck = new Date().toISOString();
            autoSync = true;
            fetchedFromSite = true;
          }
        }

        const updatedDeck = {
          ...editingDeck,
          name: combinedName,
          primaryCommander: primaryTrimmed,
          partnerCommander: partnerTrimmed,
          primaryArtUrl: primaryArtUrl || editingDeck.primaryArtUrl || null,
          partnerArtUrl: partnerTrimmed
            ? partnerArtUrl || editingDeck.partnerArtUrl || null
            : null,
          colors: deckColors,
          bracket: Number(deckBracket) || 3,
          archetype: deckArchetype.trim(),
          moxfieldUrl: formattedUrl,
          decklist: nextDecklist,
          revisions: nextRevisions,
          lastMoxfieldCheck,
          autoSync
        };
        await saveDeckToCloud(updatedDeck);

        if (fetchedFromSite) {
          showToast(
            `Updated ${combinedName} & synced ${nextDecklist.reduce(
              (s, c) => s + c.qty,
              0
            )} cards from ${siteLabel}!`
          );
        } else if (formattedUrl && urlChanged) {
          showToast(
            `Saved ${combinedName}. Open deck & click "Paste from Clipboard" if ${siteLabel} blocks auto-fetch.`
          );
        } else {
          showToast(`Updated ${combinedName}`);
        }
      } else {
        let finalCards = manualParsedCards;
        const siteLabel = getDeckSiteName(formattedUrl);
        let revisionNoteText = 'Initial decklist imported';
        let fetchedFromSite = false;

        if (finalCards.length === 0 && formattedUrl) {
          const imported = await fetchDeckCardsByUrl(formattedUrl);
          if (imported && imported.length > 0) {
            finalCards = imported;
            revisionNoteText = `Imported from ${siteLabel} URL`;
            fetchedFromSite = true;
          }
        }

        const initialRevisions =
          finalCards.length > 0
            ? [
                {
                  id: `rev-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  timestamp: Date.now(),
                  note: revisionNoteText,
                  added: finalCards,
                  removed: [],
                  totalCards: finalCards.reduce((s, c) => s + c.qty, 0)
                }
              ]
            : [];

        const newDeck = {
          id: `deck-${Date.now()}`,
          name: combinedName,
          primaryCommander: primaryTrimmed,
          partnerCommander: partnerTrimmed,
          primaryArtUrl: primaryArtUrl || null,
          partnerArtUrl: partnerTrimmed ? partnerArtUrl || null : null,
          colors: deckColors,
          bracket: Number(deckBracket) || 3,
          archetype: deckArchetype.trim(),
          moxfieldUrl: formattedUrl,
          decklist: finalCards,
          revisions: initialRevisions,
          autoSync: Boolean(formattedUrl),
          lastMoxfieldCheck: fetchedFromSite ? new Date().toISOString() : null,
          createdAt: new Date().toISOString()
        };
        await saveDeckToCloud(newDeck);

        if (fetchedFromSite) {
          showToast(
            `Added ${newDeck.name} with ${finalCards.reduce(
              (s, c) => s + c.qty,
              0
            )} cards from ${siteLabel}!`
          );
        } else if (formattedUrl && finalCards.length === 0) {
          showToast(
            `Added ${newDeck.name}! Open the deck to paste your list if ${siteLabel} blocks browser sync.`
          );
        } else {
          showToast(`Added ${newDeck.name} to your roster!`);
        }
      }
      setIsDeckModalOpen(false);
    } finally {
      setIsSavingDeck(false);
    }
  };

  const requestDeleteDeck = (deck, e = null) => {
    if (e) e.stopPropagation();
    setConfirmAction({
      title: `Remove ${deck.name}?`,
      message: `This will remove ${deck.name} from your deck roster and delete its logged match history. You can export a backup first if needed.`,
      confirmText: 'Delete Deck',
      onConfirm: async () => {
        const relatedMatchIds = matches
          .filter((m) => m.deckId === deck.id)
          .map((m) => m.id);
        await deleteDeckFromCloud(deck.id, relatedMatchIds);
        if (selectedDeckId === deck.id) setSelectedDeckId(null);
        setConfirmAction(null);
        showToast(`Removed ${deck.name}`);
      }
    });
  };

  // ============================================================================
  // HANDLERS: EXPORT / IMPORT
  // ============================================================================
  const handleExportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 3,
      decks,
      matches
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commander-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded!');
  };

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Commander',
      'Bracket',
      'Colors',
      'Result',
      'Pod Size',
      'Card of the Match (MVP)',
      'Most Fun Card',
      'Notes'
    ];
    const rows = matches.map((m) => {
      const deck = decks.find((d) => d.id === m.deckId);
      return [
        m.date,
        `"${(deck?.name || 'Unknown').replace(/"/g, '""')}"`,
        `B${deck?.bracket || 3}`,
        `"${(deck?.colors || []).join('')}"`,
        m.result.toUpperCase(),
        m.podSize || 4,
        `"${(m.mvpCard || '').replace(/"/g, '""')}"`,
        `"${(m.funCard || '').replace(/"/g, '""')}"`,
        `"${(m.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commander-match-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Match log CSV downloaded!');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed.decks) && Array.isArray(parsed.matches) && user) {
          const batch = writeBatch(db);
          parsed.decks.forEach((d) => {
            const cleanDeck = {
              bracket: 3,
              archetype: '',
              decklist: [],
              revisions: [],
              autoSync: false,
              ...d
            };
            batch.set(
              doc(db, 'artifacts', appId, 'users', user.uid, 'decks', cleanDeck.id),
              cleanDeck
            );
          });
          parsed.matches.forEach((m) => {
            batch.set(
              doc(db, 'artifacts', appId, 'users', user.uid, 'matches', m.id),
              m
            );
          });
          await batch.commit();
          setIsBackupModalOpen(false);
          showToast(
            `Imported ${parsed.decks.length} decks & ${parsed.matches.length} games to your account!`
          );
        } else {
          showToast('Invalid backup file format', 'error');
        }
      } catch {
        showToast('Could not read JSON file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedDeckStats = useMemo(() => {
    if (!selectedDeckId) return null;
    return analytics.deckStats.find((d) => d.id === selectedDeckId) || null;
  }, [analytics.deckStats, selectedDeckId]);

  const selectedDeck = selectedDeckStats;
  const isGuestAccount = !user || user.isAnonymous;
  const accountLabel = isGuestAccount
    ? 'Guest Session'
    : user.displayName || user.email?.split('@')[0] || 'My Account';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-20">
      {/* ==================================================================== */}
      {/* TOP NAVIGATION HEADER                                                */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white truncate">
                  Commander Vault
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {decks.length} {decks.length === 1 ? 'Deck' : 'Decks'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                Personal EDH Roster, Brackets, Decklists & Match Analytics
              </p>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Account Profile / Sign-In Pill */}
            <button
              onClick={() => openAccountModal(isGuestAccount ? 'signup' : 'signin')}
              title={
                isGuestAccount
                  ? 'Create an account or sign in to save your decks across devices'
                  : `Signed in as ${user?.email || accountLabel}`
              }
              className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                isGuestAccount
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-amber-500/40'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border-emerald-500/40'
              }`}
            >
              {isGuestAccount ? (
                <User className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="max-w-[110px] truncate">{accountLabel}</span>
            </button>

            <button
              onClick={openSpinModal}
              disabled={decks.length === 0}
              title="Weighted Deck Picker — Let fate pick an underplayed deck!"
              className="px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 disabled:opacity-40 text-indigo-200 border border-indigo-500/40 transition-all flex items-center gap-1.5 text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/10 active:scale-[0.98]"
            >
              <Dices className="w-4 h-4 text-indigo-300" />
              <span className="hidden md:inline">Spin the Pod</span>
            </button>

            <button
              onClick={() => setIsWrappedModalOpen(true)}
              disabled={decks.length === 0}
              title="Commander Wrapped — Shareable Season Recap"
              className="px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 disabled:opacity-40 text-amber-200 border border-amber-500/40 transition-all flex items-center gap-1.5 text-xs sm:text-sm font-bold"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="hidden lg:inline">Wrapped</span>
            </button>

            <button
              onClick={() => setIsBackupModalOpen(true)}
              title="Backup, Export & Data Settings"
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">Backup</span>
            </button>

            <button
              onClick={openAddDeckModal}
              className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-medium"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Add Deck</span>
            </button>

            <button
              onClick={() => openLogModal()}
              disabled={decks.length === 0}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Trophy className="w-4 h-4" />
              <span>Log Game</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Overview & Analytics', icon: BarChart3 },
            { id: 'decks', label: `My Decks (${decks.length})`, icon: Layers },
            { id: 'pod', label: activePodId ? `Pod Room (${activePodId})` : 'Playgroup Pod', icon: Users },
            { id: 'history', label: `Match History (${matches.length})`, icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN CONTENT AREA                                                    */}
      {/* ==================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Guest Account Sync Banner */}
        {authReady && !cloudLoading && isGuestAccount && (
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/35 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white">
                  Sign in or create an account to save & sync your personal decks
                </h2>
                <p className="text-xs text-slate-400">
                  Every player gets their own private Commander roster, decklists, and match history across phone & desktop.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openAccountModal('signin')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openAccountModal('signup')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/15"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* Clean-Slate Empty Roster Onboarding Card */}
        {authReady && !cloudLoading && decks.length === 0 && (
          <section className="rounded-2xl bg-slate-900/95 border border-slate-800 p-8 sm:p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div className="max-w-lg mx-auto space-y-1.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                {isGuestAccount
                  ? 'Start Building Your Commander Roster'
                  : `Welcome, ${accountLabel}! Your Vault is Ready`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Add your personal commanders (including Partners & Backgrounds), link or paste your Moxfield decklists, and start tracking match win rates, rotation share, and standout cards.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={openAddDeckModal}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Deck</span>
              </button>
              {isGuestAccount && (
                <button
                  type="button"
                  onClick={() => openAccountModal('signup')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>Create Free Account</span>
                </button>
              )}
            </div>
          </section>
        )}

        {/* ================================================================== */}
        {/* OVERVIEW & ANALYTICS TAB (SHOWN WHEN USER HAS DECKS)               */}
        {/* ================================================================== */}
        {activeTab === 'dashboard' && decks.length > 0 && (
          <>
            {/* Top 4 KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* KPI 1: Total Games & Win Rate */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Overall Record
                  </span>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-white">
                    {analytics.totalWins}W – {analytics.totalGames - analytics.totalWins}L
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-xs text-slate-400">
                    <span>
                      Win Rate: <strong className="text-amber-300">{analytics.overallWinRate}%</strong>
                    </span>
                    <span>{analytics.totalGames} Total Games</span>
                  </div>
                </div>
              </div>

              {/* KPI 2: Needs Table Time (Least Played) */}
              <div
                onClick={() => analytics.leastPlayed && openDeckDrawer(analytics.leastPlayed)}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Needs Table Time
                  </span>
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  {analytics.leastPlayed ? (
                    <>
                      <div
                        className="text-base font-bold text-white line-clamp-1"
                        title={analytics.leastPlayed.name}
                      >
                        {analytics.leastPlayed.name}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-slate-400">
                          Only <strong className="text-indigo-300">{analytics.leastPlayed.games}</strong>{' '}
                          {analytics.leastPlayed.games === 1 ? 'game' : 'games'} played
                        </span>
                        <div className="flex gap-1">
                          {analytics.leastPlayed.colors.map((c) => (
                            <ManaPip key={c} color={c} size="sm" />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">No decks available</p>
                  )}
                </div>
              </div>

              {/* KPI 3: Most Played Commander */}
              <div
                onClick={() => analytics.mostPlayed && openDeckDrawer(analytics.mostPlayed)}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Most Played Deck
                  </span>
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  {analytics.mostPlayed ? (
                    <>
                      <div
                        className="text-base font-bold text-white line-clamp-1"
                        title={analytics.mostPlayed.name}
                      >
                        {analytics.mostPlayed.name}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-slate-400">
                          <strong className="text-rose-300">{analytics.mostPlayed.games}</strong> games (
                          {analytics.mostPlayed.playShare}% share)
                        </span>
                        <div className="flex gap-1">
                          {analytics.mostPlayed.colors.map((c) => (
                            <ManaPip key={c} color={c} size="sm" />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">Log your first game to track</p>
                  )}
                </div>
              </div>

              {/* KPI 4: Highest Win Rate */}
              <div
                onClick={() => analytics.highestWinRate && openDeckDrawer(analytics.highestWinRate)}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Highest Win Rate
                  </span>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  {analytics.highestWinRate ? (
                    <>
                      <div
                        className="text-base font-bold text-white line-clamp-1"
                        title={analytics.highestWinRate.name}
                      >
                        {analytics.highestWinRate.name}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-slate-400">
                          <strong className="text-emerald-400">{analytics.highestWinRate.winRate}%</strong>{' '}
                          win rate ({analytics.highestWinRate.wins}W–{analytics.highestWinRate.losses}L)
                        </span>
                        <div className="flex gap-1">
                          {analytics.highestWinRate.colors.map((c) => (
                            <ManaPip key={c} color={c} size="sm" />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">Log a game to calculate win rates</p>
                  )}
                </div>
              </div>
            </section>

            {/* ================================================================ */}
            {/* COMMANDER BRACKET PERFORMANCE STRIP                              */}
            {/* ================================================================ */}
            <section className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                    Performance by Commander Bracket
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Click any bracket to filter your roster below
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {analytics.bracketStats.map((bStat) => {
                  const meta = COMMANDER_BRACKETS[bStat.bracket];
                  const isActive = bracketFilter === String(bStat.bracket);
                  return (
                    <button
                      key={bStat.bracket}
                      type="button"
                      onClick={() =>
                        setBracketFilter(isActive ? 'all' : String(bStat.bracket))
                      }
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-400 shadow-md'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${meta.badge}`}
                        >
                          {meta.short}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          {bStat.deckCount} {bStat.deckCount === 1 ? 'deck' : 'decks'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1.5">
                        {bStat.games > 0 ? (
                          <span>
                            <strong className="text-white">{bStat.winRate}%</strong> WR ({bStat.wins}W–
                            {bStat.games - bStat.wins}L)
                          </span>
                        ) : (
                          <span className="text-slate-500">0 games logged</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ================================================================ */}
            {/* GLOBAL CARD AWARDS LEADERBOARD (MVP & MOST FUN CARD)             */}
            {/* ================================================================ */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Card of the Match (MVP) */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Card of the Match Hall of Fame</h3>
                      <p className="text-[11px] text-slate-400">Most influential MVPs across your pods</p>
                    </div>
                  </div>
                </div>

                {analytics.topGlobalMvp.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">
                    Nominate a <strong className="text-slate-300">Card of the Match</strong> when logging games to crown your top performers.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {analytics.topGlobalMvp.map((card, idx) => (
                      <div
                        key={card.name}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[11px] shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-100 truncate">{card.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-slate-400">{card.wins}W</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                            {card.count}× MVP
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Most Fun Card */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-pink-500/15 text-pink-400">
                      <Smile className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Most Fun Cards</h3>
                      <p className="text-[11px] text-slate-400">Cards creating the best table moments</p>
                    </div>
                  </div>
                </div>

                {analytics.topGlobalFun.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">
                    Nominate a <strong className="text-slate-300">Most Fun Card</strong> after games to track your table favorites.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {analytics.topGlobalFun.map((card, idx) => (
                      <div
                        key={card.name}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 font-bold flex items-center justify-center text-[11px] shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-100 truncate">{card.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 font-bold shrink-0">
                          {card.count}× Fun
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ================================================================ */}
            {/* VISUAL COMPARISON: PLAY RATE VS WIN RATE CHART                   */}
            {/* ================================================================ */}
            <section className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Deck Rotation & Win Rate Breakdown
                  </h2>
                  <p className="text-xs text-slate-400">
                    Equal rotation across {decks.length} {decks.length === 1 ? 'deck' : 'decks'} is{' '}
                    <span className="text-indigo-300 font-semibold">~{analytics.idealPlayShare}%</span> play
                    share • Standard 4-player pod baseline win rate is{' '}
                    <span className="text-emerald-400 font-semibold">25%</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                    Play Share %
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                    Win Rate %
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                {analytics.deckStats
                  .slice()
                  .sort((a, b) => b.games - a.games || b.winRate - a.winRate)
                  .map((deck) => (
                    <div
                      key={deck.id}
                      onClick={() => openDeckDrawer(deck)}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/70 hover:border-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="md:col-span-4 flex items-center gap-2.5 min-w-0">
                        <div className="flex gap-1 shrink-0">
                          {deck.colors.map((c) => (
                            <ManaPip key={c} color={c} size="sm" />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                          {deck.name}
                        </span>
                      </div>

                      <div className="md:col-span-6 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden relative">
                            <div
                              style={{ width: `${Math.min(100, deck.playShare)}%` }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                            />
                          </div>
                          <span className="w-20 text-right text-[11px] font-medium text-indigo-300 shrink-0">
                            {deck.playShare}% ({deck.games}g)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden relative">
                            <div
                              title="25% Pod Baseline"
                              style={{ left: '25%' }}
                              className="absolute top-0 bottom-0 w-0.5 bg-slate-500/70 z-10"
                            />
                            <div
                              style={{ width: `${Math.min(100, deck.winRate)}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                deck.winRate >= 25
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                  : 'bg-gradient-to-r from-amber-500 to-orange-400'
                              }`}
                            />
                          </div>
                          <span className="w-20 text-right text-[11px] font-medium text-emerald-300 shrink-0">
                            {deck.games > 0 ? `${deck.winRate}% WR` : '—'}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => handleQuickLog(deck.id, 'win', e)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
                        >
                          +W
                        </button>
                        <button
                          onClick={(e) => handleQuickLog(deck.id, 'loss', e)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
                        >
                          +L
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </>
        )}

        {/* ================================================================== */}
        {/* INTERACTIVE DECK ROSTER GRID (DASHBOARD & MY DECKS TAB)            */}
        {/* ================================================================== */}
        {(activeTab === 'dashboard' || activeTab === 'decks') && decks.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Commander Roster
                  <span className="text-xs font-normal text-slate-400">
                    ({displayedDecks.length} of {decks.length} shown)
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Sorted by{' '}
                  <span className="text-amber-300 font-medium">
                    {sortBy === 'least_played' && 'Least Played (Pick your next game!)'}
                    {sortBy === 'most_played' && 'Most Played'}
                    {sortBy === 'win_rate' && 'Highest Win Rate'}
                    {sortBy === 'last_played' && 'Most Recently Played'}
                    {sortBy === 'alpha' && 'Alphabetical'}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Bracket Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setBracketFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      bracketFilter === 'all'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  {[1, 2, 3, 4, 5].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBracketFilter(bracketFilter === String(b) ? 'all' : String(b))}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        bracketFilter === String(b)
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      B{b}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter commander, archetype..."
                    className="w-full sm:w-48 pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="relative flex items-center">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-8 pr-7 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500/60 cursor-pointer"
                  >
                    <option value="least_played">Sort: Least Played First</option>
                    <option value="most_played">Sort: Most Played First</option>
                    <option value="win_rate">Sort: Highest Win Rate</option>
                    <option value="last_played">Sort: Recently Played</option>
                    <option value="alpha">Sort: A – Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Interactive Deck Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedDecks.map((deck) => (
                <div
                  key={deck.id}
                  onClick={() => openDeckDrawer(deck)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openDeckDrawer(deck);
                    }
                  }}
                  className="group rounded-2xl bg-slate-900/95 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 overflow-hidden flex flex-col justify-between transition-all shadow-lg shadow-black/20 cursor-pointer text-left"
                >
                  <div>
                    {/* Scryfall Commander Art Banner (Option 1) */}
                    <CommanderArtBanner deck={deck} heightClass="h-28">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {deck.colors.map((c) => (
                            <ManaPip key={c} color={c} size="md" />
                          ))}
                          <span
                            className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 backdrop-blur-sm ${
                              COMMANDER_BRACKETS[deck.bracket || 3]?.badge
                            }`}
                          >
                            B{deck.bracket || 3}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {deck.moxfieldUrl ? (
                            <a
                              href={deck.moxfieldUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={`Open Your ${getDeckSiteName(deck.moxfieldUrl)} Decklist`}
                              className="px-2 py-1 rounded-lg bg-slate-950/80 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 backdrop-blur-sm text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <span>{getDeckSiteName(deck.moxfieldUrl)}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <button
                              onClick={(e) => openEditDeckModal(deck, e)}
                              title="Attach your Moxfield or Archidekt decklist URL"
                              className="px-2 py-1 rounded-lg bg-slate-950/75 hover:bg-slate-800 text-slate-300 border border-slate-700/80 backdrop-blur-sm text-[11px] font-medium transition-colors"
                            >
                              + Deck URL
                            </button>
                          )}

                          <button
                            onClick={(e) => openEditDeckModal(deck, e)}
                            title="Edit Deck Details"
                            className="p-1.5 rounded-lg bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 backdrop-blur-sm transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors leading-snug drop-shadow">
                            {deck.name}
                          </h3>
                          {deck.archetype && (
                            <p className="text-xs text-slate-300 truncate drop-shadow">
                              {deck.archetype}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </CommanderArtBanner>

                    <div className="p-5 pt-3.5">
                      {/* Decklist & Award Highlights */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                          <FileText className="w-3 h-3 text-slate-400" />
                          {deck.totalCardCount > 0 ? `${deck.totalCardCount} cards` : 'Add decklist'}
                        </span>

                        {deck.topMvpCards[0] && (
                          <span
                            title={`Top MVP: ${deck.topMvpCards[0].name} (${deck.topMvpCards[0].count}x)`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 max-w-[165px] truncate"
                          >
                            <Star className="w-3 h-3 shrink-0" />
                            <span className="truncate">{deck.topMvpCards[0].name}</span>
                          </span>
                        )}

                        {deck.topFunCards[0] && (
                          <span
                            title={`Most Fun: ${deck.topFunCards[0].name} (${deck.topFunCards[0].count}x)`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-500/10 border border-pink-500/25 text-[11px] text-pink-300 max-w-[165px] truncate"
                          >
                            <Smile className="w-3 h-3 shrink-0" />
                            <span className="truncate">{deck.topFunCards[0].name}</span>
                          </span>
                        )}
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-3">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                            Record
                          </div>
                          <div className="text-sm font-bold text-slate-100 mt-0.5">
                            {deck.wins}W–{deck.losses}L
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                            Win Rate
                          </div>
                          <div
                            className={`text-sm font-bold mt-0.5 ${
                              deck.games === 0
                                ? 'text-slate-500'
                                : deck.winRate >= 25
                                ? 'text-emerald-400'
                                : 'text-amber-300'
                            }`}
                          >
                            {deck.games > 0 ? `${deck.winRate}%` : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                            Play Share
                          </div>
                          <div className="text-sm font-bold text-indigo-300 mt-0.5">
                            {deck.playShare}%
                          </div>
                        </div>
                      </div>

                      {/* Meta Footer */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                        <span>
                          {deck.lastPlayed ? `Last played: ${deck.lastPlayed}` : 'Never played yet'}
                        </span>
                        {deck.streak >= 2 && (
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              deck.streakType === 'win'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-rose-500/15 text-rose-300'
                            }`}
                          >
                            {deck.streak}
                            {deck.streakType === 'win' ? 'W' : 'L'} Streak
                          </span>
                        )}
                      </div>

                      {/* Quick One-Tap Log Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={(e) => handleQuickLog(deck.id, 'win', e)}
                          className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-[0.98] text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          <span>+ Win</span>
                        </button>
                        <button
                          onClick={(e) => handleQuickLog(deck.id, 'loss', e)}
                          className="py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span>+ Loss</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================================================================== */}
        {/* PLAYGROUP / POD SHARED ROOM & LEADERBOARD TAB (OPTION 2)           */}
        {/* ================================================================== */}
        {activeTab === 'pod' && (
          <section className="space-y-5">
            {!activePodId ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Create a Pod */}
                <form
                  onSubmit={handleCreatePod}
                  className="rounded-2xl bg-slate-900/95 border border-slate-800 p-6 space-y-4"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-white">
                        Create a Playgroup Pod Room
                      </h2>
                      <p className="text-xs text-slate-400">
                        Generate a 6-character invite code for your regular pod
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Playgroup Name
                    </label>
                    <input
                      type="text"
                      value={podNameInput}
                      onChange={(e) => setPodNameInput(e.target.value)}
                      placeholder="e.g., Friday Night Commander Pod"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/15"
                  >
                    Create Pod & Get Invite Code
                  </button>
                </form>

                {/* Join an Existing Pod */}
                <form
                  onSubmit={handleJoinPod}
                  className="rounded-2xl bg-slate-900/95 border border-slate-800 p-6 space-y-4"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-white">
                        Join an Existing Pod
                      </h2>
                      <p className="text-xs text-slate-400">
                        Enter a friend's Pod invite code to sync stats live
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      6-Character Pod Code
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={podJoinInput}
                      onChange={(e) => setPodJoinInput(e.target.value.toUpperCase())}
                      placeholder="e.g., A7X2K9"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm uppercase tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/15"
                  >
                    Join Pod Leaderboard
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-900/95 border border-slate-800 p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg font-extrabold text-white">
                        {podData?.name || 'Playgroup Pod'}
                      </h2>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(activePodId);
                            showToast(`Copied Pod invite code: ${activePodId}`);
                          } catch {}
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 font-mono text-xs font-bold flex items-center gap-1.5"
                      >
                        <span>Code: {activePodId}</span>
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Share code <strong className="text-slate-200">{activePodId}</strong> so friends can join from their own accounts and compare live win rates.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLeavePod}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold self-start sm:self-auto"
                  >
                    Leave Pod
                  </button>
                </div>

                {podLoading ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    Loading live Pod standings...
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {Object.values(podData?.members || {})
                      .sort(
                        (a, b) =>
                          (b.winRate || 0) - (a.winRate || 0) ||
                          (b.totalWins || 0) - (a.totalWins || 0)
                      )
                      .map((member, idx) => (
                        <div
                          key={member.uid}
                          className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-full font-extrabold text-xs flex items-center justify-center shrink-0 ${
                                idx === 0
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              #{idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="truncate">{member.name}</span>
                                {member.uid === user?.uid && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 truncate">
                                Signature Commander:{' '}
                                <span className="text-indigo-300 font-medium">
                                  {member.signatureCommander || '—'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs shrink-0">
                            <div className="text-right">
                              <div className="text-slate-400">Record</div>
                              <div className="font-bold text-slate-100">
                                {member.totalWins}W–{member.totalGames - member.totalWins}L
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-slate-400">Win Rate</div>
                              <div className="font-extrabold text-emerald-400">
                                {member.winRate}%
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-slate-400">Roster</div>
                              <div className="font-bold text-slate-200">
                                {member.totalDecks} decks
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ================================================================== */}
        {/* MATCH HISTORY TAB                                                  */}
        {/* ================================================================== */}
        {activeTab === 'history' && (
          <section className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">Complete Match Log</h2>
                <p className="text-xs text-slate-400">
                  {matches.length} total games recorded across your pods
                </p>
              </div>
              {decks.length > 0 && (
                <button
                  onClick={() => openLogModal()}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log New Game</span>
                </button>
              )}
            </div>

            {matches.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl">
                <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No games logged yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {decks.length === 0
                    ? 'Add a commander deck first, then log your match wins and losses here.'
                    : 'Tap "+ Win" or "+ Loss" on any deck card, or click "Log Game" to record your next pod.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {matches.map((match) => {
                  const deck = decks.find((d) => d.id === match.deckId);
                  return (
                    <div
                      key={match.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider shrink-0 ${
                            match.result === 'win'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {match.result}
                        </span>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white truncate">
                              {deck?.name || 'Removed Deck'}
                            </span>
                            {deck && (
                              <>
                                <div className="flex gap-1">
                                  {deck.colors.map((c) => (
                                    <ManaPip key={c} color={c} size="sm" />
                                  ))}
                                </div>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                    COMMANDER_BRACKETS[deck.bracket || 3]?.badge
                                  }`}
                                >
                                  B{deck.bracket || 3}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {match.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {match.podSize || 4}-Player Pod
                            </span>
                            {match.notes && (
                              <span className="text-slate-300 italic">"{match.notes}"</span>
                            )}
                          </div>

                          {(match.mvpCard || match.funCard) && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {match.mvpCard && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[11px] font-medium text-amber-300">
                                  <Star className="w-3 h-3" />
                                  MVP: {match.mvpCard}
                                </span>
                              )}
                              {match.funCard && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30 text-[11px] font-medium text-pink-300">
                                  <Smile className="w-3 h-3" />
                                  Fun: {match.funCard}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        title="Delete Match Entry"
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors self-end sm:self-center shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {/* ==================================================================== */}
      {/* FLOATING QUICK AWARD PROMPT (AFTER +WIN OR +LOSS ON A CARD)          */}
      {/* ==================================================================== */}
      {quickAwardMatchId && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-2xl mx-auto">
          <form
            onSubmit={handleSaveQuickAwards}
            className="rounded-2xl bg-slate-900/95 backdrop-blur-md border border-amber-500/50 p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-bold text-white">
                  Nominate Match Standout Cards (Optional)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQuickAwardMatchId(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CardNominationInput
                label="Card of the Match (MVP)"
                icon={Star}
                iconColor="text-amber-400"
                placeholder="Most influential card..."
                value={quickMvpCard}
                onChange={setQuickMvpCard}
                deckCards={
                  decks.find(
                    (d) => d.id === matches.find((m) => m.id === quickAwardMatchId)?.deckId
                  )?.decklist || []
                }
              />
              <CardNominationInput
                label="Most Fun Card"
                icon={Smile}
                iconColor="text-pink-400"
                placeholder="Most fun card..."
                value={quickFunCard}
                onChange={setQuickFunCard}
                deckCards={
                  decks.find(
                    (d) => d.id === matches.find((m) => m.id === quickAwardMatchId)?.deckId
                  )?.decklist || []
                }
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setQuickAwardMatchId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Skip
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Save Nominations
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================================== */}
      {/* INTERACTIVE DECK DETAIL DRAWER (DECKLIST, MOXFIELD SYNC & AWARDS)    */}
      {/* ==================================================================== */}
      {selectedDeck && selectedDeckStats && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-4xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex gap-1">
                    {selectedDeck.colors.map((c) => (
                      <ManaPip key={c} color={c} size="md" />
                    ))}
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white truncate">
                    {selectedDeck.name}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                      COMMANDER_BRACKETS[selectedDeck.bracket || 3]?.badge
                    }`}
                  >
                    {COMMANDER_BRACKETS[selectedDeck.bracket || 3]?.short}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                  {selectedDeck.archetype && (
                    <span className="text-indigo-300 font-semibold">{selectedDeck.archetype}</span>
                  )}
                  <span>
                    Record:{' '}
                    <strong className="text-white">
                      {selectedDeckStats.wins}W–{selectedDeckStats.losses}L
                    </strong>{' '}
                    ({selectedDeckStats.winRate}% WR)
                  </span>
                  <span>•</span>
                  <span>
                    Play Share: <strong className="text-indigo-300">{selectedDeckStats.playShare}%</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Decklist: <strong className="text-amber-300">{selectedDeckStats.totalCardCount} cards</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditDeckModal(selectedDeck)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit Deck</span>
                </button>
                <button
                  onClick={() => setSelectedDeckId(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Moxfield / Archidekt Sync & Auto-Check Control Bar */}
            <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isSyncingMoxfield}
                  onClick={() => syncDeckFromUrl(selectedDeck, false)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 disabled:opacity-50 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMoxfield ? 'animate-spin' : ''}`} />
                  <span>
                    {isSyncingMoxfield
                      ? `Checking ${getDeckSiteName(selectedDeck.moxfieldUrl)}...`
                      : `Sync ${getDeckSiteName(selectedDeck.moxfieldUrl)}`}
                  </span>
                </button>

                {selectedDeck.moxfieldUrl ? (
                  <a
                    href={selectedDeck.moxfieldUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>Open {getDeckSiteName(selectedDeck.moxfieldUrl)}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEditDeckModal(selectedDeck)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold"
                  >
                    + Link Moxfield / Archidekt URL
                  </button>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(selectedDeck.autoSync)}
                  onChange={() => toggleDeckAutoSync(selectedDeck.id)}
                  className="rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <span>Auto-check on load</span>
              </label>
            </div>

            {/* Optional Moxfield Sync Banner */}
            {moxfieldSyncBanner && (
              <div className="mx-5 mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-start justify-between gap-3 text-xs text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{moxfieldSyncBanner.message}</span>
                </div>
                <button
                  onClick={() => setMoxfieldSyncBanner(null)}
                  className="text-amber-300 hover:text-white shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Drawer Inner Tabs */}
            <div className="px-5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
              {[
                {
                  id: 'decklist',
                  label: `Decklist (${selectedDeckStats.totalCardCount})`,
                  icon: FileText
                },
                {
                  id: 'analytics',
                  label: 'Curve & Game Changers',
                  icon: PieChart
                },
                {
                  id: 'awards',
                  label: 'Card Hall of Fame & Cuts',
                  icon: Star
                },
                {
                  id: 'history',
                  label: `Matches & Changelog (${selectedDeck.revisions?.length || 0})`,
                  icon: GitCommit
                }
              ].map((t) => {
                const Icon = t.icon;
                const active = drawerTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDrawerTab(t.id)}
                    className={`px-3.5 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                      active
                        ? 'border-amber-400 text-amber-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* TAB A: DECKLIST & EDITOR */}
              {drawerTab === 'decklist' && (
                <div className="space-y-4">
                  {isEditingList ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Paste or Edit Decklist (MTGO / Moxfield Text Format)
                        </label>
                        <span className="text-xs text-slate-400">
                          Format: <code className="text-amber-300">1 Sol Ring</code> (1 card per line)
                        </span>
                      </div>

                      <textarea
                        rows={14}
                        value={decklistDraft}
                        onChange={(e) => setDecklistDraft(e.target.value)}
                        placeholder={`1 Sol Ring\n1 Arcane Signet\n1 Command Tower\n...`}
                        className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">
                          Changelog Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={revisionNote}
                          onChange={(e) => setRevisionNote(e.target.value)}
                          placeholder="e.g., Added upgrades from Bloomburrow, cut 3 taplands..."
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingList(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveDecklist}
                          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save & Diff Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Card List Column */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="relative flex-1 min-w-[160px]">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={decklistSearch}
                              onChange={(e) => setDecklistSearch(e.target.value)}
                              placeholder="Search cards in deck..."
                              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={handlePasteClipboardToDrawer}
                              className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Paste from Clipboard</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDecklistDraft(serializeDecklist(selectedDeck.decklist || []));
                                setRevisionNote('');
                                setIsEditingList(true);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-xs font-bold flex items-center gap-1.5"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>
                                {(selectedDeck.decklist || []).length > 0
                                  ? 'Edit List'
                                  : 'Manual Paste'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {(selectedDeck.decklist || []).length === 0 ? (
                          <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 space-y-2">
                            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                            <p className="text-sm font-semibold text-slate-300">
                              No decklist stored for {selectedDeck.name} yet
                            </p>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                              Click <strong>Paste from Clipboard</strong> to paste your Moxfield/Archidekt export, or link your Moxfield or Archidekt URL above and click <strong>Sync</strong>.
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-xl bg-slate-950/80 border border-slate-800 divide-y divide-slate-800/60 max-h-[460px] overflow-y-auto">
                            {(selectedDeck.decklist || [])
                              .filter((c) =>
                                c.name.toLowerCase().includes(decklistSearch.toLowerCase())
                              )
                              .map((card) => {
                                const mvpCount =
                                  selectedDeckStats.topMvpCards.find(
                                    (m) => m.name.toLowerCase() === card.name.toLowerCase()
                                  )?.count || 0;
                                const funCount =
                                  selectedDeckStats.topFunCards.find(
                                    (f) => f.name.toLowerCase() === card.name.toLowerCase()
                                  )?.count || 0;

                                return (
                                  <button
                                    key={card.name}
                                    type="button"
                                    onMouseEnter={() => setPreviewCardName(card.name)}
                                    onClick={() => setPreviewCardName(card.name)}
                                    className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors ${
                                      previewCardName === card.name
                                        ? 'bg-amber-500/15 text-amber-200'
                                        : 'hover:bg-slate-900 text-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="font-mono text-slate-500 w-5 shrink-0">
                                        {card.qty}×
                                      </span>
                                      <span className="font-medium truncate">{card.name}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {mvpCount > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                          ★ {mvpCount}
                                        </span>
                                      )}
                                      {funCount > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-300 border border-pink-500/30 text-[10px] font-bold">
                                          ☺ {funCount}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                          </div>
                        )}
                      </div>

                      {/* Scryfall Card Image Preview Column */}
                      <div className="lg:col-span-5">
                        <ScryfallCardPreview cardName={previewCardName} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB B2: MANA CURVE, TYPES & GAME CHANGERS (OPTION 3) */}
              {drawerTab === 'analytics' && (
                <DeckAnalyticsTab
                  decklist={selectedDeck.decklist || []}
                  onPreviewCard={(cardName) => {
                    setPreviewCardName(cardName);
                    setDrawerTab('decklist');
                  }}
                />
              )}

              {/* TAB B: CARD HALL OF FAME & CUT CANDIDATES */}
              {drawerTab === 'awards' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Deck MVP Cards */}
                    <div className="rounded-2xl bg-slate-950/60 border border-amber-500/25 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-bold text-white">
                          Card of the Match (MVP) Winners
                        </h3>
                      </div>

                      {selectedDeckStats.topMvpCards.length === 0 ? (
                        <p className="text-xs text-slate-500 py-8 text-center">
                          No MVP cards nominated for {selectedDeck.name} yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selectedDeckStats.topMvpCards.map((card, idx) => (
                            <div
                              key={card.name}
                              onClick={() => {
                                setPreviewCardName(card.name);
                                setDrawerTab('decklist');
                              }}
                              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="truncate">
                                  <div className="text-xs sm:text-sm font-bold text-white truncate">
                                    {card.name}
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    {card.wins} {card.wins === 1 ? 'win' : 'wins'} when named MVP
                                  </div>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-extrabold shrink-0">
                                {card.count}×
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Deck Most Fun Cards */}
                    <div className="rounded-2xl bg-slate-950/60 border border-pink-500/25 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Smile className="w-4 h-4 text-pink-400" />
                        <h3 className="text-sm font-bold text-white">Most Fun Card Winners</h3>
                      </div>

                      {selectedDeckStats.topFunCards.length === 0 ? (
                        <p className="text-xs text-slate-500 py-8 text-center">
                          No Fun Cards nominated for {selectedDeck.name} yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selectedDeckStats.topFunCards.map((card, idx) => (
                            <div
                              key={card.name}
                              onClick={() => {
                                setPreviewCardName(card.name);
                                setDrawerTab('decklist');
                              }}
                              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/40 flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="truncate">
                                  <div className="text-xs sm:text-sm font-bold text-white truncate">
                                    {card.name}
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    Memorable play generator
                                  </div>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30 text-xs font-extrabold shrink-0">
                                {card.count}×
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cut Candidates vs. Deck All-Stars Insight Panel */}
                  <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-sky-400" />
                        <h3 className="text-sm font-bold text-white">
                          Deck Tuning Insights: All-Stars vs. Cut Candidates
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {selectedDeckStats.allStarCards.length} All-Stars •{' '}
                        {selectedDeckStats.cutCandidates.length} Un-nominated Non-Basic Cards
                      </span>
                    </div>

                    {(selectedDeck.decklist || []).length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">
                        Paste or sync your 100-card decklist in the <strong>Decklist & Sync</strong>{' '}
                        tab to unlock automated Cut Candidate detection!
                      </p>
                    ) : selectedDeckStats.cutCandidates.length === 0 ? (
                      <p className="text-xs text-emerald-400 py-2">
                        Every non-basic card in your decklist has earned at least one MVP or Fun Card
                        nomination!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400">
                          Non-basic cards in your stored list that have{' '}
                          <strong className="text-slate-200">never</strong> been nominated as MVP or
                          Most Fun (click any card to preview before cutting):
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pt-1">
                          {selectedDeckStats.cutCandidates.map((cardName) => (
                            <button
                              key={cardName}
                              type="button"
                              onClick={() => {
                                setPreviewCardName(cardName);
                                setDrawerTab('decklist');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 text-xs transition-colors"
                            >
                              {cardName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB C: MATCH HISTORY, PATCH IMPACT & REVISION CHANGELOG */}
              {drawerTab === 'history' && (
                <div className="space-y-5">
                  {/* Deck Tuning Impact ("Before & After" Patch Analytics Banner) */}
                  {selectedDeckStats.patchImpact && (
                    <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-950 to-indigo-950/30 border border-indigo-500/30 p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-indigo-400" />
                          <h3 className="text-sm font-bold text-white">
                            Latest Deck Tuning Impact
                          </h3>
                        </div>
                        <span className="text-[11px] text-indigo-300 font-medium">
                          Patch: "{selectedDeckStats.patchImpact.revision.note}" (
                          {selectedDeckStats.patchImpact.revision.date})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                            Before Latest Edit
                          </div>
                          <div className="text-base font-extrabold text-slate-200 mt-0.5">
                            {selectedDeckStats.patchImpact.preWinRate !== null
                              ? `${selectedDeckStats.patchImpact.preWinRate}% WR`
                              : 'No games before edit'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {selectedDeckStats.patchImpact.preWins}W–
                            {selectedDeckStats.patchImpact.preLosses}L (
                            {selectedDeckStats.patchImpact.preGames} games)
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                            Since Latest Edit
                          </div>
                          <div className="text-base font-extrabold text-white mt-0.5">
                            {selectedDeckStats.patchImpact.postWinRate !== null
                              ? `${selectedDeckStats.patchImpact.postWinRate}% WR`
                              : '0 games since edit'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {selectedDeckStats.patchImpact.postWins}W–
                            {selectedDeckStats.patchImpact.postLosses}L (
                            {selectedDeckStats.patchImpact.postGames} games)
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-center">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                            Win-Rate Shift
                          </div>
                          {selectedDeckStats.patchImpact.delta !== null ? (
                            <div
                              className={`text-base font-extrabold mt-0.5 flex items-center gap-1 ${
                                selectedDeckStats.patchImpact.delta >= 0
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {selectedDeckStats.patchImpact.delta >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span>
                                {selectedDeckStats.patchImpact.delta > 0 ? '+' : ''}
                                {selectedDeckStats.patchImpact.delta}%
                              </span>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 mt-1">
                              Play games before & after a swap to compare
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Deck Matches */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-emerald-400" />
                        <span>Recorded Matches ({selectedDeckStats.games})</span>
                      </h3>

                      {selectedDeckStats.games === 0 ? (
                        <p className="text-xs text-slate-500 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                          No games played with {selectedDeck.name} yet.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                          {matches
                            .filter((m) => m.deckId === selectedDeck.id)
                            .map((m) => (
                              <div
                                key={m.id}
                                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`px-2 py-0.5 rounded font-extrabold uppercase ${
                                      m.result === 'win'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {m.result}
                                  </span>
                                  <span className="text-slate-400">
                                    {m.date} • {m.podSize || 4}p
                                  </span>
                                </div>

                                {(m.mvpCard || m.funCard) && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {m.mvpCard && (
                                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                        MVP: {m.mvpCard}
                                      </span>
                                    )}
                                    {m.funCard && (
                                      <span className="px-2 py-0.5 rounded bg-pink-500/15 text-pink-300 border border-pink-500/30">
                                        Fun: {m.funCard}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {m.notes && <p className="text-slate-300 italic">"{m.notes}"</p>}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Decklist Revision Changelog */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <GitCommit className="w-4 h-4 text-amber-400" />
                        <span>Decklist Revision History ({selectedDeck.revisions?.length || 0})</span>
                      </h3>

                      {(selectedDeck.revisions || []).length === 0 ? (
                        <p className="text-xs text-slate-500 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                          Every time you edit or sync your decklist, a changelog of cards added and cut appears here.
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                          {(selectedDeck.revisions || []).map((rev) => (
                            <div
                              key={rev.id}
                              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200">{rev.note}</span>
                                <span className="text-slate-500">{rev.date}</span>
                              </div>

                              {rev.added?.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                    + Added ({rev.added.length})
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {rev.added.slice(0, 18).map((c) => (
                                      <span
                                        key={c.name}
                                        className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-[11px]"
                                      >
                                        +{c.qty} {c.name}
                                      </span>
                                    ))}
                                    {rev.added.length > 18 && (
                                      <span className="text-slate-500 text-[11px] self-center">
                                        +{rev.added.length - 18} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {rev.removed?.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                                    - Removed ({rev.removed.length})
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {rev.removed.slice(0, 18).map((c) => (
                                      <span
                                        key={c.name}
                                        className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/25 text-[11px]"
                                      >
                                        -{c.qty} {c.name}
                                      </span>
                                    ))}
                                    {rev.removed.length > 18 && (
                                      <span className="text-slate-500 text-[11px] self-center">
                                        +{rev.removed.length - 18} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* COMMANDER WRAPPED SEASON RECAP MODAL (OPTION 6)                      */}
      {/* ==================================================================== */}
      {isWrappedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-amber-500/40 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Commander Wrapped</h3>
              </div>
              <button
                onClick={() => setIsWrappedModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-2xl bg-slate-950/90 border border-amber-500/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                      Commander Vault Recap
                    </div>
                    <h4 className="text-lg font-extrabold text-white mt-0.5">{accountLabel}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-emerald-400">
                      {analytics.overallWinRate}% WR
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {analytics.totalWins}W – {analytics.totalGames - analytics.totalWins}L (
                      {analytics.totalGames} games)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">🏆 Signature Commander</span>
                    <span className="font-bold text-white truncate max-w-[190px]">
                      {analytics.topSignatureCommander?.name || decks[0]?.name || '—'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">🔥 Most Played Deck</span>
                    <span className="font-bold text-indigo-300 truncate max-w-[190px]">
                      {analytics.mostPlayed
                        ? `${analytics.mostPlayed.name} (${analytics.mostPlayed.games}g)`
                        : '—'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">⭐ #1 Card of the Match</span>
                    <span className="font-bold text-amber-300 truncate max-w-[190px]">
                      {analytics.topGlobalMvp[0]
                        ? `${analytics.topGlobalMvp[0].name} (${analytics.topGlobalMvp[0].count}×)`
                        : '—'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">🎉 Most Fun Card</span>
                    <span className="font-bold text-pink-300 truncate max-w-[190px]">
                      {analytics.topGlobalFun[0]
                        ? `${analytics.topGlobalFun[0].name} (${analytics.topGlobalFun[0].count}×)`
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const summary = [
                    `🏆 ${accountLabel}'s Commander Wrapped`,
                    `• Record: ${analytics.totalWins}W–${analytics.totalGames - analytics.totalWins}L (${analytics.overallWinRate}% WR across ${decks.length} decks)`,
                    `• Signature Commander: ${analytics.topSignatureCommander?.name || decks[0]?.name || 'N/A'}`,
                    `• Most Played: ${analytics.mostPlayed ? `${analytics.mostPlayed.name} (${analytics.mostPlayed.games} games)` : 'N/A'}`,
                    `• #1 MVP Card: ${analytics.topGlobalMvp[0]?.name || 'N/A'}`,
                    `• Most Fun Card: ${analytics.topGlobalFun[0]?.name || 'N/A'}`
                  ].join('\n');
                  try {
                    await navigator.clipboard.writeText(summary);
                    showToast('Copied Commander Wrapped recap for Discord / WhatsApp!');
                  } catch {
                    showToast('Could not copy to clipboard', 'error');
                  }
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Share2 className="w-4 h-4" />
                <span>Copy Recap for Discord / WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: CUSTOM CONFIRMATION DIALOG                                  */}
      {/* ==================================================================== */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{confirmAction.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {confirmAction.message}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white"
              >
                {confirmAction.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TOAST NOTIFICATION                                                   */}
      {/* ==================================================================== */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs sm:text-sm font-semibold text-white">
          <span
            className={`w-2 h-2 rounded-full ${
              toast.type === 'win'
                ? 'bg-emerald-400'
                : toast.type === 'error'
                ? 'bg-rose-400'
                : 'bg-amber-400'
            }`}
          />
          <span>{toast.message}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-1" />
        </div>
      )}
    </div>
  );
}
