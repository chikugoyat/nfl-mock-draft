"use client";

import { useEffect } from "react";
import { useDraftStore } from "@/store/useDraftStore";
import teamsData from "@/data/teams.json";
import { Loader2 } from "lucide-react";
import PlayerBoard from "@/components/drafts/PlayerBoard";
import TeamWarRoom from "@/components/drafts/TeamWarRoom";
import DraftHistory from "@/components/drafts/DraftHistory";


export default function Home() {
  const { 
    userTeamId, 
    setUserTeam, 
    currentPickIndex, 
    currentRound, 
    isDraftComplete,
    isAIPicking,
    setAIPicking,
    availablePlayers,
    draftPlayer,
    resetDraft // <-- Added this so we can restart the game!
  } = useDraftStore();

  // ==========================================
  // THE AI ORCHESTRATOR
  // ==========================================
  useEffect(() => {
    let isCurrentTurn = true; 

    const processAIPick = async () => {
      if (userTeamId === null || isDraftComplete) return;

      const currentTeam = teamsData[currentPickIndex];
      
      if (currentTeam.id === userTeamId) {
         setAIPicking(false);
         return;
      }

      setAIPicking(true);

      try {
        const response = await fetch('/api/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team: currentTeam,
            availablePlayers
          })
        });

        if (!response.ok) throw new Error("API Failed");

        const data = await response.json();
        
        setTimeout(() => {
          if (isCurrentTurn) draftPlayer(data.player, data.reasoning); 
        }, 1500); 

      } catch (error) {
        console.error("Failed to fetch AI pick", error);
        
        const fallbackPlayer = availablePlayers.find(p => currentTeam.needs.includes(p.position)) || availablePlayers[0];
        setTimeout(() => {
          if (isCurrentTurn) draftPlayer(fallbackPlayer, "Auto-selected due to network timeout or quota limit.");
        }, 1500);
      }
    };

    processAIPick();

    return () => {
      isCurrentTurn = false; 
    };
  }, [currentPickIndex, currentRound, userTeamId, isDraftComplete, availablePlayers, draftPlayer, setAIPicking]);

  // ==========================================
  // VIEW 1: PRE-DRAFT SCREEN
  // ==========================================
  if (!userTeamId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">2026 NFL Mock Draft</h1>
            <p className="text-slate-500 text-lg">Select the team you want to control.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamsData.map((team) => (
              <button
                key={team.id}
                onClick={() => setUserTeam(team.id)}
                className="p-6 text-left bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600">{team.name}</h3>
                <div className="flex gap-2 mt-3">
                  {team.needs.map(need => (
                    <span key={need} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                      {need}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: POST-DRAFT SUMMARY
  // ==========================================
  if (isDraftComplete) {
    const myPicks = useDraftStore.getState().draftHistory.filter(pick => pick.team.id === userTeamId);
    
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Draft Complete!</h1>
          <p className="text-slate-500 text-lg">You have successfully drafted your 2026 rookie class.</p>
          
          <div className="text-left bg-slate-50 p-6 rounded-xl border border-slate-200 mt-6">
            <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Your Final Roster:</h3>
            <ul className="space-y-3">
              {myPicks.map((pick, i) => (
                <li key={i} className="flex justify-between items-center font-medium">
                  <span className="text-slate-700">Round {pick.round}: {pick.player.name}</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-sm font-bold border border-blue-100">{pick.player.position}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <button 
            onClick={() => resetDraft()} 
            className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors w-full"
          >
            Start New Draft
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: DRAFT DASHBOARD
  // ==========================================
  const currentTeamOnClock = teamsData[currentPickIndex];
  const isUserTurn = currentTeamOnClock.id === userTeamId;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Round {currentRound} • Pick {currentPickIndex + 1}
          </h2>
          <div className="text-2xl font-bold flex items-center gap-3">
            ON THE CLOCK: {currentTeamOnClock.name}
            {isAIPicking && <Loader2 className="w-5 h-5 animate-spin text-blue-400" />}
          </div>
        </div>
        <div>
          {isUserTurn ? (
             <span className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-bold animate-pulse">
               YOUR TURN
             </span>
          ) : (
             <span className="bg-slate-700 text-slate-300 px-4 py-1.5 rounded-full text-sm font-bold">
               SIMULATING...
             </span>
          )}
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        
        <div className="lg:col-span-4 flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-120px)]">
          <h3 className="font-bold text-lg border-b pb-2">Big Board</h3>
          <PlayerBoard isUserTurn={isUserTurn} />
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-120px)]">
          <h3 className="font-bold text-lg border-b pb-2">Draft Tracker</h3>
          <DraftHistory isUserTurn={isUserTurn} />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-120px)]">
          <h3 className="font-bold text-lg border-b pb-2">Your War Room</h3>
          <TeamWarRoom />
        </div>

      </main>
    </div>
  );
}