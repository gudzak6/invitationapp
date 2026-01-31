export type GameType =
  | "fishing"
  | "scratch"
  | "pour"
  | "lockpick"
  | "wheel"
  | "memory";

export type Invite = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  message: string | null;
  game_type: GameType;
  game_config: Record<string, unknown>;
  published: boolean;
  creator_token?: string;
  created_at?: string;
};
