// @ts-nocheck
import React from 'react';
import { Sparkles, X, Share2 } from 'lucide-react';

export default function WrappedModal({
  isOpen,
  onClose,
  accountLabel,
  decks,
  analytics,
  showToast
}) {
  if (!isOpen) return null;

  const signatureCommander =
    [...(analytics.deckStats || [])]
      .filter((d) => d.games > 0)
      .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate || b.games - a.games)[0]?.name ||
    decks[0]?.name ||
    '—';

  const handleCopyRecap = async () => {
    const summary = [
      `🏆 ${accountLabel}'s Commander Wrapped`,
      `• Record: ${analytics.totalWins}W–${analytics.totalGames - analytics.totalWins}L (${analytics.overallWinRate}% WR across ${decks.length} decks)`,
      `• Signature Commander: ${signatureCommander}`,
      `• Most Played: ${analytics.mostPlayed ? `${analytics.mostPlayed.name} (${analytics.mostPlayed.games} games)` : 'N/A'}`,
      `• #1 MVP Card: ${analytics.topGlobalMvp?.[0]?.name || 'N/A'}`,
      `• Most Fun Card: ${analytics.topGlobalFun?.[0]?.name || 'N/A'}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      showToast('Copied Commander Wrapped recap for Discord / WhatsApp!');
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-amber-500/40 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-extrabold text-white">Commander Wrapped</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
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
                  {signatureCommander}
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
                  {analytics.topGlobalMvp?.[0]
                    ? `${analytics.topGlobalMvp[0].name} (${analytics.topGlobalMvp[0].count}×)`
                    : '—'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">🎉 Most Fun Card</span>
                <span className="font-bold text-pink-300 truncate max-w-[190px]">
                  {analytics.topGlobalFun?.[0]
                    ? `${analytics.topGlobalFun[0].name} (${analytics.topGlobalFun[0].count}×)`
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyRecap}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Share2 className="w-4 h-4" />
            <span>Copy Recap for Discord / WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
