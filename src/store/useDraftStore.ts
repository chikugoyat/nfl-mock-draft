
import { create } from 'zustand';
import playersData from '@/data/players.json';
import teamsData from '@/data/teams.json';

export type Player = {
  id: string;
  rank: number;
  name: string;
  position: string;
  college: string;
  description: string;
};

export type Team = {
  id: number;
  name: string;
  needs: string[];
  context: string;
};

export type DraftPick = {
  round: number;
  pickNumber: number;
  team: Team;
  player: Player;
  reasoning?: string;
};

interface DraftState {
  userTeamId: number | null;
  currentRound: number;
  currentPickIndex: number; // 0 to 6
  availablePlayers: Player[];
  draftHistory: DraftPick[];
  isDraftComplete: boolean;
  isAIPicking: boolean;
  
  // Actions
  setUserTeam: (id: number) => void;
  draftPlayer: (player: Player, reasoning?: string) => void;
  setAIPicking: (status: boolean) => void;
  resetDraft: () => void;
}

export const useDraftStore = create<DraftState>((set) => ({
  userTeamId: null,
  currentRound: 1,
  currentPickIndex: 0,
  availablePlayers: playersData as Player[],
  draftHistory: [],
  isDraftComplete: false,
  isAIPicking: false,

  setUserTeam: (id) => set({ userTeamId: id }),

  setAIPicking: (status) => set({ isAIPicking: status }),

  draftPlayer: (player, reasoning = "User selected player.") => 
    set((state) => {
      const currentTeam = teamsData[state.currentPickIndex];
      
      const newPick: DraftPick = {
        round: state.currentRound,
        pickNumber: state.currentPickIndex + 1,
        team: currentTeam,
        player,
        reasoning
      };

      const newHistory = [...state.draftHistory, newPick];
      const newAvailable = state.availablePlayers.filter(p => p.id !== player.id);
      
      let nextPickIndex = state.currentPickIndex + 1;
      let nextRound = state.currentRound;
      let complete = false;

      // Logic to advance the pick order (1-7, 4 rounds)
      if (nextPickIndex >= teamsData.length) {
        nextPickIndex = 0;
        nextRound += 1;
      }

      if (nextRound > 4) {
        complete = true;
      }

      return {
        draftHistory: newHistory,
        availablePlayers: newAvailable,
        currentPickIndex: complete ? state.currentPickIndex : nextPickIndex,
        currentRound: complete ? state.currentRound : nextRound,
        isDraftComplete: complete,
      };
    }),

  resetDraft: () => set({
    userTeamId: null,
    currentRound: 1,
    currentPickIndex: 0,
    availablePlayers: playersData as Player[],
    draftHistory: [],
    isDraftComplete: false,
    isAIPicking: false,
  })
}));