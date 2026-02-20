import { useState, useEffect } from 'react'
import { SubAgent, Command, StatusUpdate } from './types'

const initialAgents: SubAgent[] = [
  { id: 'agent-1', name: 'Athena', type: 'general', status: 'idle', startedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'agent-2', name: 'Hephaestus', type: 'coding', status: 'working', lastTask: 'Building Kronos dashboard', startedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'agent-3', name: 'Apollo', type: 'research', status: 'idle', startedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'agent-4', name: 'Ares', type: 'builder', status: 'completed', lastTask: 'Deploy Olympus-OS', startedAt: new Date(Date.now() - 86400000).toISOString() }
]

function App() {
  const [agents, setAgents] = useState<SubAgent[]>(initialAgents)
  const [commands, setCommands] = useState<Command[]>([])
  const [statusFeed, setStatusFeed] = useState<StatusUpdate[]>([])
  const [commandInput, setCommandInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string>('')

  useEffect(() => {
    setStatusFeed([
      { id: '1', agentId: 'system', message: 'Kronos Command Deck initialized', timestamp: new Date().toISOString(), type: 'info' },
      { id: '2', agentId: 'agent-2', message: 'Hephaestus is building the dashboard', timestamp: new Date(Date.now() - 1000).toISOString(), type: 'success' }
    ])
  }, [])

  const handleExecuteCommand = () => {
    if (!commandInput.trim()) return

    const newCommand: Command = {
      id: `cmd-${Date.now()}`,
      text: commandInput,
      targetAgentId: selectedAgent || undefined,
      createdAt: new Date().toISOString(),
      status: 'executing'
    }

    setCommands(prev => [...prev, newCommand])
    setStatusFeed(prev => [
      { id: `status-${Date.now()}`, agentId: selectedAgent || 'system', message: `Executing: ${commandInput}`, timestamp: new Date().toISOString(), type: 'info' },
      ...prev
    ])

    setTimeout(() => {
      setCommands(prev => prev.map(cmd => 
        cmd.id === newCommand.id ? { ...cmd, status: 'completed' } : cmd
      ))
      setStatusFeed(prev => [
        { id: `status-${Date.now()}`, agentId: selectedAgent || 'system', message: `Completed: ${commandInput}`, timestamp: new Date().toISOString(), type: 'success' },
        ...prev
      ])
    }, 1500)

    setCommandInput('')
  }

  const spawnAgent = (type: SubAgent['type']) => {
    const newAgent: SubAgent = {
      id: `agent-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}-${Math.floor(Math.random() * 100)}`,
      type,
      status: 'idle',
      startedAt: new Date().toISOString()
    }
    setAgents(prev => [...prev, newAgent])
    setStatusFeed(prev => [
      { id: `status-${Date.now()}`, agentId: newAgent.id, message: `Spawned new ${type} agent: ${newAgent.name}`, timestamp: new Date().toISOString(), type: 'success' },
      ...prev
    ])
  }

  return (
    <div className="kronos-dashboard">
      <header className="kronos-header">
        <h1>⚔️ KRONOS</h1>
        <span className="subtitle">Command Deck</span>
      </header>

      <main className="kronos-main">
        <section className="agents-panel">
          <h2>Sub-Agents</h2>
          <div className="agent-grid">
            {agents.map(agent => (
              <div key={agent.id} className={`agent-card ${agent.status}`}>
                <div className="agent-header">
                  <span className="agent-name">{agent.name}</span>
                  <span className={`status-badge ${agent.status}`}>{agent.status}</span>
                </div>
                <div className="agent-type">{agent.type}</div>
                <div className="agent-task">{agent.lastTask || 'No active task'}</div>
                <div className="agent-started">Started: {new Date(agent.startedAt).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
          
          <div className="spawn-controls">
            <h3>Spawn New Agent</h3>
            <div className="spawn-buttons">
              <button onClick={() => spawnAgent('general')}>General</button>
              <button onClick={() => spawnAgent('coding')}>Coding</button>
              <button onClick={() => spawnAgent('research')}>Research</button>
              <button onClick={() => spawnAgent('builder')}>Builder</button>
            </div>
          </div>
        </section>

        <section className="command-panel">
          <h2>Command Center</h2>
          <div className="command-input-area">
            <select 
              value={selectedAgent} 
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="agent-select"
            >
              <option value="">All Agents (Broadcast)</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleExecuteCommand()}
              placeholder="Enter command..."
              className="command-input"
            />
            <button onClick={handleExecuteCommand} className="execute-btn">
              Execute
            </button>
          </div>

          <div className="command-queue">
            <h3>Command Queue</h3>
            {commands.length === 0 ? (
              <div className="empty-state">No commands queued</div>
            ) : (
              commands.slice(-5).reverse().map(cmd => (
                <div key={cmd.id} className={`command-item ${cmd.status}`}>
                  <span className="cmd-text">{cmd.text}</span>
                  <span className="cmd-status">{cmd.status}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="status-panel">
          <h2>Status Feed</h2>
          <div className="status-feed">
            {statusFeed.map(update => (
              <div key={update.id} className={`status-item ${update.type}`}>
                <span className="status-time">{new Date(update.timestamp).toLocaleTimeString()}</span>
                <span className="status-message">{update.message}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App