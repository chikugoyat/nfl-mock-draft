    "use client";

import { useDraftStore } from "@/store/useDraftStore";
import teamsData from "@/data/teams.json";

export default function TeamWarRoom() {
  const { userTeamId, draftHistory } = useDraftStore();
  
  if (!userTeamId) return null;
  
  const userTeam = teamsData.find(t => t.id === userTeamId);
  const myPicks = draftHistory.filter(pick => pick.team.id === userTeamId);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Team Context Card */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 text-lg mb-2">{userTeam?.name}</h4>
        <div className="text-sm text-slate-600 mb-4 leading-relaxed">
          {userTeam?.context}
        </div>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Positional Needs
          </span>
          <div className="flex gap-2 mt-2">
            {userTeam?.needs.map(need => (
              <span key={need} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-md shadow-sm">
                {need}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Drafted Players Roster */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Drafted Roster ({myPicks.length}/4)
        </h4>
        
        {myPicks.length === 0 ? (
          <div className="text-sm text-slate-400 italic text-center mt-6">
            Your roster is currently empty.
          </div>
        ) : (
          <div className="space-y-2">
            {myPicks.map((pick, i) => (
              <div key={i} className="p-3 border rounded-lg bg-white border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">{pick.player.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{pick.player.college}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-blue-600">{pick.player.position}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mt-1">
                    RND {pick.round}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}