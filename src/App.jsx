import { useState, useEffect } from 'react'
import { ClipboardList, LayoutDashboard, Settings as Cog } from 'lucide-react'
import DataEntry from './components/DataEntry'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import { storage } from './utils/storage'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'data',      label: 'Nhập liệu', Icon: ClipboardList },
  { id: 'settings',  label: 'Cài đặt',   Icon: Cog },
]

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [rooms, setRooms] = useState([])
  const [bills, setBills] = useState([])
  const [settings, setSettings] = useState(storage.getSettings())

  useEffect(() => {
    setRooms(storage.getRooms())
    setBills(storage.getBills())
  }, [])

  const handleRoomsChange   = r => { setRooms(r);    storage.saveRooms(r) }
  const handleBillsChange   = b => { setBills(b);    storage.saveBills(b) }
  const handleSettingsChange = s => { setSettings(s); storage.saveSettings(s) }

  const occupied = rooms.filter(r => r.status === 'occupied').length

  return (
    <div className="flex flex-col h-screen max-w-[430px] mx-auto relative overflow-hidden"
         style={{ background: '#F2F2F7' }}>

      {/* Dynamic Island-style header */}
      <header className="flex-shrink-0 pt-12 pb-4 px-5"
              style={{ background: 'linear-gradient(180deg, #007AFF 0%, #0055CC 100%)' }}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/60 text-xs font-medium tracking-wide uppercase">Quản lý</p>
            <h1 className="text-white text-2xl font-bold mt-0.5 leading-tight">{settings.buildingName}</h1>
          </div>
          <div className="text-right">
            <div className="text-white/60 text-xs font-medium">Đang thuê</div>
            <div className="text-white text-3xl font-bold number-display">
              {occupied}<span className="text-white/50 text-lg font-medium">/{rooms.length}</span>
            </div>
          </div>
        </div>

        {/* Desktop tab bar inside header */}
        <div className="hidden sm:flex mt-4 bg-white/15 rounded-2xl p-1 gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${tab === id ? 'bg-white text-[#007AFF]' : 'text-white/70 hover:text-white'}`}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto scroll-ios">
        <div className="fade-in" key={tab}>
          {tab === 'dashboard' && (
            <Dashboard rooms={rooms} bills={bills} />
          )}
          {tab === 'data' && (
            <DataEntry rooms={rooms} bills={bills} settings={settings}
              onRoomsChange={handleRoomsChange} onBillsChange={handleBillsChange} />
          )}
          {tab === 'settings' && (
            <Settings settings={settings} onSave={handleSettingsChange} />
          )}
        </div>
      </main>

      {/* iOS bottom tab bar */}
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
