export interface TimeRange {
  startTime: string;
  endTime: string;
}

export const HALF_HOUR_TIME_SLOTS = Array.from({ length: 33 }, (_, index) => {
  const minutes = 7 * 60 + index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

function normalizeTime(value: string) {
  return value.slice(0, 5);
}

export function getSelectableTimeSlots({
  mode,
  selectedStart,
  timeRanges,
}: {
  mode: "start" | "end";
  selectedStart?: string | null;
  timeRanges?: TimeRange[];
}) {
  const start = selectedStart ? normalizeTime(selectedStart) : null;
  const ranges = timeRanges?.map((range) => ({
    startTime: normalizeTime(range.startTime),
    endTime: normalizeTime(range.endTime),
  }));

  if (mode === "end" && !start) return [];

  return HALF_HOUR_TIME_SLOTS.filter((time) => {
    if (mode === "end" && start && time <= start) return false;
    if (!ranges?.length) return true;

    if (mode === "start") {
      return ranges.some((range) => time >= range.startTime && time < range.endTime);
    }

    return ranges.some((range) => (
      start !== null
      && start >= range.startTime
      && start < range.endTime
      && time > start
      && time <= range.endTime
    ));
  });
}
