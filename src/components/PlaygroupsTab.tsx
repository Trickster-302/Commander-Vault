// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Users, LogIn, Copy } from 'lucide-react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export default function PlaygroupsTab({
  db,
  appId,
  user,
  accountLabel,
  decks,
  analytics,
  cloudLoading,
  activePodId,
  setActivePodId,
  openAccountModal,
  showToast
}) {
  const [podJoinInput, setPodJoinInput] = useState('');
  const [podNameInput, setPodNameInput] = useState('');
  const [podData, setPodData] = useState(null);
  const [podLoading, setPodLoading] = useState(false);

  // Listen to active Playgroup room in real time
  useEffect(() => {
    if (!user || !activePodId) {
      setPodData(null);
      return;
    }
    setPodLoading(true);
    const podDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'pods', activePodId);
    const unsub = onSnapshot(
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
    return () => unsub();
  }, [db, appId, user, activePodId]);

  // Sync current player's stats into active Playgroup room
  useEffect(() => {
    if (!user || user.isAnonymous || !activePodId || !podData || cloudLoading) return;
    const signatureDeck = [...decks]
      .filter((d) => analytics.deckStats?.find((s) => s.id === d.id)?.games > 0)
      .sort((a, b) => {
        const sa = analytics.deckStats.find((s) => s.id === a.id);
        const sb = analytics.deckStats.find((s) => s.id === b.id);
        return (sb?.wins || 0) - (sa?.wins || 0) || (sb?.winRate || 0) - (sa?.winRate || 0);
      })[0];

    const currentStats = {
      uid: user.uid,
      name: accountLabel,
      totalDecks: decks.length,
      totalGames: analytics.totalGames,
      totalWins: analytics.totalWins,
      winRate: analytics.overallWinRate,
      signatureCommander: signatureDeck?.name || decks[0]?.name || '—',
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
  }, [user, activePodId, podData, cloudLoading, decks, analytics, accountLabel, db, appId]);

  const handleCreatePod = async (e) => {
    e.preventDefault();
    if (!user || user.isAnonymous) {
      openAccountModal('signup');
      showToast('Create a free account first to host or join a Playgroup!', 'error');
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
      signatureCommander: decks[0]?.name || '—',
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
    showToast(`Created Playgroup ${code}! Share the code with your group.`);
  };

  const handleJoinPod = async (e) => {
    e.preventDefault();
    if (!user || user.isAnonymous) {
      openAccountModal('signup');
      showToast('Create a free account first to join a Playgroup!', 'error');
      return;
    }
    const cleanCode = podJoinInput.trim().toUpperCase().replace(/^POD-/, '');
    if (cleanCode.length < 4) {
      showToast('Enter a valid 6-character Playgroup invite code', 'error');
      return;
    }
    const podSnap = await getDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'pods', cleanCode)
    );
    if (!podSnap.exists()) {
      showToast(`No Playgroup found with code "${cleanCode}"`, 'error');
      return;
    }
    const memberSnapshot = {
      uid: user.uid,
      name: accountLabel,
      totalDecks: decks.length,
      totalGames: analytics.totalGames,
      totalWins: analytics.totalWins,
      winRate: analytics.overallWinRate,
      signatureCommander: decks[0]?.name || '—',
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
    showToast(`Joined Playgroup ${cleanCode}!`);
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
    showToast('Left Playgroup room');
  };

  if (!activePodId) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <form
          onSubmit={handleCreatePod}
          className="rounded-2xl bg-slate-900/95 border border-slate-800 p-6 space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Create a Playgroup Room</h2>
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
            Create Playgroup & Get Invite Code
          </button>
        </form>

        <form
          onSubmit={handleJoinPod}
          className="rounded-2xl bg-slate-900/95 border border-slate-800 p-6 space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Join an Existing Playgroup</h2>
              <p className="text-xs text-slate-400">
                Enter a friend's invite code to sync stats live
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              6-Character Invite Code
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
            Join Playgroup Leaderboard
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-slate-900/95 border border-slate-800 p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-extrabold text-white">
              {podData?.name || 'Playgroup'}
            </h2>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(activePodId);
                  showToast(`Copied invite code: ${activePodId}`);
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
          Leave Playgroup
        </button>
      </div>

      {podLoading ? (
        <div className="py-10 text-center text-xs text-slate-400">
          Loading live Playgroup standings...
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
                    <div className="font-extrabold text-emerald-400">{member.winRate}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400">Roster</div>
                    <div className="font-bold text-slate-200">{member.totalDecks} decks</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
