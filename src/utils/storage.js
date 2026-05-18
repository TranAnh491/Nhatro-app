const ROOMS_KEY = 'nhatro_rooms'
const BILLS_KEY = 'nhatro_bills'
const SETTINGS_KEY = 'nhatro_settings'

export const storage = {
  getRooms: () => JSON.parse(localStorage.getItem(ROOMS_KEY) || '[]'),
  saveRooms: (rooms) => localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms)),

  getBills: () => JSON.parse(localStorage.getItem(BILLS_KEY) || '[]'),
  saveBills: (bills) => localStorage.setItem(BILLS_KEY, JSON.stringify(bills)),

  getSettings: () => JSON.parse(localStorage.getItem(SETTINGS_KEY) || JSON.stringify({
    buildingName: 'Dãy Nhà Trọ',
    defaultElectricPrice: 3500,
    defaultWaterPrice: 15000,
    defaultRentPrice: 2500000,
  })),
  saveSettings: (s) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)),
}
