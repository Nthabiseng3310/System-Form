export interface Booking {
  id: string;
  treatmentId: string;
  treatmentName: string;
  durationMinutes: number;
  durationLabel: string;
  priceZAR: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (e.g. "10:00")
  endTime: string; // HH:MM (e.g. "11:30")
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  isCouples?: boolean;
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

const STORAGE_KEY_BOOKINGS = 'nthabis_touch_bookings_v2';
const STORAGE_KEY_BLOCKED = 'nthabis_touch_blocked_v2';

// Helper to convert HH:MM to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [hours, mins] = timeStr.split(':').map(Number);
  return hours * 60 + mins;
}

// Helper to convert minutes from midnight to HH:MM
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Calculate end time
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMins = timeToMinutes(startTime);
  return minutesToTime(startMins + durationMinutes);
}

// Get initial seed bookings so the calendar shows real-life availability
function getInitialBookings(): Booking[] {
  const today = new Date();
  const getOffsetDate = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    // If Sunday, shift to Monday
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'book-seed-1',
      treatmentId: 'aromatherapy-signature-luxe',
      treatmentName: 'Aromatherapy Signature Luxe Massage',
      durationMinutes: 90,
      durationLabel: '90 min',
      priceZAR: 1665,
      date: getOffsetDate(1),
      startTime: '10:00',
      endTime: '11:30',
      clientName: 'Sipho Khumalo',
      clientPhone: '082 555 4123',
      clientEmail: 'sipho.k@example.co.za',
      notes: 'Focus on lower back tension, medium pressure.',
      status: 'confirmed',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'book-seed-2',
      treatmentId: 'hot-stone-massage',
      treatmentName: 'Hot Stone Massage',
      durationMinutes: 60,
      durationLabel: '60 min',
      priceZAR: 880,
      date: getOffsetDate(2),
      startTime: '14:00',
      endTime: '15:00',
      clientName: 'Nadia Van Der Merwe',
      clientPhone: '071 889 9901',
      clientEmail: 'nadia.vdm@example.com',
      notes: 'No allergies. First time client.',
      status: 'confirmed',
      createdAt: new Date(Date.now() - 43200000).toISOString(),
    },
  ];
}

export function getAllBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (!stored) {
      const initial = getInitialBookings();
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(stored);
  } catch {
    return getInitialBookings();
  }
}

export function saveAllBookings(bookings: Booking[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Error saving bookings to localStorage', e);
  }
}

export function getAllBlockedSlots(): BlockedSlot[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_BLOCKED);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveAllBlockedSlots(slots: BlockedSlot[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BLOCKED, JSON.stringify(slots));
  } catch (e) {
    console.error('Error saving blocked slots', e);
  }
}

// All possible operating slot starts from 08:00 to 16:30 (in 30-min steps)
export const OPERATING_SLOTS: string[] = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30',
];

export const CLOSING_MINUTES = 17 * 60; // 17:00

// Check if a time slot is available on a given date for a treatment with durationMinutes
export function isSlotAvailable(
  date: string,
  startTime: string,
  durationMinutes: number,
  excludeBookingId?: string
): { available: boolean; reason?: string } {
  // 1. Check closing time (must finish by 17:00)
  const slotStartMins = timeToMinutes(startTime);
  const slotEndMins = slotStartMins + durationMinutes;

  if (slotEndMins > CLOSING_MINUTES) {
    return {
      available: false,
      reason: `Treatment runs past 17:00 studio closing time (finishes at ${minutesToTime(slotEndMins)}).`,
    };
  }

  // 2. Check blocked days/slots
  const blocked = getAllBlockedSlots();
  for (const b of blocked) {
    if (b.date === date) {
      if (b.allDay) {
        return { available: false, reason: b.reason || 'Studio is blocked out on this date.' };
      }
      if (b.startTime && b.endTime) {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        // Overlap condition: start < bEnd && end > bStart
        if (slotStartMins < bEnd && slotEndMins > bStart) {
          return { available: false, reason: b.reason || 'This time slot is reserved.' };
        }
      }
    }
  }

  // 3. Check existing active bookings (pending or confirmed)
  const bookings = getAllBookings();
  for (const b of bookings) {
    if (b.id === excludeBookingId) continue;
    if (b.status === 'cancelled') continue;
    if (b.date === date) {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      if (slotStartMins < bEnd && slotEndMins > bStart) {
        return { available: false, reason: 'Already reserved by another client.' };
      }
    }
  }

  return { available: true };
}

// Generate valid start time slots for a given date and duration
export function getAvailableSlots(date: string, durationMinutes: number): { time: string; available: boolean; reason?: string }[] {
  return OPERATING_SLOTS.map((time) => {
    const check = isSlotAvailable(date, time, durationMinutes);
    return {
      time,
      available: check.available,
      reason: check.reason,
    };
  });
}

// Create new booking
export function createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'status' | 'endTime'>): Booking {
  const endTime = calculateEndTime(data.startTime, data.durationMinutes);
  const availability = isSlotAvailable(data.date, data.startTime, data.durationMinutes);

  if (!availability.available) {
    throw new Error(availability.reason || 'Selected time slot is no longer available.');
  }

  const newBooking: Booking = {
    ...data,
    id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    endTime,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  const all = getAllBookings();
  all.push(newBooking);
  saveAllBookings(all);

  return newBooking;
}

// Update booking status
export function updateBookingStatus(id: string, status: 'confirmed' | 'cancelled' | 'pending'): Booking | null {
  const all = getAllBookings();
  const index = all.findIndex((b) => b.id === id);
  if (index === -1) return null;

  all[index].status = status;
  saveAllBookings(all);
  return all[index];
}

// Delete booking
export function deleteBooking(id: string): boolean {
  const all = getAllBookings();
  const filtered = all.filter((b) => b.id !== id);
  if (filtered.length === all.length) return false;
  saveAllBookings(filtered);
  return true;
}

// Block a day or time slot
export function addBlockedSlot(date: string, allDay: boolean, startTime?: string, endTime?: string, reason?: string): BlockedSlot {
  const blocked = getAllBlockedSlots();
  const newBlocked: BlockedSlot = {
    id: `block-${Date.now()}`,
    date,
    allDay,
    startTime: allDay ? undefined : startTime,
    endTime: allDay ? undefined : endTime,
    reason: reason || (allDay ? 'Studio Closed / Maintenance' : 'Time Blocked Out'),
  };
  blocked.push(newBlocked);
  saveAllBlockedSlots(blocked);
  return newBlocked;
}

export function removeBlockedSlot(id: string): boolean {
  const blocked = getAllBlockedSlots();
  const filtered = blocked.filter((b) => b.id !== id);
  if (filtered.length === blocked.length) return false;
  saveAllBlockedSlots(filtered);
  return true;
}
