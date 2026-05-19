import {
  collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'

// Đường dẫn: users/{uid}/rooms, users/{uid}/bills, users/{uid}/settings
const userCol  = (uid) => `users/${uid}`
const roomsCol = (uid) => collection(db, `users/${uid}/rooms`)
const billsCol = (uid) => collection(db, `users/${uid}/bills`)
const settingsDoc = (uid) => doc(db, `users/${uid}/settings/config`)

// ── Rooms ──────────────────────────────────────────────
export const subscribeRooms = (uid, callback) =>
  onSnapshot(roomsCol(uid), snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )

export const saveRoom = (uid, room) =>
  setDoc(doc(roomsCol(uid), room.id), room)

export const deleteRoom = async (uid, roomId) => {
  await deleteDoc(doc(roomsCol(uid), roomId))
}

// ── Bills ──────────────────────────────────────────────
export const subscribeBills = (uid, callback) =>
  onSnapshot(billsCol(uid), snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )

export const saveBill = (uid, bill) =>
  setDoc(doc(billsCol(uid), bill.id), bill)

// ── Settings ───────────────────────────────────────────
export const subscribeSettings = (uid, callback) =>
  onSnapshot(settingsDoc(uid), snap => {
    if (snap.exists()) callback(snap.data())
  })

export const saveSettings = (uid, settings) =>
  setDoc(settingsDoc(uid), settings)
