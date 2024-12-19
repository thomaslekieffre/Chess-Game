export type CustomPiece = {
  id: string;
  user_id: string;
  name: string;
  symbol: string;
  movement_rules: {
    moves: Array<{
      x: number;
      y: number;
      repeatable?: boolean;
    }>;
  };
  is_validated: boolean;
  created_at: string;
  updated_at: string;
};

export type Game = {
  id: string;
  white_player_id: string;
  black_player_id: string;
  game_type: "classic" | "custom" | "competitive";
  game_state: {
    board: Array<Array<string | null>>;
    current_turn: "white" | "black";
    moves_history: Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
    }>;
  };
  winner_id?: string;
  created_at: string;
  updated_at: string;
};

export type PieceValidation = {
  id: string;
  piece_id: string;
  voter_id: string;
  vote: boolean;
  created_at: string;
};
