import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

// Tất cả thiết bị dùng chung 1 đường dẫn cố định
const roomsCol   = collection(db, 'nhatro/data/rooms')
const billsCol   = collection(db, 'nhatro/data/bills')
const settingDoc = doc(db, 'nhatro/data/settings/config')

export const subscribeRooms = (callback) =>
  onSnapshot(roomsCol, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))

export const saveRoom = (room) =>
  setDoc(doc(roomsCol, room.id), room)

export const deleteRoom = (roomId) =>
  deleteDoc(doc(roomsCol, roomId))

export const subscribeBills = (callback) =>
  onSnapshot(billsCol, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))

export const saveBill = (bill) =>
  setDoc(doc(billsCol, bill.id), bill)

export const subscribeSettings = (callback) =>
  onSnapshot(settingDoc, snap => { if (snap.exists()) callback(snap.data()) })

export const saveSettings = (settings) =>
  setDoc(settingDoc, settings)
