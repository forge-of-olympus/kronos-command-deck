import { useState, useEffect, useRef } from 'react'
import { SubAgent, Command, StatusUpdate } from './types'

interface AgentDetail {
  id: string
  name: string
  type: 'general' | 'coding' | 'research' | 'builder' | 'writer' | 'analyst'
  status: 'idle' | 'working' | 'completed' | 'failed'
  parentId?: string
  lastTask?: string
  startedAt: string
  models: string[]
  capabilities: string[]
  completedTasks: number
  currentTaskProgress?: number
}

interface Message {
  id: string
  sender: 'user' | 'kratos'
  text: string
  timestamp: string
}

const generateModelPool = (type: string): string[] => {
  const modelPools: Record<string, string[]> = {
    general: ['gpt-4o', 'claude-3.5-sonnet', 'gemini-2.0-flash'],
    coding: ['gpt-4o', 'claude-3.5-sonnet', 'deepseek-coder'],
    research: ['gpt-4o', 'claude-3.5-sonnet', 'perplexity', 'gemini-2.0-flash'],
    builder: ['gpt-4o', 'claude-3.5-sonnet', 'stable-diffusion'],
    writer: ['gpt-4o', 'claude-3.5-sonnet', 'gemini-2.0-flash'],
    analyst: ['gpt-4o', 'claude-3.5-sonnet', 'python']
  }
  return modelPools[type] || modelPools.general
}

const generateCapabilities = (type: string): string[] => {
  const caps: Record<string, string[]> = {
    general: ['Task Delegation', 'Research', 'Planning', 'Communication'],
    coding: ['Code Generation', 'Debugging', 'Code Review', 'Refactoring'],
    research: ['Web Search', 'Data Analysis', 'Summarization', 'Fact Checking'],
    builder: ['UI Design', 'Frontend Dev', 'Backend Dev', 'Deployment'],
    writer: ['Content Creation', 'Copywriting', 'Editing', 'SEO'],
    analyst: ['Data Visualization', 'Reporting', 'Forecasting', 'Metrics']
  }
  return caps[type] || caps.general
}

const agentTypes: { type: SubAgent['type']; label: string; icon: string }[] = [
  { type: 'general', label: 'General', icon: '◎' },
  { type: 'coding', label: 'Coding', icon: '⌘' },
  { type: 'research', label: 'Research', icon: '◉' },
  { type: 'builder', label: 'Builder', icon: '⚡' },
  { type: 'writer', label: 'Writer', icon: '✎' },
  { type: 'analyst', label: 'Analyst', icon: '◈' }
]

const createAgent = (type: SubAgent['type'], parentId?: string, name?: string): AgentDetail => {
  const id = `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
  return {
    id,
    name: name || `${typeLabel}-${Math.floor(Math.random() * 900) + 100}`,
    type,
    status: 'idle',
    parentId,
    lastTask: undefined,
    startedAt: new Date().toISOString(),
    models: generateModelPool(type),
    capabilities: generateCapabilities(type),
    completedTasks: 0
  }
}

type View = 'hierarchy' | 'chat' | 'spawn' | 'tasks'

const kratosResponses: Record<string, string> = {
  'hello': 'Greetings, Commander. I am Kratos, your digital Spartan. 300 Spartans await your command.',
  'help': 'Available: spawn [type], deploy, build, research, status, delegate [task], hierarchy',
  'status': `Systems online. ${300} Spartans ready for deployment. Current active: ${0}.`,
  'spawn': 'I will spawn a new digital Spartan. Specify type: general, coding, research, builder, writer, or analyst.',
  'delegate': 'Task delegation initialized. Select agent(s) and assign the task.',
  'default': 'I receive your command, Commander. 300 Spartans stand ready. What are your orders?'
}

function getKratosResponse(input: string, activeCount: number): string {
  const lower = input.toLowerCase()
  if (lower.includes('status')) return `Systems online. 300 Spartans ready. ${activeCount} currently active.`
  if (lower.includes('hello')) return 'Greetings, Commander. 300 Spartans await your command.'
  if (lower.includes('help')) return 'Commands: spawn, deploy, build, research, status, delegate, hierarchy view.'
  if (lower.includes('spawn')) return 'I will spawn a new digital Spartan. Choose type from the Spawn panel.'
  if (lower.includes('delegate')) return 'Task delegation ready. Select agents and assign tasks in the Hierarchy view.'
  return kratosResponses.default
}

function App() {
  const [view, setView] = useState<View>('hierarchy')
  const [agents, setAgents] = useState<AgentDetail[]>([
    { ...createAgent('general', undefined, 'Athena'), status: 'working', lastTask: 'Coordinating Spartan forces', completedTasks: 47, currentTaskProgress: 65 },
    { ...createAgent('coding', undefined, 'Hephaestus'), status: 'working', lastTask: 'Building Kronos dashboard v2', completedTasks: 23, currentTaskProgress: 80 },
    { ...createAgent('research', undefined, 'Apollo'), status: 'idle', completedTasks: 89 },
    { ...createAgent('builder', undefined, 'Ares'), status: 'completed', lastTask: 'Deploy Olympus-OS to production', completedTasks: 156 }
  ])
  const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null)
  const [commands, setCommands] = useState<Command[]>([])
  const [statusFeed, setStatusFeed] = useState<StatusUpdate[]>([])
  const [commandInput, setCommandInput] = useState('')
  const [selectedAgentForCmd, setSelectedAgentForCmd] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'kratos', text: 'Greetings, Commander. 300 Spartans stand ready. Current active: 2. How shall we conquer?', timestamp: new Date().toISOString() }
  ])
  const [chatInput, setChatInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setStatusFeed([
      { id: '1', agentId: 'system', message: 'Kronos Hierarchy System initialized', timestamp: new Date().toISOString(), type: 'info' },
      { id: '2', agentId: 'system', message: '300 Digital Spartans ready for deployment', timestamp: new Date().toISOString(), type: 'success' },
      { id: '3', agentId: 'agent-athena', message: 'Athena coordinating forces', timestamp: new Date(Date.now() - 1000).toISOString(), type: 'info' }
    ])
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const activeAgents = agents.filter(a => a.status === 'working').length

  const handleSpawnAgent = (type: SubAgent['type'], parentId?: string) => {
    const newAgent = createAgent(type, parentId)
    setAgents(prev => [...prev, newAgent])
    setStatusFeed(prev => [
      { id: `status-${Date.now()}`, agentId: newAgent.id, message: `Spawned ${type} Spartan: ${newAgent.name}`, timestamp: new Date().toISOString(), type: 'success' },
      ...prev
    ])
  }

  const handleExecuteCommand = () => {
    if (!commandInput.trim()) return
    const newCommand: Command = {
      id: `cmd-${Date.now()}`,
      text: commandInput,
      targetAgentId: selectedAgentForCmd || undefined,
      createdAt: new Date().toISOString(),
      status: 'executing'
    }
    setCommands(prev => [...prev, newCommand])
    setStatusFeed(prev => [
      { id: `status-${Date.now()}`, agentId: selectedAgentForCmd || 'system', message: `Executing: ${commandInput}`, timestamp: new Date().toISOString(), type: 'info' },
      ...prev
    ])
    setTimeout(() => {
      setCommands(prev => prev.map(cmd => cmd.id === newCommand.id ? { ...cmd, status: 'completed' } : cmd))
      setStatusFeed(prev => [
        { id: `status-${Date.now()}`, agentId: selectedAgentForCmd || 'system', message: `Completed: ${commandInput}`, timestamp: new Date().toISOString(), type: 'success' },
        ...prev
      ])
    }, 1500)
    setCommandInput('')
  }

  const sendChatMessage = () => {
    if (!chatInput.trim()) return
    const userMessage: Message = { id: `msg-${Date.now()}`, sender: 'user', text: chatInput, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMessage])
    setTimeout(() => {
      const kratosMessage: Message = { id: `msg-${Date.now() + 1}`, sender: 'kratos', text: getKratosResponse(chatInput, activeAgents), timestamp: new Date().toISOString() }
      setMessages(prev => [...prev, kratosMessage])
    }, 800)
    setChatInput('')
  }

  const getChildAgents = (parentId: string) => agents.filter(a => a.parentId === parentId)

  const renderHierarchyNode = (agent: AgentDetail, level: number = 0) => {
    const children = getChildAgents(agent.id)
    return (
      <div key={agent.id} className="hierarchy-node-wrapper" style={{ marginLeft: level * 40 }}>
        <div 
          className={`hierarchy-node ${agent.status} ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
          onClick={() => setSelectedAgent(agent)}
        >
          <div className="node-connector" style={{ left: -24 }}></div>
          <div className="node-icon">{agent.type === 'general' ? '◎' : agent.type === 'coding' ? '⌘' : agent.type === 'research' ? '◉' : agent.type === 'builder' ? '⚡' : agent.type === 'writer' ? '✎' : '◈'}</div>
          <div className="node-info">
            <span className="node-name">{agent.name}</span>
            <span className={`node-status ${agent.status}`}>{agent.status}</span>
          </div>
          <div className="node-stats">
            <span className="tasks-count">{agent.completedTasks} tasks</span>
            {agent.currentTaskProgress && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${agent.currentTaskProgress}%` }}></div>
              </div>
            )}
          </div>
          {level < 2 && (
            <button className="spawn-child-btn" onClick={(e) => { e.stopPropagation(); handleSpawnAgent('general', agent.id) }}>+</button>
          )}
        </div>
        {children.length > 0 && (
          <div className="hierarchy-children">
            {children.map(child => renderHierarchyNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const renderAgentDetail = () => {
    if (!selectedAgent) return null
    return (
      <div className="agent-detail-panel">
        <div className="detail-header">
          <div className="detail-icon">{selectedAgent.type === 'general' ? '◎' : selectedAgent.type === 'coding' ? '⌘' : selectedAgent.type === 'research' ? '◉' : selectedAgent.type === 'builder' ? '⚡' : selectedAgent.type === 'writer' ? '✎' : '◈'}</div>
          <div className="detail-title">
            <h3>{selectedAgent.name}</h3>
            <span className={`status-badge ${selectedAgent.status}`}>{selectedAgent.status}</span>
          </div>
          <button className="close-detail" onClick={() => setSelectedAgent(null)}>×</button>
        </div>
        
        <div className="detail-section">
          <h4>Current Task</h4>
          <p>{selectedAgent.lastTask || 'No active task'}</p>
          {selectedAgent.currentTaskProgress && (
            <div className="progress-bar large">
              <div className="progress-fill" style={{ width: `${selectedAgent.currentTaskProgress}%` }}></div>
              <span className="progress-label">{selectedAgent.currentTaskProgress}%</span>
            </div>
          )}
        </div>

        <div className="detail-section">
          <h4>Connected Models</h4>
          <div className="model-tags">
            {selectedAgent.models.map(model => (
              <span key={model} className="model-tag">{model}</span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h4>Capabilities</h4>
          <div className="capability-tags">
            {selectedAgent.capabilities.map(cap => (
              <span key={cap} className="capability-tag">{cap}</span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h4>Statistics</h4>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-value">{selectedAgent.completedTasks}</span>
              <span className="stat-label">Tasks Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{getChildAgents(selectedAgent.id).length}</span>
              <span className="stat-label">Sub-Agents</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{new Date(selectedAgent.startedAt).toLocaleDateString()}</span>
              <span className="stat-label">Started</span>
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <button className="action-btn primary">Assign Task</button>
          <button className="action-btn">Delegate</button>
          <button className="action-btn danger">Terminate</button>
        </div>
      </div>
    )
  }

  const renderSpawnPanel = () => (
    <section className="spawn-panel">
      <h2>Spawn Digital Spartans</h2>
      <div className="spawn-stats">
        <div className="stat-card">
          <span className="stat-number">{300 - agents.length}</span>
          <span className="stat-label">Available</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{agents.length}</span>
          <span className="stat-label">Spawned</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{activeAgents}</span>
          <span className="stat-label">Active</span>
        </div>
      </div>
      
      <div className="spawn-type-grid">
        {agentTypes.map(({ type, label, icon }) => (
          <div key={type} className="spawn-type-card" onClick={() => handleSpawnAgent(type)}>
            <span className="type-icon">{icon}</span>
            <span className="type-label">{label}</span>
            <span className="type-action">Spawn</span>
          </div>
        ))}
      </div>

      <div className="quick-spawn">
        <h3>Quick Spawn (Batch)</h3>
        <div className="batch-buttons">
          <button onClick={() => Array(10).fill(null).forEach(() => handleSpawnAgent('general'))}>+10 General</button>
          <button onClick={() => Array(25).fill(null).forEach(() => handleSpawnAgent('coding'))}>+25 Coding</button>
          <button onClick={() => Array(50).fill(null).forEach(() => handleSpawnAgent('research'))}>+50 Research</button>
          <button onClick={() => Array(100).fill(null).forEach(() => handleSpawnAgent('general'))}>+100 Sprint</button>
        </div>
      </div>
    </section>
  )

  const renderTasksPanel = () => (
    <section className="tasks-panel">
      <h2>Task Delegation Queue</h2>
      <div className="delegation-form">
        <select className="agent-select" value={selectedAgentForCmd} onChange={(e) => setSelectedAgentForCmd(e.target.value)}>
          <option value="">Select Agent(s)</option>
          {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
        </select>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Describe task to delegate..."
          className="task-input"
        />
        <button onClick={handleExecuteCommand} className="delegate-btn">Delegate</button>
      </div>
      
      <div className="task-queue">
        <h3>Active Tasks</h3>
        {commands.length === 0 ? <div className="empty-state">No tasks in queue</div> : (
          commands.slice(-10).reverse().map(cmd => (
            <div key={cmd.id} className={`task-item ${cmd.status}`}>
              <div className="task-info">
                <span className="task-desc">{cmd.text}</span>
                <span className="task-agent">{agents.find(a => a.id === cmd.targetAgentId)?.name || 'All Agents'}</span>
              </div>
              <span className={`task-status ${cmd.status}`}>{cmd.status}</span>
            </div>
          ))
        )}
      </div>
    </section>
  )

  const renderChat = () => (
    <section className="chat-panel">
      <h2>⚔️ Chat with Kratos</h2>
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            <div className="message-avatar">{msg.sender === 'kratos' ? '🪓' : '👤'}</div>
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
        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()} placeholder="Message Kratos..." className="chat-input" />
        <button onClick={sendChatMessage} className="chat-send-btn">Send</button>
      </div>
      <div className="quick-commands">
        <span className="quick-label">Quick:</span>
        {['Hello', 'Status', 'Spawn', 'Help'].map(cmd => <button key={cmd} onClick={() => { setChatInput(cmd); sendChatMessage() }}>{cmd}</button>)}
      </div>
    </section>
  )

  const navItems = [
    { id: 'hierarchy', label: 'Hierarchy', icon: '⬡' },
    { id: 'spawn', label: 'Spawn', icon: '⚡' },
    { id: 'tasks', label: 'Tasks', icon: '◎' },
    { id: 'chat', label: 'Chat', icon: '⚔' }
  ]

  const rootAgents = agents.filter(a => !a.parentId)

  return (
    <div className="kronos-dashboard">
      <aside 
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="sidebar-header">
          <h1>⚔️</h1>
          <span className="sidebar-title">KRONOS</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => setView(item.id as View)}>
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
          <div className="version">v2.0.0</div>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="kronos-header">
          <div className="header-title">
            <h1>KRONOS</h1>
            <span className="subtitle">Command Hierarchy • {activeAgents} Active Spartans</span>
          </div>
          <div className="header-stats">
            <div className="header-stat">
              <span className="stat-label">Total Spartans</span>
              <span className="stat-value">{agents.length}</span>
            </div>
            <div className="header-stat">
              <span className="stat-label">Available</span>
              <span className="stat-value">{300 - agents.length}</span>
            </div>
          </div>
        </header>

        <main className="kronos-main">
          {view === 'hierarchy' && (
            <>
              <section className="hierarchy-panel">
                <h2>Command Hierarchy</h2>
                <div className="hierarchy-tree">
                  <div className="kratos-root">
                    <div className="root-icon">🪓</div>
                    <div className="root-info">
                      <span className="root-name">KRATOS</span>
                      <span className="root-label">Commander</span>
                    </div>
                  </div>
                  <div className="hierarchy-connections">
                    {rootAgents.map(agent => renderHierarchyNode(agent))}
                  </div>
                </div>
              </section>
              {renderAgentDetail()}
            </>
          )}
          {view === 'spawn' && renderSpawnPanel()}
          {view === 'tasks' && renderTasksPanel()}
          {view === 'chat' && renderChat()}
        </main>
      </div>
    </div>
  )
}

export default App