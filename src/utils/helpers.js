export const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

export const fmtNum = (n) => new Intl.NumberFormat('vi-VN').format(n || 0)

export const calcBill = (bill) => {
  const electric = Math.max(0, (bill.electricEnd - bill.electricStart)) * (bill.electricPrice || 0)
  const water = Math.max(0, (bill.waterEnd - bill.waterStart)) * (bill.waterPrice || 0)
  const rent = bill.rentPrice || 0
  const other = bill.otherFees || 0
  return { electric, water, rent, other, total: electric + water + rent + other }
}

export const monthLabel = (month, year) => `Tháng ${String(month).padStart(2,'0')}/${year}`

export const today = () => new Date().toISOString().slice(0, 10)

export const contractStatus = (endDate) => {
  if (!endDate) return 'none'
  const diff = (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'expired'
  if (diff <= 30) return 'expiring'
  return 'ok'
}

export const getCurrentMonth = () => {
  const d = new Date()
  return { month: d.getMonth() + 1, year: d.getFullYear() }
}
