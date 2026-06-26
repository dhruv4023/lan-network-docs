import type { NetworkState } from '../types'

const STORAGE_PREFIX = 'networkSimulator.'
const SCHEMA_VERSION = 'v1'

export function persist(key: string, data: unknown): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}.${SCHEMA_VERSION}`, JSON.stringify(data))
  } catch {}
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}.${SCHEMA_VERSION}`)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function persistState(state: NetworkState): void {
  persist('router', state.router)
  persist('devices', state.devices)
  persist('reservations', state.reservations)
  persist('leases', state.leases)
  persist('topology', state.topology)
  persist('cables', state.cables)
  persist('logs', state.logs)
  persist('settings', state.settings)
}

export function loadState(): NetworkState | null {
  try {
    const router = load('router', null)
    const devices = load('devices', null)
    const reservations = load('reservations', null)
    const leases = load('leases', null)
    const topology = load('topology', null)
    const logs = load('logs', null)
    const settings = load('settings', null)
    if (!router || !devices || !settings) return null
    return { router, devices, reservations: reservations || [], leases: leases || [], topology: topology || [], cables: [], packets: [], logs: logs || [], settings } as unknown as NetworkState
  } catch {
    return null
  }
}

export function clearAll(): void {
  const keys = ['router', 'devices', 'reservations', 'leases', 'topology', 'cables', 'logs', 'settings']
  keys.forEach(k => {
    try { localStorage.removeItem(`${STORAGE_PREFIX}${k}.${SCHEMA_VERSION}`) } catch {}
  })
}

export function exportConfig(): string {
  const state = loadState()
  return JSON.stringify(state, null, 2)
}

export function importConfig(json: string): boolean {
  try {
    const data = JSON.parse(json) as NetworkState
    if (!data.router || !data.devices || !data.settings) return false
    persistState(data)
    return true
  } catch {
    return false
  }
}
