// @ts-nocheck
import React, { useState, useEffect } from 'react';

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

export default function CommanderArtBanner({ deck, heightClass = 'h-28', children }) {
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
  }, [
    deck?.id,
    deck?.name,
    deck?.primaryCommander,
    deck?.partnerCommander,
    deck?.primaryArtUrl,
    deck?.partnerArtUrl
  ]);

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
}
