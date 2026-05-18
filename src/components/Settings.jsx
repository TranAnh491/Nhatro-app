import { useState } from 'react'
import { Download, ChevronRight } from 'lucide-react'

function SettingRow({ label, sub, children }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-black/[0.05] last:border-0 first:rounded-t-2xl last:rounded-b-2xl">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1C1C1E]">{label}</p>
        {sub && <p className="text-xs text-[#8E8E93] mt-0.5">{sub}</p>}
      </div>
      <div className="flex-shrink-0 text-right">{children}</div>
    </div>
  )
}

export default function Settings({ settings, onSave }) {
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false) }

  const handleSave = () => {
    onSave({ ...form, defaultElectricPrice: Number(form.defaultElectricPrice), defaultWaterPrice: Number(form.defaultWaterPrice), defaultRentPrice: Number(form.defaultRentPrice) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const exportData = () => {
    const data = {
      rooms:    JSON.parse(localStorage.getItem('nhatro_rooms')    || '[]'),
      bills:    JSON.parse(localStorage.getItem('nhatro_bills')    || '[]'),
      settings: JSON.parse(localStorage.getItem('nhatro_settings') || '{}'),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `nhatro-backup-${new Date().toLocaleDateString('vi-VN').replace(/\//g,'-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const inlineInput = (key, props = {}) => (
    <input
      {...props}
      value={form[key]}
      onChange={e => set(key, e.target.value)}
      className="bg-transparent text-[#007AFF] font-semibold text-sm text-right focus:outline-none w-36 placeholder-[#C7C7CC]"
    />
  )

  return (
    <div className="px-4 pt-4 pb-28 space-y-5">

      {/* General */}
      <div>
        <p className="section-header">Thông tin chung</p>
        <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
          <SettingRow label="Tên nhà trọ">
            {inlineInput('buildingName', { placeholder: 'Dãy Nhà Trọ' })}
          </SettingRow>
        </div>
      </div>

      {/* Defaults */}
      <div>
        <p className="section-header">Giá mặc định khi tạo phòng</p>
        <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
          <SettingRow label="Tiền thuê" sub="₫ / tháng">
            {inlineInput('defaultRentPrice', { type: 'number', placeholder: '2500000' })}
          </SettingRow>
          <SettingRow label="Giá điện" sub="₫ / kWh">
            {inlineInput('defaultElectricPrice', { type: 'number' })}
          </SettingRow>
          <SettingRow label="Giá nước" sub="₫ / m³">
            {inlineInput('defaultWaterPrice', { type: 'number' })}
          </SettingRow>
        </div>
      </div>

      {/* Save button */}
      <button onClick={handleSave}
        className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 shadow-lg
          ${saved ? 'bg-[#34C759] text-white shadow-green-500/25' : 'bg-[#007AFF] text-white shadow-blue-500/25'}`}>
        {saved ? '✓ Đã lưu cài đặt' : 'Lưu cài đặt'}
      </button>

      {/* Data */}
      <div>
        <p className="section-header">Dữ liệu</p>
        <div className="rounded-2xl overflow-hidden border border-black/[0.04]">
          <button onClick={exportData}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white text-left rounded-2xl">
            <div className="w-9 h-9 gradient-blue rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/25">
              <Download size={17} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1C1C1E]">Xuất dữ liệu (JSON)</p>
              <p className="text-xs text-[#8E8E93]">Tải về file backup toàn bộ dữ liệu</p>
            </div>
            <ChevronRight size={16} className="text-[#C7C7CC]" />
          </button>
        </div>
        <p className="text-xs text-[#8E8E93] px-1 mt-2">
          Dữ liệu lưu trên trình duyệt (localStorage). Hãy xuất file để sao lưu thường xuyên.
        </p>
      </div>

      {/* App info */}
      <div className="text-center py-4">
        <p className="text-xs text-[#C7C7CC]">Quản Lý Nhà Trọ · v1.0</p>
        <p className="text-xs text-[#C7C7CC] mt-0.5">Built with ❤️ by Claude</p>
      </div>
    </div>
  )
}
