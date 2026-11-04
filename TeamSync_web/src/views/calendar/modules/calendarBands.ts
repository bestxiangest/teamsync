import dayjs, { type Dayjs } from 'dayjs'
import type { CalendarEvent } from '@/api/calendar'

export interface CalendarBand {
  event: CalendarEvent
  startIndex: number
  endIndex: number
  lane: number
  continuesBefore: boolean
  continuesAfter: boolean
}

export function isMultiDayEvent(event: CalendarEvent): boolean {
  const start = dayjs(event.startTime)
  const end = dayjs(event.endTime || event.dueTime || event.startTime)
  if (!start.isValid() || !end.isValid()) return false
  return !start.isSame(end, 'day')
}

/**
 * 把跨天事件压缩成一周内的连续色块，并按重叠关系分配行（lane）。
 */
export function buildWeekBands(events: CalendarEvent[], weekStart: Dayjs): CalendarBand[] {
  const weekEnd = weekStart.add(6, 'day').startOf('day')
  const bands: CalendarBand[] = []

  for (const event of events) {
    if (!isMultiDayEvent(event)) continue

    const eventStart = dayjs(event.startTime).startOf('day')
    const eventEnd = dayjs(event.endTime || event.dueTime || event.startTime).startOf('day')
    if (!eventStart.isValid() || !eventEnd.isValid()) continue
    if (eventEnd.isBefore(weekStart, 'day') || eventStart.isAfter(weekEnd, 'day')) continue

    const startIndex = Math.max(0, eventStart.diff(weekStart, 'day'))
    const endIndex = Math.min(6, eventEnd.diff(weekStart, 'day'))
    if (startIndex > endIndex) continue

    bands.push({
      event,
      startIndex,
      endIndex,
      lane: 0,
      continuesBefore: eventStart.isBefore(weekStart, 'day'),
      continuesAfter: eventEnd.isAfter(weekEnd, 'day')
    })
  }

  bands.sort((first, second) => {
    if (first.startIndex !== second.startIndex) return first.startIndex - second.startIndex
    if (first.endIndex !== second.endIndex) return second.endIndex - first.endIndex
    return dayjs(first.event.startTime).valueOf() - dayjs(second.event.startTime).valueOf()
  })

  const laneEnds: number[] = []
  for (const band of bands) {
    let lane = laneEnds.findIndex((end) => end < band.startIndex)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(band.endIndex)
    } else {
      laneEnds[lane] = band.endIndex
    }
    band.lane = lane
  }

  return bands
}

export function countBandLanes(bands: CalendarBand[]): number {
  return bands.reduce((max, band) => Math.max(max, band.lane + 1), 0)
}

export function getBandAreaHeight(
  laneCount: number,
  laneHeight: number,
  laneGap: number,
  padding: number
): number {
  if (laneCount === 0) return 0
  return laneCount * laneHeight + (laneCount - 1) * laneGap + padding
}
