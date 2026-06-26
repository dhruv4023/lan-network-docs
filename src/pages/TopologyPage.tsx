import { useState, useRef, useCallback } from 'react'
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
  const colors: Record<string, string> = {
    router: '#54e0c2',
    switch: '#f2b340',
    printer: '#9f8aff',
    laptop: '#54e0c2',
    desktop: '#ef6461',
    'access-point': '#54e0c2',
  }
  return colors[type] || '#8da0b3'
}

const deviceIcons: Record<string, string> = {
  router: '\uD83D\uDCE1', switch: '\uD83D\uDD00', printer: '\uD83D\uDDA8',
  laptop: '\uD83D\uDCBB', desktop: '\uD83D\uDDA5', 'access-point': '\uD83D\uDCF6',
}

export default function TopologyPage() {
  const devices = useStore(s => s.devices)
  const topology = useStore(s => s.topology)
  const updateTopology = useStore(s => s.updateTopology)
  const connectDevices = useStore(s => s.connectDevices)
  const router = useStore(s => s.router)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)

  const routerNode: TopologyNode = {
    id: 'router-node',
    deviceId: '',
    x: 400, y: 50,
    connections: topology.filter(n => n.connections.length > 0).map(n => n.id),
  }

  const nodeMap = new Map(topology.map(n => [n.id, n]))
  const deviceMap = new Map(devices.map(d => [d.id, d]))

  const handleMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    const node = nodeMap.get(nodeId)
    if (!node) return
    setDragState({
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.x,
      nodeStartY: node.y,
    })
    setSelectedNode(nodeId)
  }, [topology])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState) return
    const dx = e.clientX - dragState.startX
    const dy = e.clientY - dragState.startY
    const newNodes = topology.map(n =>
      n.id === dragState.nodeId
        ? { ...n, x: Math.max(20, Math.min(760, dragState.nodeStartX + dx)), y: Math.max(20, Math.min(500, dragState.nodeStartY + dy)) }
        : n
    )
    updateTopology(newNodes)
  }, [dragState, topology, updateTopology])

  const handleMouseUp = useCallback(() => {
    setDragState(null)
  }, [])

  function handleNodeClick(nodeId: string) {
    if (connecting) {
      if (connecting !== nodeId) {
        connectDevices(connecting, nodeId)
      }
      setConnecting(null)
    } else {
      setSelectedNode(nodeId === selectedNode ? null : nodeId)
    }
  }

  const selectedDevice = selectedNode
    ? devices.find(d => d.id === nodeMap.get(selectedNode)?.deviceId)
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Network Topology</h1>
          <p className="text-muted text-sm">Drag devices to rearrange · Click to select · Click two nodes to connect</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setConnecting(null)}
            className={`btn text-xs ${connecting ? 'btn-primary' : 'btn-ghost'}`}
          >
            {connecting ? 'Cancel Connect' : 'Connect Mode'}
          </button>
        </div>
      </div>

      <div
        className="bg-panel border border-line rounded-lg p-4 relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 800 500"
          className="w-full h-auto"
          style={{ minHeight: '400px' }}
        >
          {/* Connection lines */}
          {topology.map(node =>
            node.connections.map(targetId => {
              const target = nodeMap.get(targetId)
              if (!target) return null
              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={node.x}
                  y1={node.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#223040"
                  strokeWidth={2}
                  className="transition-all duration-150"
                />
              )
            })
          )}

          {/* "Connecting" line */}
          {connecting && dragState === null && (() => {
            const src = nodeMap.get(connecting)
            if (!src) return null
            return (
              <line
                x1={src.x}
                y1={src.y}
                x2={src.x + 50}
                y2={src.y + 50}
                stroke="#54e0c2"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )
          })()}

          {/* Router node (fixed) */}
          <g>
            <rect x={routerNode.x - 60} y={routerNode.y - 20} width={120} height={40} rx={8} fill="#1e463f" stroke="#54e0c2" strokeWidth={2} />
            <text x={routerNode.x} y={routerNode.y - 2} textAnchor="middle" fill="#e8eef4" fontSize={12} fontWeight={600}>
              {router.name}
            </text>
            <text x={routerNode.x} y={routerNode.y + 14} textAnchor="middle" fill="#8da0b3" fontSize={10}>
              {router.lanIp}
            </text>
          </g>

          {/* Device nodes */}
          {topology.map(node => {
            const dev = devices.find(d => d.id === node.deviceId)
            if (!dev) return null
            const isSelected = selectedNode === node.id
            const isConnecting = connecting === node.id
            const conflict = devices.some(d => d.id !== dev.id && d.ip === dev.ip)

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseDown={e => handleMouseDown(node.id, e)}
                onClick={() => handleNodeClick(node.id)}
              >
                <rect
                  x={node.x - 55}
                  y={node.y - 22}
                  width={110}
                  height={44}
                  rx={8}
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
                <text x={node.x - 45} y={node.y - 5} fontSize={14}>
                  {deviceIcons[dev.type] || '\u2753'}
                </text>
                <text x={node.x} y={node.y - 5} textAnchor="middle" fill="#e8eef4" fontSize={11} fontWeight={600}>
                  {dev.name}
                </text>
                <text x={node.x} y={node.y + 12} textAnchor="middle" fill="#8da0b3" fontSize={9}>
                  {dev.ip}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {selectedDevice && (
        <div className="bg-panel border border-line rounded-lg p-5">
          <h2 className="text-lg font-semibold mt-0 mb-3">{selectedDevice.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              ['Type', selectedDevice.type.replace('-', ' ')],
              ['MAC', selectedDevice.mac],
              ['IP', selectedDevice.ip],
              ['Mode', selectedDevice.ipMode.toUpperCase()],
              ['Status', selectedDevice.online ? 'Online' : 'Offline'],
              ['Connection', selectedDevice.connectionType],
              ['Gateway', selectedDevice.gateway],
              ['Firmware', selectedDevice.firmware || 'N/A'],
            ].map(([l, v]) => (
              <div key={l as string}>
                <span className="text-muted text-xs block">{l as string}</span>
                <span className={`font-mono text-xs ${l === 'Status' ? (selectedDevice.online ? 'text-accent' : 'text-danger') : ''}`}>
                  {v as string}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
