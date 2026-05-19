import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { fmt, calcBill, monthLabel } from '../utils/helpers'

const EMPTY = { electricStart: 0, electricEnd: 0, waterStart: 0, waterEnd: 0, otherFees: 0, notes: '', isPaid: false, paidDate: '' }

// Format số có dấu phẩy
const fmtN   = (v) => v === '' || v == null ? '' : Number(String(v).replace(/,/g,'')).toLocaleString('en-US')
const parseN = (v) => Number(String(v).replace(/,/g,'')) || 0

function MeterSection({ color, Icon, title, unit, priceLabel, start, end, calc, onStart, onEnd }) {
  const used = Math.max(0, Number(end) - Number(start))
  return (
    <div className={`${color} rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{Icon}</span>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <span className="text-xs opacity-70">{priceLabel}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {[
          { label: 'Chỉ số đầu', val: start, onChange: onStart },
          { label: 'Chỉ số cuối', val: end,   onChange: onEnd },
        ].map(({ label, val, onChange }) => (
          <div key={label} className="bg-white/60 rounded-xl p-3">
            <p className="text-xs opacity-60 mb-1">{label}</p>
            <input
              type="text" inputMode="numeric"
              value={fmtN(val)}
              onChange={e => onChange(e.target.value.replace(/[^0-9]/g,''))}
              className="w-full bg-transparent font-bold text-xl number-display focus:outline-none" />
            <p className="text-xs opacity-50 mt-0.5">{unit}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="opacity-70">Tiêu thụ: <strong>{used} {unit}</strong></span>
        <strong className="font-bold">{fmt(calc)}</strong>
      </div>
    </div>
  )
}

export default function BillForm({ room, bill, month, year, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (bill) setForm({ ...EMPTY, ...bill })
    else setForm({ ...EMPTY, electricPrice: room.electricPrice, waterPrice: room.waterPrice, rentPrice: room.rentPrice })
  }, [bill, room])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const ePrice = Number(form.electricPrice ?? room.electricPrice)
  const wPrice = Number(form.waterPrice    ?? room.waterPrice)
  const rPrice = Number(form.rentPrice     ?? room.rentPrice)
  const calc = calcBill({ ...form, electricPrice: ePrice, waterPrice: wPrice, rentPrice: rPrice })

  const handleSubmit = () => {
    onSave({
      ...form, roomId: room.id, month, year,
      electricPrice: ePrice, waterPrice: wPrice, rentPrice: rPrice,
      electricStart: parseN(form.electricStart), electricEnd: parseN(form.electricEnd),
      waterStart:    parseN(form.waterStart),    waterEnd:   parseN(form.waterEnd),
      otherFees:     parseN(form.otherFees),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[430px] bg-[#F2F2F7] rounded-t-[28px] max-h-[94vh] overflow-hidden slide-up flex flex-col">

        {/* Handle */}
        <div className="flex justify-center pt-3 flex-shrink-0">
          <div className="w-12 h-1 bg-[#D1D1D6] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
          <button onClick={onClose} className="text-[#007AFF] font-medium">Huỷ</button>
          <div className="text-center">
            <h2 className="font-bold text-sm">Phòng {room.number}</h2>
            <p className="text-xs text-[#8E8E93]">{monthLabel(month, year)}</p>
          </div>
          <button onClick={handleSubmit} className="text-[#007AFF] font-semibold">Lưu</button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 pb-8 space-y-4">

          {/* Meter sections */}
          <MeterSection
            color="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100"
            Icon="⚡" title="Điện"
            unit="kWh" priceLabel={`${ePrice.toLocaleString('vi-VN')} ₫/kWh`}
            start={form.electricStart} end={form.electricEnd}
            onStart={v => set('electricStart', v)} onEnd={v => set('electricEnd', v)}
            calc={calc.electric}
          />

          <MeterSection
            color="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100"
            Icon="💧" title="Nước"
            unit="m³" priceLabel={`${wPrice.toLocaleString('vi-VN')} ₫/m³`}
            start={form.waterStart} end={form.waterEnd}
            onStart={v => set('waterStart', v)} onEnd={v => set('waterEnd', v)}
            calc={calc.water}
          />

          {/* Other fees */}
          <div>
            <p className="section-header">Phí khác</p>
            <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center border border-black/[0.04]">
              <span className="text-sm text-[#1C1C1E] flex-1 font-medium">Phí phát sinh (₫)</span>
              <input type="text" inputMode="numeric"
                value={fmtN(form.otherFees)}
                onChange={e => set('otherFees', e.target.value.replace(/[^0-9]/g,''))}
                placeholder="0"
                className="text-right bg-transparent text-[#007AFF] font-semibold w-28 focus:outline-none text-sm" />
            </div>
          </div>

          {/* Total */}
          <div className="gradient-blue rounded-2xl p-4 text-white">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">Tổng hoá đơn</p>
            <div className="space-y-2 text-sm">
              {[
                ['Tiền thuê', calc.rent],
                ['Tiền điện', calc.electric],
                ['Tiền nước', calc.water],
                ...(calc.other > 0 ? [['Phí khác', calc.other]] : []),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-white/70">{label}</span>
                  <span className="font-semibold">{fmt(val)}</span>
                </div>
              ))}
              <div className="border-t border-white/20 pt-2 flex justify-between text-base font-bold">
                <span>Tổng cộng</span>
                <span className="text-2xl number-display">{fmt(calc.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <p className="section-header">Thanh toán</p>
            <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.04]">
              <label className="flex items-center gap-3 px-4 py-3.5 cursor-pointer border-b border-black/[0.04] last:border-0">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                  ${form.isPaid ? 'bg-[#34C759] border-[#34C759]' : 'border-[#C7C7CC]'}`}
                  onClick={() => set('isPaid', !form.isPaid)}>
                  {form.isPaid && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-sm font-medium flex-1">Đã thanh toán</span>
                {form.isPaid && <span className="badge bg-[#34C759]/10 text-[#1DAF42]">✓ Thu rồi</span>}
              </label>
              {form.isPaid && (
                <div className="flex items-center px-4 py-3.5">
                  <span className="text-sm font-medium flex-1">Ngày thu</span>
                  <input type="date" value={form.paidDate} onChange={e => set('paidDate', e.target.value)}
                    className="bg-transparent text-[#007AFF] text-sm font-medium focus:outline-none text-right" />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="section-header">Ghi chú</p>
            <textarea className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm placeholder-[#C7C7CC] resize-none
                                 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 border border-black/[0.04]"
              rows={2} placeholder="Ghi chú..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}
