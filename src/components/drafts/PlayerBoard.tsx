"use client";

import { useDraftStore } from "@/store/useDraftStore";

export default function PlayerBoard({ isUserTurn }: { isUserTurn: boolean }) {
  const { availablePlayers, draftPlayer } = useDraftStore();

  return (
    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
      {availablePlayers.map((player) => (
        <div 
          key={player.id} 
          className="p-3 border rounded-lg flex justify-between items-center hover:bg-slate-50 transition-colors"
        >
          <div>
            <div className="font-bold text-slate-900">{player.rank}. {player.name}</div>
            <div className="text-sm text-slate-500 flex gap-2 mt-0.5">
              <span className="font-bold text-blue-600">{player.position}</span>
              <span>• {player.college}</span>
            </div>
          </div>
          
          <button
            disabled={!isUserTurn}
            onClick={() => draftPlayer(player, "User selected pick.")}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-md text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Draft
          </button>
        </div>
      ))}
    </div>
  );
}