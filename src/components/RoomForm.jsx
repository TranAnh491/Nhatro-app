import { useState, useEffect } from 'react'
import { today } from '../utils/helpers'

const EMPTY = {
  number: '', tenantName: '', tenantPhone: '',
  rentPrice: '', electricPrice: 3500, waterPrice: 15000,
  deposit: '', contractStart: today(), contractEnd: '',
  status: 'occupied', notes: '',
}

// Format số có dấu phẩy: 2500000 → 2,500,000
const fmtInput  = (v) => v === '' || v == null ? '' : Number(String(v).replace(/,/g, '')).toLocaleString('en-US')
const parseInput = (v) => String(v).replace(/,/g, '')

function NumInput({ value, onChange, placeholder }) {
  const [display, setDisplay] = useState(fmtInput(value))

  useEffect(() => { setDisplay(fmtInput(value)) }, [value])

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setDisplay(raw === '' ? '' : Number(raw).toLocaleString('en-US'))
    onChange(raw)
  }

  return (
    <input
      type="text" inputMode="numeric" value={display}
      onChange={handleChange} placeholder={placeholder}
      className="bg-transparent text-right text-sm text-[#007AFF] font-medium
                 placeholder-[#C7C7CC] focus:outline-none w-full"
    />
  )
}

function FieldRow({ label, children }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-black/[0.05] last:border-0 first:rounded-t-2xl last:rounded-b-2xl">
      <p className="text-sm text-[#1C1C1E] w-28 flex-shrink-0 font-medium">{label}</p>
      <div className="flex-1 text-right">{children}</div>
    </div>
  )
}

export default function RoomForm({ room, settings, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (room) setForm({ ...EMPTY, ...room })
    else setForm({
      ...EMPTY,
      electricPrice: settings?.defaultElectricPrice ?? 3500,
      waterPrice:    settings?.defaultWaterPrice    ?? 15000,
      rentPrice:     settings?.defaultRentPrice     ?? '',
    })
  }, [room, settings])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault()
    // Cho lưu dù thiếu thông tin, chỉ cần có số phòng hoặc tên người thuê
    onSave({
      ...form,
      rentPrice:     Number(parseInput(form.rentPrice))     || 0,
      electricPrice: Number(parseInput(form.electricPrice)) || 0,
      waterPrice:    Number(parseInput(form.waterPrice))    || 0,
      deposit:       Number(parseInput(form.deposit))       || 0,
    })
  }

  const inlineText = (key, props = {}) => (
    <input
      {...props}
      value={form[key]}
      onChange={e => set(key, e.target.value)}
      className="bg-transparent text-right text-sm text-[#007AFF] font-medium
                 placeholder-[#C7C7CC] focus:outline-none w-full"
    />
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[430px] bg-[#F2F2F7] rounded-t-[28px] max-h-[92vh] overflow-hidden slide-up flex flex-col">

        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-12 h-1 bg-[#D1D1D6] rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
          <button onClick={onClose} className="text-[#007AFF] text-base font-medium">Huỷ</button>
          <h2 className="font-bold text-base">{room ? 'Sửa phòng' : 'Thêm phòng'}</h2>
          <button onClick={handleSubmit} className="text-[#007AFF] text-base font-semibold">Lưu</button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-4 pb-8 space-y-5">

          <div>
            <p className="section-header">Thông tin phòng</p>
            <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
              <FieldRow label="Số phòng">
                {inlineText('number', { placeholder: 'P01, BMT01, ...' })}
              </FieldRow>
              <FieldRow label="Trạng thái">
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="bg-transparent text-sm text-[#007AFF] font-medium focus:outline-none text-right">
                  <option value="occupied">Đang thuê</option>
                  <option value="vacant">Còn trống</option>
                </select>
              </FieldRow>
            </div>
          </div>

          <div>
            <p className="section-header">Người thuê</p>
            <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
              <FieldRow label="Họ tên">
                {inlineText('tenantName', { placeholder: 'Nguyễn Văn A' })}
              </FieldRow>
              <FieldRow label="Số điện thoại">
                {inlineText('tenantPhone', { type: 'tel', placeholder: '0901 234 567' })}
              </FieldRow>
            </div>
          </div>

          <div>
            <p className="section-header">Giá cả</p>
            <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
              <FieldRow label="Tiền thuê/tháng">
                <NumInput value={form.rentPrice} onChange={v => set('rentPrice', v)} placeholder="2,500,000" />
              </FieldRow>
              <FieldRow label="Giá điện (₫/kWh)">
                <NumInput value={form.electricPrice} onChange={v => set('electricPrice', v)} placeholder="3,500" />
              </FieldRow>
              <FieldRow label="Giá nước (₫/m³)">
                <NumInput value={form.waterPrice} onChange={v => set('waterPrice', v)} placeholder="15,000" />
              </FieldRow>
              <FieldRow label="Đặt cọc (₫)">
                <NumInput value={form.deposit} onChange={v => set('deposit', v)} placeholder="0" />
              </FieldRow>
            </div>
          </div>

          <div>
            <p className="section-header">Hợp đồng</p>
            <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
              <FieldRow label="Ngày bắt đầu">
                {inlineText('contractStart', { type: 'date' })}
              </FieldRow>
              <FieldRow label="Ngày kết thúc">
                {inlineText('contractEnd', { type: 'date' })}
              </FieldRow>
            </div>
          </div>

          <div>
            <p className="section-header">Ghi chú</p>
            <textarea
              className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-[#1C1C1E] placeholder-[#C7C7CC]
                         focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 resize-none border border-black/[0.04]"
              rows={3} placeholder="Ghi chú thêm..."
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </form>
      </div>
    </div>
  )
}
