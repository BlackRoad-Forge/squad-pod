export interface SquadTeamMember {
  name: string;        // e.g. "Homer Simpson"
  slug: string;        // e.g. "homer-simpson" (directory name)
  role: string;        // e.g. "Lead"
  status: string;      // e.g. "✅ Active", "📋 Silent", "🔄 Monitor"
  charterPath: string; // e.g. ".squad/agents/homer-simpson/charter.md"
}

export interface SquadAgentState {
  id: string;                    // agent slug (e.g. "homer-simpson")
  name: string;                  // display name (e.g. "Homer Simpson")
  role: string;                  // e.g. "Lead"
  paletteIndex: number;          // character sprite palette index
  seatId: string | null;         // assigned seat in office
  status: 'active' | 'idle' | 'waiting'; // current activity
  currentTask: string | null;    // what they're working on
  lastActiveAt: number;          // timestamp of last activity
}

export interface SquadSession {
  id: string;
  createdAt: string;
  lastActiveAt: string;
  agent?: string;        // agent slug if identifiable
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
}

export interface AgentDetailInfo {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'waiting';
  currentTask: string | null;
  charterSummary: string | null;  // first 2-3 sentences from charter.md
  recentActivity: string[];        // last 3-5 log entries mentioning this agent
  lastActiveAt: number;
}

export interface PersistedAgentMeta {
  [agentId: string]: {
    palette?: number;
    seatId?: string;
  };
}

export interface SpriteData {
  width: number;
  height: number;
  pixels: number[];
}

export interface FurnitureAsset {
  name: string;
  sprite: SpriteData;
}

export interface FloorColor {
  h: number;
  s: number;
  b: number;
  c: number;
  colorize?: boolean;
}

export interface PlacedFurniture {
  uid: string;
  type: string;
  col: number;
  row: number;
  rotation: number;
  color?: FloorColor;
  state?: string;
}

export interface LayoutData {
  version?: number;
  cols: number;
  rows: number;
  tiles: number[];
  furniture: PlacedFurniture[];
  tileColors?: Record<string, FloorColor>;
}

export interface CharacterSpriteSet {
  paletteIndex: number;
  directions: {
    [direction: string]: {
      idle: SpriteData[];
      walk: SpriteData[];
    };
  };
}

export type TelemetryCategory = 'status' | 'session' | 'log' | 'orchestration';

export interface TelemetryEvent {
  id: string;
  timestamp: number;
  category: TelemetryCategory;
  agentId: string | null;
  agentName: string | null;
  summary: string;
  detail: string | null;
}

export interface WebviewMessage {
  type: string;
  [key: string]: unknown;
}

export interface AgentCreatedMessage {
  type: 'agentCreated';
  agent: {
    id: string;
    name: string;
    role: string;
    paletteIndex: number;
  };
}

export interface AgentStatusMessage {
  type: 'agentStatus';
  agentId: string;
  status: 'active' | 'idle' | 'waiting';
}

export interface AgentToolStartMessage {
  type: 'agentToolStart';
  agentId: string;
  tool: string;
}

export interface AgentToolDoneMessage {
  type: 'agentToolDone';
  agentId: string;
}

export interface ExistingAgentsMessage {
  type: 'existingAgents';
  agents: Array<{
    id: string;
    name: string;
    role: string;
    paletteIndex: number;
    seatId: string | null;
    status: 'active' | 'idle' | 'waiting';
    currentTask: string | null;
  }>;
}

export interface SquadInfoData {
  teamName: string | null;
  description: string | null;
  members: Array<{
    name: string;
    role: string;
    status: string;
    isActive: boolean;
    currentTask: string | null;
  }>;
  hiddenMembers: Array<{ name: string; role: string; status: string }>;
  projectContext: string | null;
  totalAgents: number;
  activeAgents: number;
}

export type OutboundMessage =
  | AgentCreatedMessage
  | AgentStatusMessage
  | AgentToolStartMessage
  | AgentToolDoneMessage
  | ExistingAgentsMessage
  | { type: 'agentClosed'; agentId: string }
  | { type: 'agentToolsClear'; agentId: string }
  | { type: 'agentToolPermission'; agentId: string; tool: string }
  | { type: 'layoutLoaded'; layout: LayoutData }
  | { type: 'characterSpritesLoaded'; sprites: CharacterSpriteSet[] }
  | { type: 'floorTilesLoaded'; tiles: SpriteData[] }
  | { type: 'wallTilesLoaded'; tiles: SpriteData[] }
  | { type: 'furnitureLoaded'; furniture: FurnitureAsset[] }
  | { type: 'soundEnabled'; enabled: boolean }
  | { type: 'agentDetailLoaded'; detail: AgentDetailInfo }
  | { type: 'squadInfoLoaded'; info: SquadInfoData }
  | { type: 'telemetryEvent'; event: TelemetryEvent }
  | { type: 'noWorkspace' };
