import { useState } from 'react'
import { TrendingUp, CheckCircle2, Clock4, AlertTriangle, Zap, Droplets, ChevronRight, Home } from 'lucide-react'
import { fmt, calcBill, monthLabel, contractStatus, getCurrentMonth } from '../utils/helpers'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const YEARS  = [2024, 2025, 2026, 2027]

function BigStatCard({ gradient, icon: Icon, label, value, sub }) {
  return (
    <div className={`${gradient} rounded-3xl p-5 text-white relative overflow-hidden`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -right-2 top-8 w-14 h-14 bg-white/10 rounded-full" />
      <div className="relative">
        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
          <Icon size={20} className="text-white" />
        </div>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-white text-2xl font-bold mt-1 number-display leading-tight">{value}</p>
        {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function SmallStatCard({ icon: Icon, iconBg, label, value, sub }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-11 h-11 ${iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[#8E8E93] text-xs font-medium">{label}</p>
        <p className="text-[#1C1C1E] font-bold text-base number-display truncate">{value}</p>
        {sub && <p className="text-[#8E8E93] text-xs">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard({ rooms, bills }) {
  const { month: cm, year: cy } = getCurrentMonth()
  const [month, setMonth] = useState(cm)
  const [year,  setYear]  = useState(cy)

  const monthBills  = bills.filter(b => b.month === month && b.year === year)
  const occupied    = rooms.filter(r => r.status === 'occupied')
  const vacant      = rooms.filter(r => r.status === 'vacant')

  const totalRevenue     = monthBills.reduce((a, b) => a + calcBill(b).total, 0)
  const collectedRevenue = monthBills.filter(b => b.isPaid).reduce((a, b) => a + calcBill(b).total, 0)
  const pendingRevenue   = totalRevenue - collectedRevenue
  const totalElectric    = monthBills.reduce((a, b) => a + Math.max(0, b.electricEnd - b.electricStart), 0)
  const totalWater       = monthBills.reduce((a, b) => a + Math.max(0, b.waterEnd - b.waterStart), 0)

  const expiringContracts = rooms.filter(r => ['expiring','expired'].includes(contractStatus(r.contractEnd)))
  const unpaidRooms = occupied.filter(r => {
    const b = monthBills.find(b => b.roomId === r.id)
    return !b || !b.isPaid
  })

  const collectedPct = totalRevenue > 0 ? Math.round(collectedRevenue / totalRevenue * 100) : 0

  return (
    <div className="px-4 pt-3 pb-28 space-y-4">
      {/* Month picker */}
      <div className="flex gap-2">
        <select className="input-field-white flex-1 font-medium" value={month}
          onChange={e => setMonth(Number(e.target.value))}>
          {MONTHS.map(m => <option key={m} value={m}>Tháng {String(m).padStart(2,'0')}</option>)}
        </select>
        <select className="input-field-white w-24 font-medium" value={year}
          onChange={e => setYear(Number(e.target.value))}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Hero revenue card */}
      <div className="gradient-blue rounded-3xl p-5 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute right-8 -bottom-2 w-20 h-20 bg-white/10 rounded-full" />
        <div className="relative">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">{monthLabel(month, year)}</p>
          <p className="text-white text-4xl font-bold mt-2 number-display">{fmt(totalRevenue)}</p>
          <p className="text-white/60 text-sm mt-1">Tổng doanh thu dự kiến</p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/70">Đã thu <strong className="text-white">{fmt(collectedRevenue)}</strong></span>
              <span className="text-white/70">{collectedPct}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700"
                   style={{ width: `${collectedPct}%` }} />
            </div>
            {pendingRevenue > 0 && (
              <p className="text-white/50 text-xs mt-1.5">Còn lại {fmt(pendingRevenue)}</p>
            )}
          </div>
        </div>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <BigStatCard gradient="gradient-green" icon={CheckCircle2}
          label="Đã thu" value={fmt(collectedRevenue)}
          sub={`${monthBills.filter(b=>b.isPaid).length}/${occupied.length} phòng`} />
        <BigStatCard gradient="gradient-orange" icon={Clock4}
          label="Chưa thu" value={fmt(pendingRevenue)}
          sub={`${unpaidRooms.length} phòng còn nợ`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SmallStatCard icon={Home} iconBg="gradient-blue"
          label="Đang thuê" value={`${occupied.length}/${rooms.length}`} sub="phòng" />
        <SmallStatCard icon={Home} iconBg="bg-[#8E8E93]"
          label="Còn trống" value={vacant.length} sub="phòng chưa cho thuê" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SmallStatCard icon={Zap} iconBg="gradient-orange"
          label="Tổng điện" value={`${totalElectric.toLocaleString('vi-VN')} kWh`} />
        <SmallStatCard icon={Droplets} iconBg="gradient-teal"
          label="Tổng nước" value={`${totalWater.toLocaleString('vi-VN')} m³`} />
      </div>

      {/* Alerts */}
      {expiringContracts.length > 0 && (
        <div>
          <p className="section-header">Cảnh báo hợp đồng</p>
          <div className="rounded-2xl overflow-hidden border border-[#FF9500]/20">
            {expiringContracts.map((r, i) => {
              const s = contractStatus(r.contractEnd)
              return (
                <div key={r.id}
                  className={`flex items-center gap-3 px-4 py-3.5 bg-white border-b border-black/[0.04] last:border-0
                    ${i === 0 ? 'rounded-t-2xl' : ''} ${i === expiringContracts.length-1 ? 'rounded-b-2xl' : ''}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                    ${s === 'expired' ? 'bg-[#FF3B30]/10' : 'bg-[#FF9500]/10'}`}>
                    <AlertTriangle size={18} className={s === 'expired' ? 'text-[#FF3B30]' : 'text-[#FF9500]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">Phòng {r.number} · {r.tenantName}</p>
                    <p className="text-xs text-[#8E8E93]">Đến {new Date(r.contractEnd).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <span className={`badge ${s === 'expired' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'bg-[#FF9500]/10 text-[#FF9500]'}`}>
                    {s === 'expired' ? 'Hết hạn' : 'Sắp hết'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Room details */}
      <div>
        <p className="section-header">Chi tiết phòng · {monthLabel(month, year)}</p>
        {occupied.length === 0 ? (
          <div className="card p-10 text-center">
            <Home size={36} className="mx-auto text-[#C7C7CC] mb-3" />
            <p className="text-[#8E8E93] font-medium text-sm">Chưa có phòng nào đang thuê</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
            {occupied.map((room, i) => {
              const bill  = monthBills.find(b => b.roomId === room.id)
              const calc  = bill ? calcBill(bill) : null
              const isPaid = bill?.isPaid
              return (
                <div key={room.id}
                  className={`bg-white border-b border-black/[0.04] last:border-0 p-4
                    ${i === 0 ? 'rounded-t-2xl' : ''} ${i === occupied.length-1 ? 'rounded-b-2xl' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 gradient-blue rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                      <span className="text-white font-bold text-xs">{room.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{room.tenantName || 'Chưa đặt tên'}</p>
                      <p className="text-xs text-[#8E8E93]">{fmt(room.rentPrice)}/tháng</p>
                    </div>
                    {bill ? (
                      <span className={`badge ${isPaid ? 'bg-[#34C759]/10 text-[#1DAF42]' : 'bg-[#FF9500]/10 text-[#CC7700]'}`}>
                        {isPaid ? '✓ Đã thu' : '⏳ Chưa thu'}
                      </span>
                    ) : (
                      <span className="badge bg-[#F2F2F7] text-[#8E8E93]">Chưa nhập</span>
                    )}
                  </div>

                  {calc && (
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'Thuê',  val: calc.rent,     bg: 'bg-[#F2F2F7]',       text: 'text-[#3C3C43]' },
                        { label: 'Điện',  val: calc.electric, bg: 'bg-[#FF9500]/8',     text: 'text-[#CC7700]' },
                        { label: 'Nước',  val: calc.water,    bg: 'bg-[#007AFF]/8',     text: 'text-[#0055CC]' },
                        { label: 'Tổng',  val: calc.total,    bg: 'gradient-blue',       text: 'text-white', dark: true },
                      ].map(({ label, val, bg, text, dark }) => (
                        <div key={label} className={`${bg} rounded-xl p-2 text-center`}>
                          <p className={`text-[10px] font-medium ${dark ? 'text-white/70' : 'text-[#8E8E93]'}`}>{label}</p>
                          <p className={`text-[11px] font-bold number-display mt-0.5 ${text}`}>
                            {(val/1000).toFixed(0)}K
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {!bill && <p className="text-xs text-[#C7C7CC] text-center py-1">Chưa có dữ liệu tháng này</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
