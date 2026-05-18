import { useState } from 'react'
import { Plus, Pencil, Trash2, Phone, Zap, Droplets, Calendar, AlertTriangle, ChevronRight } from 'lucide-react'
import { v4 as uuid } from 'uuid'
import RoomForm from './RoomForm'
import BillForm from './BillForm'
import { fmt, monthLabel, contractStatus, getCurrentMonth } from '../utils/helpers'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const YEARS  = [2024, 2025, 2026, 2027]

export default function DataEntry({ rooms, bills, settings, onRoomsChange, onBillsChange }) {
  const [activeTab,   setActiveTab]   = useState('rooms')
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [editRoom,     setEditRoom]     = useState(null)
  const [showBillForm, setShowBillForm] = useState(null)
  const [expandedId,   setExpandedId]   = useState(null)
  const [month, setMonth] = useState(getCurrentMonth().month)
  const [year,  setYear]  = useState(getCurrentMonth().year)

  const saveRoom = (data) => {
    if (editRoom) onRoomsChange(rooms.map(r => r.id === editRoom.id ? { ...editRoom, ...data } : r))
    else          onRoomsChange([...rooms, { ...data, id: uuid() }])
    setShowRoomForm(false); setEditRoom(null)
  }

  const deleteRoom = (id) => {
    if (!confirm('Xoá phòng này? Dữ liệu hoá đơn cũng bị xoá.')) return
    onRoomsChange(rooms.filter(r => r.id !== id))
    onBillsChange(bills.filter(b => b.roomId !== id))
  }

  const saveBill = (data) => {
    const existing = bills.find(b => b.roomId === data.roomId && b.month === data.month && b.year === data.year)
    if (existing) onBillsChange(bills.map(b => b.id === existing.id ? { ...existing, ...data } : b))
    else          onBillsChange([...bills, { ...data, id: uuid() }])
    setShowBillForm(null)
  }

  const getBill = (roomId) => bills.find(b => b.roomId === roomId && b.month === month && b.year === year)

  return (
    <div className="flex flex-col h-full">
      {/* Segmented control */}
      <div className="px-4 pt-3 pb-2 bg-[#F2F2F7] sticky top-0 z-10">
        <div className="segmented">
          <button className={`segmented-item ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}>Danh sách phòng</button>
          <button className={`segmented-item ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}>Chỉ số tháng</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28 scroll-ios">

        {/* ── ROOMS TAB ── */}
        {activeTab === 'rooms' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-[#8E8E93] text-sm">
                {rooms.length} phòng · <span className="text-[#34C759] font-semibold">{rooms.filter(r => r.status==='occupied').length}</span> đang thuê
              </p>
              <button className="btn-primary py-2 px-4 text-xs rounded-xl shadow-md"
                onClick={() => { setEditRoom(null); setShowRoomForm(true) }}>
                <Plus size={14} /> Thêm phòng
              </button>
            </div>

            {rooms.length === 0 && (
              <div className="card-elevated p-10 text-center mt-4">
                <div className="text-5xl mb-4">🏠</div>
                <p className="text-[#1C1C1E] font-semibold">Chưa có phòng nào</p>
                <p className="text-[#8E8E93] text-sm mt-1">Nhấn "+ Thêm phòng" để bắt đầu</p>
              </div>
            )}

            <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
              {rooms.map((room, i) => {
                const cs = contractStatus(room.contractEnd)
                const isExpanded = expandedId === room.id

                return (
                  <div key={room.id}
                    className={`bg-white border-b border-black/[0.04] last:border-0
                      ${i === 0 ? 'rounded-t-2xl' : ''} ${i === rooms.length-1 ? 'rounded-b-2xl' : ''}`}>

                    {/* Room row */}
                    <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                      onClick={() => setExpandedId(isExpanded ? null : room.id)}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm
                        ${room.status === 'occupied'
                          ? 'gradient-blue text-white shadow-blue-500/25'
                          : 'bg-[#F2F2F7] text-[#8E8E93]'}`}>
                        {room.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm truncate">
                            {room.tenantName || <span className="text-[#C7C7CC]">Chưa có người thuê</span>}
                          </p>
                          {cs === 'expired'  && <AlertTriangle size={13} className="text-[#FF3B30] flex-shrink-0" />}
                          {cs === 'expiring' && <AlertTriangle size={13} className="text-[#FF9500] flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-[#8E8E93] mt-0.5">{fmt(room.rentPrice)}<span className="text-[#C7C7CC]">/tháng</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge text-xs ${room.status === 'occupied'
                          ? 'bg-[#34C759]/10 text-[#1DAF42]' : 'bg-[#F2F2F7] text-[#8E8E93]'}`}>
                          {room.status === 'occupied' ? 'Đang thuê' : 'Trống'}
                        </span>
                        <ChevronRight size={16} className={`text-[#C7C7CC] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-black/[0.04] bg-[#F9F9FB] px-4 py-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {room.tenantPhone && (
                            <a href={`tel:${room.tenantPhone}`}
                              className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-2.5 text-[#007AFF] font-medium border border-black/[0.04] col-span-2">
                              <Phone size={14} /> {room.tenantPhone}
                            </a>
                          )}
                          <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-2.5 border border-black/[0.04]">
                            <Zap size={13} className="text-[#FF9500]" />
                            <span className="text-[#3C3C43] font-medium">{room.electricPrice?.toLocaleString('vi-VN')} ₫/kWh</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-2.5 border border-black/[0.04]">
                            <Droplets size={13} className="text-[#007AFF]" />
                            <span className="text-[#3C3C43] font-medium">{room.waterPrice?.toLocaleString('vi-VN')} ₫/m³</span>
                          </div>
                          {room.contractEnd && (
                            <div className={`flex items-center gap-1.5 bg-white rounded-xl px-3 py-2.5 border col-span-2
                              ${cs === 'expired' ? 'border-[#FF3B30]/30 bg-[#FF3B30]/5' : cs === 'expiring' ? 'border-[#FF9500]/30 bg-[#FF9500]/5' : 'border-black/[0.04]'}`}>
                              <Calendar size={13} className={cs === 'expired' ? 'text-[#FF3B30]' : cs === 'expiring' ? 'text-[#FF9500]' : 'text-[#8E8E93]'} />
                              <span className="font-medium">HĐ đến: {new Date(room.contractEnd).toLocaleDateString('vi-VN')}</span>
                              {cs === 'expired'  && <span className="ml-auto badge bg-[#FF3B30]/10 text-[#FF3B30]">Hết hạn</span>}
                              {cs === 'expiring' && <span className="ml-auto badge bg-[#FF9500]/10 text-[#FF9500]">Sắp hết</span>}
                            </div>
                          )}
                          {room.deposit > 0 && (
                            <div className="bg-white rounded-xl px-3 py-2.5 border border-black/[0.04] col-span-2">
                              <span className="text-[#8E8E93]">Đặt cọc: </span>
                              <span className="font-semibold text-[#1C1C1E]">{fmt(room.deposit)}</span>
                            </div>
                          )}
                        </div>
                        {room.notes && (
                          <p className="text-xs text-[#8E8E93] bg-white rounded-xl px-3 py-2.5 border border-black/[0.04]">{room.notes}</p>
                        )}
                        <div className="flex gap-2">
                          <button className="btn-secondary flex-1 justify-center text-xs py-2.5"
                            onClick={() => { setEditRoom(room); setShowRoomForm(true) }}>
                            <Pencil size={13} /> Sửa
                          </button>
                          <button className="btn-danger flex-1 justify-center text-xs py-2.5"
                            onClick={() => deleteRoom(room.id)}>
                            <Trash2 size={13} /> Xoá
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── BILLING TAB ── */}
        {activeTab === 'billing' && (
          <div className="space-y-4 pt-2">
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

            {/* Progress summary */}
            {rooms.filter(r => r.status==='occupied').length > 0 && (() => {
              const occ = rooms.filter(r => r.status==='occupied')
              const entered = occ.filter(r => getBill(r.id)).length
              const pct = Math.round(entered / occ.length * 100)
              return (
                <div className="gradient-blue rounded-2xl p-4 text-white">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Đã nhập</span>
                    <span className="font-bold">{entered}/{occ.length} phòng · {pct}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-500"
                         style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })()}

            {rooms.filter(r => r.status==='occupied').length === 0 && (
              <div className="card-elevated p-10 text-center">
                <div className="text-5xl mb-4">🏠</div>
                <p className="text-[#8E8E93] text-sm">Không có phòng nào đang thuê</p>
              </div>
            )}

            <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
              {rooms.filter(r => r.status==='occupied').map((room, i, arr) => {
                const bill = getBill(room.id)
                return (
                  <div key={room.id}
                    className={`bg-white border-b border-black/[0.04] last:border-0 p-4
                      ${i===0 ? 'rounded-t-2xl' : ''} ${i===arr.length-1 ? 'rounded-b-2xl' : ''}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 gradient-blue rounded-2xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-lg shadow-blue-500/20">
                        {room.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{room.tenantName || '—'}</p>
                        {bill && (
                          <span className={`badge text-xs ${bill.isPaid ? 'bg-[#34C759]/10 text-[#1DAF42]' : 'bg-[#FF9500]/10 text-[#CC7700]'}`}>
                            {bill.isPaid ? '✓ Đã thu' : '⏳ Chưa thu'}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setShowBillForm(room)}
                        className={bill ? 'btn-secondary py-2 px-3 text-xs rounded-xl' : 'btn-primary py-2 px-3 text-xs rounded-xl shadow-md'}>
                        {bill ? <><Pencil size={13} /> Sửa</> : <><Plus size={13} /> Nhập</>}
                      </button>
                    </div>

                    {bill ? (
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: '⚡ Điện', val: `${Math.max(0, bill.electricEnd - bill.electricStart)} kWh`, bg: 'bg-amber-50' },
                          { label: '💧 Nước', val: `${Math.max(0, bill.waterEnd - bill.waterStart)} m³`, bg: 'bg-blue-50' },
                          { label: '💰 Tổng', val: (() => {
                            const t = (bill.rentPrice||0) +
                              Math.max(0,bill.electricEnd-bill.electricStart)*(bill.electricPrice||0)+
                              Math.max(0,bill.waterEnd-bill.waterStart)*(bill.waterPrice||0)+
                              (bill.otherFees||0)
                            return `${(t/1000).toFixed(0)}K`
                          })(), bg: 'gradient-blue text-white' },
                        ].map(({ label, val, bg }) => (
                          <div key={label} className={`${bg} rounded-xl p-2.5 text-center`}>
                            <p className={`text-xs ${bg.includes('gradient') ? 'text-white/70' : 'text-[#8E8E93]'}`}>{label}</p>
                            <p className={`font-bold text-sm number-display mt-0.5 ${bg.includes('gradient') ? 'text-white' : ''}`}>{val}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#F2F2F7] rounded-xl py-3 text-center">
                        <p className="text-xs text-[#C7C7CC]">Chưa nhập chỉ số tháng này</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showRoomForm && (
        <RoomForm room={editRoom} settings={settings} onSave={saveRoom}
          onClose={() => { setShowRoomForm(false); setEditRoom(null) }} />
      )}
      {showBillForm && (
        <BillForm room={showBillForm} bill={getBill(showBillForm.id)}
          month={month} year={year} onSave={saveBill} onClose={() => setShowBillForm(null)} />
      )}
    </div>
  )
}
