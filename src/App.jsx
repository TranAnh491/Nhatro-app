import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { ClipboardList, LayoutDashboard, Settings as Cog, LogOut } from 'lucide-react'
import { auth } from './firebase'
import {
  subscribeRooms, subscribeSettings, subscribeBills,
  saveRoom, deleteRoom as fbDeleteRoom, saveBill, saveSettings as fbSaveSettings,
} from './utils/firestore'
import DataEntry from './components/DataEntry'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import Login from './components/Login'
import { storage } from './utils/storage'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'data',      label: 'Nhập liệu', Icon: ClipboardList },
  { id: 'settings',  label: 'Cài đặt',   Icon: Cog },
]

const DEFAULT_SETTINGS = {
  buildingName: 'Dãy Nhà Trọ',
  defaultElectricPrice: 3500,
  defaultWaterPrice: 15000,
  defaultRentPrice: 2500000,
}

export default function App() {
  const [user,     setUser]     = useState(undefined) // undefined = loading
  const [tab,      setTab]      = useState('dashboard')
  const [rooms,    setRooms]    = useState([])
  const [bills,    setBills]    = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u ?? null))
    return unsub
  }, [])

  // Subscribe to Firestore when logged in
  useEffect(() => {
    if (!user) return
    const unsubRooms    = subscribeRooms(user.uid, setRooms)
    const unsubBills    = subscribeBills(user.uid, setBills)
    const unsubSettings = subscribeSettings(user.uid, s => setSettings({ ...DEFAULT_SETTINGS, ...s }))
    return () => { unsubRooms(); unsubBills(); unsubSettings() }
  }, [user])

  // ── Handlers ────────────────────────────────────────────
  const handleSaveRoom = async (room) => {
    await saveRoom(user.uid, room)
  }
  const handleDeleteRoom = async (id) => {
    await fbDeleteRoom(user.uid, id)
    // delete related bills
    const relatedBills = bills.filter(b => b.roomId === id)
    await Promise.all(relatedBills.map(b =>
      import('firebase/firestore').then(({ deleteDoc, doc }) =>
        deleteDoc(doc(import('./firebase').then(m => m.db), `users/${user.uid}/bills/${b.id}`))
      )
    ))
  }
  const handleSaveBill = async (bill) => {
    await saveBill(user.uid, bill)
  }
  const handleSaveSettings = async (s) => {
    await fbSaveSettings(user.uid, s)
  }

  // ── Loading ──────────────────────────────────────────────
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'linear-gradient(180deg, #007AFF 0%, #0041A8 100%)' }}>
        <div className="text-center text-white">
          <div className="text-5xl mb-4 animate-bounce">🏠</div>
          <p className="font-semibold opacity-80">Đang tải...</p>
        </div>
      </div>
    )
  }

  // ── Not logged in ────────────────────────────────────────
  if (!user) return <Login />

  // ── Main app ─────────────────────────────────────────────
  const occupied = rooms.filter(r => r.status === 'occupied').length

  return (
    <div className="flex flex-col h-screen max-w-[430px] mx-auto relative overflow-hidden"
         style={{ background: '#F2F2F7' }}>

      {/* Header */}
      <header className="flex-shrink-0 pt-12 pb-4 px-5"
              style={{ background: 'linear-gradient(180deg, #007AFF 0%, #0055CC 100%)' }}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/60 text-xs font-medium tracking-wide uppercase">Quản lý</p>
            <h1 className="text-white text-2xl font-bold mt-0.5 leading-tight">{settings.buildingName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-white/60 text-xs font-medium">Đang thuê</div>
              <div className="text-white text-3xl font-bold number-display">
                {occupied}<span className="text-white/50 text-lg font-medium">/{rooms.length}</span>
              </div>
            </div>
            <button onClick={() => signOut(auth)}
              className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-2xl flex items-center justify-center transition-colors active:scale-90">
              <LogOut size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Desktop tab bar */}
        <div className="hidden sm:flex mt-4 bg-white/15 rounded-2xl p-1 gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${tab === id ? 'bg-white text-[#007AFF]' : 'text-white/70 hover:text-white'}`}>
              <Icon size={16} />{label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto scroll-ios">
        <div className="fade-in" key={tab}>
          {tab === 'dashboard' && <Dashboard rooms={rooms} bills={bills} />}
          {tab === 'data' && (
            <DataEntry
              rooms={rooms} bills={bills} settings={settings}
              onSaveRoom={handleSaveRoom}
              onDeleteRoom={handleDeleteRoom}
              onSaveBill={handleSaveBill}
            />
          )}
          {tab === 'settings' && (
            <Settings settings={settings} onSave={handleSaveSettings} />
          )}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden flex-shrink-0 glass-nav flex items-center px-2"
           style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)', paddingTop: '8px' }}>
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => setTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-1 transition-all duration-150 active:scale-90">
              <div className={`transition-all duration-200 ${active ? 'scale-110' : 'scale-100'}`}>
                <Icon size={24} strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'text-[#007AFF]' : 'text-[#8E8E93]'} />
              </div>
              <span className={`text-[10px] font-semibold leading-none transition-colors duration-200
                ${active ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
