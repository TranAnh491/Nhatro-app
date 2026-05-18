import { useState, useEffect } from 'react'
import { X, Save, ChevronRight } from 'lucide-react'
import { today } from '../utils/helpers'

const EMPTY = {
  number: '', tenantName: '', tenantPhone: '',
  rentPrice: '', electricPrice: 3500, waterPrice: 15000,
  deposit: '', contractStart: today(), contractEnd: '',
  status: 'occupied', notes: '',
}

function FieldRow({ label, children }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-black/[0.05] last:border-0">
      <p className="text-sm text-[#1C1C1E] w-28 flex-shrink-0 font-medium">{label}</p>
      <div className="flex-1 text-right">{children}</div>
    </div>
  )
}

export default function RoomForm({ room, settings, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (room) {
      setForm({ ...EMPTY, ...room })
    } else {
      setForm({
        ...EMPTY,
        electricPrice: settings?.defaultElectricPrice ?? 3500,
        waterPrice:    settings?.defaultWaterPrice    ?? 15000,
        rentPrice:     settings?.defaultRentPrice     ?? '',
      })
    }
  }, [room, settings])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.number.trim()) return alert('Vui lòng nhập số phòng')
    onSave({
      ...form,
      rentPrice:     Number(form.rentPrice)     || 0,
      electricPrice: Number(form.electricPrice) || 0,
      waterPrice:    Number(form.waterPrice)    || 0,
      deposit:       Number(form.deposit)       || 0,
    })
  }

  const inlineInput = (props) => (
    <input {...props} className="text-right bg-transparent text-sm text-[#007AFF] font-medium
      placeholder-[#C7C7CC] focus:outline-none w-full" />
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[430px] bg-[#F2F2F7] rounded-t-[28px] max-h-[92vh] overflow-hidden slide-up flex flex-col">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-12 h-1 bg-[#D1D1D6] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
          <button onClick={onClose} className="text-[#007AFF] text-base font-medium">Huỷ</button>
          <h2 className="font-bold text-base">{room ? 'Sửa phòng' : 'Thêm phòng'}</h2>
          <button onClick={handleSubmit} className="text-[#007AFF] text-base font-semibold">Lưu</button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-4 pb-8 space-y-5">

          {/* Basic info */}
          <div>
            <p className="section-header">Thông tin phòng</p>
            <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
              <FieldRow label="Số phòng">
                {inlineInput({ placeholder: 'P01', value: form.number, onChange: e => set('number', e.target.value) })}
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

          {/* Tenant */}
          <div>
            <p className="section-header">Người thuê</p>
            <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
              <FieldRow label="Họ tên">
                {inlineInput({ placeholder: 'Nguyễn Văn A', value: form.tenantName, onChange: e => set('tenantName', e.target.value) })}
              </FieldRow>
              <FieldRow label="Số điện thoại">
                {inlineInput({ type: 'tel', placeholder: '0901 234 567', value: form.tenantPhone, onChange: e => set('tenantPhone', e.target.value) })}
              </FieldRow>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="section-header">Giá cả</p>
            <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
              <FieldRow label="Tiền thuê/tháng">
                {inlineInput({ type: 'number', placeholder: '2.500.000', value: form.rentPrice, onChange: e => set('rentPrice', e.target.value) })}
              </FieldRow>
              <FieldRow label="Giá điện (₫/kWh)">
                {inlineInput({ type: 'number', value: form.electricPrice, onChange: e => set('electricPrice', e.target.value) })}
              </FieldRow>
              <FieldRow label="Giá nước (₫/m³)">
                {inlineInput({ type: 'number', value: form.waterPrice, onChange: e => set('waterPrice', e.target.value) })}
              </FieldRow>
              <FieldRow label="Đặt cọc (₫)">
                {inlineInput({ type: 'number', placeholder: '5.000.000', value: form.deposit, onChange: e => set('deposit', e.target.value) })}
              </FieldRow>
            </div>
          </div>

          {/* Contract */}
          <div>
            <p className="section-header">Hợp đồng</p>
            <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
              <FieldRow label="Ngày bắt đầu">
                {inlineInput({ type: 'date', value: form.contractStart, onChange: e => set('contractStart', e.target.value) })}
              </FieldRow>
              <FieldRow label="Ngày kết thúc">
                {inlineInput({ type: 'date', value: form.contractEnd, onChange: e => set('contractEnd', e.target.value) })}
              </FieldRow>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="section-header">Ghi chú</p>
            <textarea
              className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-[#1C1C1E] placeholder-[#C7C7CC]
                         focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 resize-none border border-black/[0.04]"
              rows={3} placeholder="Ghi chú thêm về phòng hoặc người thuê..."
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </form>
      </div>
    </div>
  )
}
