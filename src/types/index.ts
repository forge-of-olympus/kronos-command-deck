export interface SubAgent {
  id: string
  name: string
  type: 'general' | 'coding' | 'research' | 'builder'
  status: 'idle' | 'working' | 'completed' | 'failed'
  lastTask?: string
  startedAt: string
}

export interface Command {
  id: string
  text: string
  targetAgentId?: string
  createdAt: string
  status: 'pending' | 'executing' | 'completed' | 'failed'
}

export interface StatusUpdate {
  id: string
  agentId: string
  message: string
  timestamp: string
  type: 'info' | 'success' | 'error' | 'warning'
}