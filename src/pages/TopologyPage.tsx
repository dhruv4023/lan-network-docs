import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import type { TopologyNode, DeviceType } from '../types'

interface DragState {
  nodeId: string
  startX: number
  startY: number
  nodeStartX: number
  nodeStartY: number
}

function getTypeColor(type: DeviceType | 'switch' | 'access-point'): string {
  const colors: Record<string, string> = { router: '#54e0c2', switch: '#f2b340', printer: '#9f8aff', laptop: '#54e0c2', desktop: '#ef6461', 'access-point': '#54e0c2' }
  return colors[type] || '#8da0b3'
}

const DEVICE_SVGS: Record<string, string> = {
  router: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0',
  switch: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
  printer: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
  laptop: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11a3.001 3.001 0 00-2.83 2',
  'access-point': 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0',
}

export default function TopologyPage() {
  const devices = useStore(s => s.devices)
  const topology = useStore(s => s.topology)
  const updateTopology = useStore(s => s.updateTopology)
  const connectDevices = useStore(s => s.connectDevices)
  const router = useStore(s => s.router)
  const simulateAction = useStore(s => s.simulateAction)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null)

  const routerNode: TopologyNode = {
    id: 'router-node', deviceId: '',
    x: 400, y: 50,
    connections: topology.filter(n => n.connections.length > 0).map(n => n.id),
  }

  const nodeMap = new Map(topology.map(n => [n.id, n]))
  const deviceMap = new Map(devices.map(d => [d.id, d]))

  const handleMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    if (e.button !== 0 || contextMenu) return
    const node = nodeMap.get(nodeId)
    if (!node) return
    setDragState({
      nodeId, startX: e.clientX, startY: e.clientY,
      nodeStartX: node.x, nodeStartY: node.y,
    })
    setSelectedNode(nodeId)
  }, [topology, contextMenu])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState) return
    const dx = (e.clientX - dragState.startX) / zoom
    const dy = (e.clientY - dragState.startY) / zoom
    const newNodes = topology.map(n =>
      n.id === dragState.nodeId
        ? { ...n, x: Math.max(20, Math.min(780, dragState.nodeStartX + dx)), y: Math.max(20, Math.min(480, dragState.nodeStartY + dy)) }
        : n
    )
    updateTopology(newNodes)
  }, [dragState, topology, updateTopology, zoom])

  const handleMouseUp = useCallback(() => setDragState(null), [])

  function handleNodeClick(nodeId: string) {
    if (connecting) {
      if (connecting !== nodeId) connectDevices(connecting, nodeId)
      setConnecting(null)
    } else {
      setSelectedNode(nodeId === selectedNode ? null : nodeId)
    }
  }

  function handleContextMenu(nodeId: string, e: React.MouseEvent) {
    e.preventDefault()
    setContextMenu({ nodeId, x: e.clientX, y: e.clientY })
  }

  const selectedDevice = selectedNode
    ? devices.find(d => d.id === nodeMap.get(selectedNode)?.deviceId)
    : null

  const ctxDev = contextMenu
    ? devices.find(d => d.id === nodeMap.get(contextMenu.nodeId)?.deviceId)
    : null

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>Network Topology</h1>
          <p>Drag to move &middot; Click to select &middot; Click two nodes to connect</p>
        </div>
        <div className="topo-toolbar">
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))}>Zoom +</button>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>Zoom -</button>
          <button onClick={() => setZoom(1)}>Reset</button>
          <button
            onClick={() => setConnecting(connecting ? null : 'mode')}
            className={connecting ? 'active' : ''}
          >
            {connecting ? 'Cancel' : 'Connect'}
          </button>
        </div>
      </div>

      <div
        className="glass rounded-xl p-4 relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => { setContextMenu(null); if (!connecting) setSelectedNode(null) }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 800 500"
          className="w-full h-auto transition-transform duration-150"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', minHeight: '400px' }}
        >
          <defs>
            <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4">
              <circle cx="5" cy="5" r="3" fill="#223040" />
            </marker>
          </defs>

          {topology.map(node =>
            node.connections.map(targetId => {
              const target = nodeMap.get(targetId)
              if (!target) return null
              const dev = devices.find(d => d.id === node.deviceId)
              const isOnline = dev?.online
              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={node.x} y1={node.y}
                  x2={target.x} y2={target.y}
                  stroke={isOnline ? '#54e0c2' : '#223040'}
                  strokeWidth={isOnline ? 2 : 1.5}
                  strokeOpacity={isOnline ? 0.6 : 0.3}
                  className="transition-all duration-300"
                />
              )
            })
          )}

          {connecting && dragState === null && (() => {
            const src = nodeMap.get(connecting === 'mode' ? (selectedNode || topology[0]?.id) : connecting)
            if (!src) return null
            return (
              <line
                x1={src.x} y1={src.y}
                x2={src.x + 60} y2={src.y + 60}
                stroke="#54e0c2" strokeWidth={2} strokeDasharray="5,5" strokeOpacity={0.7}
              />
            )
          })()}

          <g>
            <rect x={routerNode.x - 60} y={routerNode.y - 20} width={120} height={40} rx={10} fill="#1e463f" stroke="#54e0c2" strokeWidth={2} />
            <text x={routerNode.x} y={routerNode.y - 2} textAnchor="middle" fill="#e8eef4" fontSize={12} fontWeight={600}>{router.name}</text>
            <text x={routerNode.x} y={routerNode.y + 14} textAnchor="middle" fill="#8da0b3" fontSize={10}>{router.lanIp}</text>
            <circle cx={routerNode.x + 55} cy={routerNode.y - 12} r={4} fill="#54e0c2" className="pulse-glow" />
          </g>

          {topology.map(node => {
            const dev = devices.find(d => d.id === node.deviceId)
            if (!dev) return null
            const isSelected = selectedNode === node.id
            const isConnecting = connecting === node.id
            const conflict = devices.some(d => d.id !== dev.id && d.ip === dev.ip)
            const color = getTypeColor(dev.type)

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseDown={e => handleMouseDown(node.id, e)}
                onClick={e => { e.stopPropagation(); handleNodeClick(node.id) }}
                onContextMenu={e => handleContextMenu(node.id, e)}
              >
                <rect
                  x={node.x - 55} y={node.y - 22}
                  width={110} height={44} rx={10}
                  fill={conflict ? '#4a2222' : '#161f2a'}
                  stroke={
                    isConnecting ? '#54e0c2' :
                    isSelected ? '#54e0c2' :
                    conflict ? '#ef6461' :
                    dev.online ? '#223040' : '#4a2222'
                  }
                  strokeWidth={isSelected || isConnecting ? 2.5 : 1.5}
                  className="transition-all duration-100"
                />
                <circle cx={node.x - 42} cy={node.y - 12} r={3} fill={dev.online ? '#54e0c2' : '#ef6461'} />
                <svg x={node.x - 42} y={node.y - 10} width={14} height={14} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={DEVICE_SVGS[dev.type] || DEVICE_SVGS.laptop} />
                </svg>
                <text x={node.x} y={node.y - 5} textAnchor="middle" fill="#e8eef4" fontSize={11} fontWeight={600}>{dev.name}</text>
                <text x={node.x} y={node.y + 12} textAnchor="middle" fill="#8da0b3" fontSize={9}>{dev.ip}</text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {selectedDevice && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedDevice.online ? 'bg-accent-dim/60' : 'bg-danger-dim/60'}`}>
                <svg className={`w-5 h-5 ${selectedDevice.online ? 'text-accent' : 'text-danger'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={DEVICE_SVGS[selectedDevice.type] || DEVICE_SVGS.laptop} />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold mt-0">{selectedDevice.name}</h2>
                <p className="text-muted text-xs capitalize">{selectedDevice.type.replace('-', ' ')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ['MAC', selectedDevice.mac],
                ['IP', selectedDevice.ip],
                ['Mode', selectedDevice.ipMode.toUpperCase()],
                ['Connection', selectedDevice.connectionType],
                ['Gateway', selectedDevice.gateway],
                ['Firmware', selectedDevice.firmware || 'N/A'],
              ].map(([l, v]) => (
                <div key={l as string}>
                  <span className="text-muted block">{l as string}</span>
                  <code className="text-xs">{v as string}</code>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedDevice && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="panel"
          >
            <h2 className="text-base font-semibold mt-0 mb-3">Actions</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => simulateAction('disconnect', selectedDevice.id)} className="btn btn-ghost text-xs">
                Disconnect
              </button>
              <button onClick={() => simulateAction('reconnect', selectedDevice.id)} className="btn btn-ghost text-xs">
                Reconnect
              </button>
              <button onClick={() => simulateAction('restart-printer', selectedDevice.id)} className="btn btn-ghost text-xs">
                Restart
              </button>
              <button onClick={() => simulateAction('ip-conflict', selectedDevice.id)} className="btn btn-ghost text-xs">
                IP Conflict
              </button>
              <button onClick={() => simulateAction('simulate-unreachable', selectedDevice.id)} className="btn btn-danger text-xs">
                Ping Fail
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {contextMenu && ctxDev && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-50 glass-strong rounded-xl p-2 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <p className="text-xs font-semibold px-3 py-1.5 text-muted">{ctxDev.name}</p>
            <div className="h-px bg-line/60 my-1" />
            <button onClick={() => { simulateAction('disconnect', ctxDev.id); setContextMenu(null) }} className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-panel-2/60 text-fg cursor-pointer">Disconnect</button>
            <button onClick={() => { simulateAction('reconnect', ctxDev.id); setContextMenu(null) }} className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-panel-2/60 text-fg cursor-pointer">Reconnect</button>
            <button onClick={() => { simulateAction('restart-printer', ctxDev.id); setContextMenu(null) }} className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-panel-2/60 text-fg cursor-pointer">Restart</button>
            <div className="h-px bg-line/60 my-1" />
            <button onClick={() => { setSelectedNode(contextMenu.nodeId); setContextMenu(null) }} className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-panel-2/60 text-accent cursor-pointer">Show Info</button>
          </motion.div>
        </>
      )}
    </div>
  )
}
