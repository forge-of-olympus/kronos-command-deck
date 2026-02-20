import { useState, useEffect, useRef } from 'react'
import { SubAgent, Command, StatusUpdate } from './types'

interface Message {
  id: string
  sender: 'user' | 'kratos'
  text: string
  timestamp: string
}

const initialAgents: SubAgent[] = [
  { id: 'agent-1', name: 'Athena', type: 'general', status: 'idle', startedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'agent-2', name: 'Hephaestus', type: 'coding', status: 'working', lastTask: 'Building Kronos dashboard', startedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'agent-3', name: 'Apollo', type: 'research', status: 'idle', startedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'agent-4', name: 'Ares', type: 'builder', status: 'completed', lastTask: 'Deploy Olympus-OS', startedAt: new Date(Date.now() - 86400000).toISOString() }
]

type View = 'dashboard' | 'chat' | 'agents' | 'tasks'

const kratosResponses: Record<string, string> = {
  'hello': 'Greetings, Commander. I am Kratos, ready to execute your will.',
  'help': 'Available commands: spawn agent, deploy, build, research, status, or any task you need completed.',
  'status': 'All systems operational. Kronos Command Deck is live and ready.',
  'deploy': 'I will deploy the specified project to production. Which project should I deploy?',
  'build': 'Initiating build sequence. What project needs compilation?',
  'spawn': 'I will spawn a new sub-agent. Specify the type: general, coding, research, or builder.',
  'default': 'I receive your command, Commander. Executing now. What specific task would you like me to perform?'
}

function getKratosResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const [key, response] of Object.entries(kratosResponses)) {
    if (lower.includes(key)) return response
  }
  return kratosResponses.default
}

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [agents, setAgents] = useState<SubAgent[]>(initialAgents)
  const [commands, setCommands] = useState<Command[]>([])
  const [statusFeed, setStatusFeed] = useState<StatusUpdate[]>([])
  const [commandInput, setCommandInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'kratos', text: 'Greetings, Commander. I am Kratos, your digital Spartan. How may I serve you?', timestamp: new Date().toISOString() }
  ])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setStatusFeed([
      { id: '1', agentId: 'system', message: 'Kronos Command Deck initialized', timestamp: new Date().toISOString(), type: 'info' },
      { id: '2', agentId: 'agent-2', message: 'Hephaestus is building the dashboard', timestamp: new Date(Date.now() - 1000).toISOString(), type: 'success' }
    ])
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  const sendChatMessage = () => {
    if (!chatInput.trim()) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    
    setTimeout(() => {
      const kratosMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'kratos',
        text: getKratosResponse(chatInput),
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, kratosMessage])
    }, 800)

    setChatInput('')
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⌖' },
    { id: 'chat', label: 'Chat with Kratos', icon: '⚔' },
    { id: 'agents', label: 'Sub-Agents', icon: '◈' },
    { id: 'tasks', label: 'Task Queue', icon: '◎' }
  ]

  const renderDashboard = () => (
    <>
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
    </>
  )

  const renderChat = () => (
    <section className="chat-panel">
      <h2>⚔️ Chat with Kratos</h2>
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === 'kratos' ? '🪓' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">{msg.sender === 'kratos' ? 'Kratos' : 'Commander'}</span>
                <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
          placeholder="Message Kratos..."
          className="chat-input"
        />
        <button onClick={sendChatMessage} className="chat-send-btn">
          Send
        </button>
      </div>
      <div className="quick-commands">
        <span className="quick-label">Quick:</span>
        {['Hello', 'Status', 'Help', 'Deploy'].map(cmd => (
          <button key={cmd} onClick={() => { setChatInput(cmd); sendChatMessage() }}>{cmd}</button>
        ))}
      </div>
    </section>
  )

  const renderAgents = () => (
    <section className="agents-full-panel">
      <h2>All Sub-Agents</h2>
      <div className="agents-list">
        {agents.map(agent => (
          <div key={agent.id} className={`agent-row ${agent.status}`}>
            <div className="agent-info">
              <span className="agent-name">{agent.name}</span>
              <span className="agent-type">{agent.type}</span>
            </div>
            <div className="agent-status">
              <span className={`status-badge ${agent.status}`}>{agent.status}</span>
            </div>
            <div className="agent-task">{agent.lastTask || 'No active task'}</div>
            <div className="agent-actions">
              <button>Assign</button>
              <button>Terminate</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )

  const renderTasks = () => (
    <section className="tasks-panel">
      <h2>Task Queue</h2>
      <div className="tasks-list">
        <div className="task-item completed">
          <span className="task-name">Initialize Kronos Command Deck</span>
          <span className="task-status">Completed</span>
        </div>
        <div className="task-item in-progress">
          <span className="task-name">Deploy to production</span>
          <span className="task-status">In Progress</span>
        </div>
        <div className="task-item pending">
          <span className="task-name">Add sidebar navigation</span>
          <span className="task-status">Pending</span>
        </div>
        <div className="task-item pending">
          <span className="task-name">Integrate Kratos chat</span>
          <span className="task-status">Pending</span>
        </div>
      </div>
    </section>
  )

  return (
    <div className="kronos-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>⚔️</h1>
          <span className="sidebar-title">KRONOS</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button 
              key={item.id} 
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => setView(item.id as View)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot"></span>
            <span>Systems Online</span>
          </div>
          <div className="version">v1.0.0</div>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="kronos-header">
          <div className="header-title">
            <h1>KRONOS</h1>
            <span className="subtitle">Command Deck</span>
          </div>
          <div className="header-actions">
            <button className="header-btn">Notifications</button>
            <button className="header-btn">Settings</button>
          </div>
        </header>

        <main className="kronos-main">
          {view === 'dashboard' && renderDashboard()}
          {view === 'chat' && renderChat()}
          {view === 'agents' && renderAgents()}
          {view === 'tasks' && renderTasks()}
        </main>
      </div>
    </div>
  )
}

export default App