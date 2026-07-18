import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, Plus, Trash2 } from "lucide-react";
import { tutorApi, type AvailabilitySlot } from "../../api/services";
import { useAuth } from "../../providers/AuthProvider";

const DAY_LABELS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const TIME_OPTIONS = Array.from({ length: 33 }, (_, index) => {
  const minutes = 7 * 60 + index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

type EditableSlot = AvailabilitySlot & { clientId: string };

function createClientId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeTime(value: string) {
  return value.slice(0, 5);
}

function overlaps(first: Pick<AvailabilitySlot, "startTime" | "endTime">, second: Pick<AvailabilitySlot, "startTime" | "endTime">) {
  return first.startTime < second.endTime && second.startTime < first.endTime;
}

function slotError(slot: EditableSlot, slots: EditableSlot[]) {
  if (slot.endTime <= slot.startTime) {
    return "Bitiş saati başlangıçtan sonra olmalı.";
  }
  const hasOverlap = slots.some(
    (other) => other.clientId !== slot.clientId && other.dayOfWeek === slot.dayOfWeek && overlaps(slot, other),
  );
  return hasOverlap ? "Bu saat aralığı aynı gündeki başka bir aralıkla çakışıyor." : undefined;
}

function findNewRange(daySlots: EditableSlot[]) {
  const preferredRanges = [
    { startTime: "09:00", endTime: "12:00" },
    { startTime: "13:00", endTime: "18:00" },
    { startTime: "18:00", endTime: "20:00" },
    { startTime: "07:00", endTime: "09:00" },
  ];
  const preferred = preferredRanges.find((candidate) => !daySlots.some((slot) => overlaps(candidate, slot)));
  if (preferred) return preferred;

  for (let index = 0; index < TIME_OPTIONS.length - 2; index += 1) {
    const candidate = { startTime: TIME_OPTIONS[index], endTime: TIME_OPTIONS[index + 2] };
    if (!daySlots.some((slot) => overlaps(candidate, slot))) return candidate;
  }
  return undefined;
}

function apiErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "Müsaitlik takvimi kaydedilemedi. Lütfen tekrar deneyin.";
}

export function TutorAvailabilityEditor() {
  const { refreshUser } = useAuth();
  const [slots, setSlots] = useState<EditableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    tutorApi.getMyAvailability()
      .then(({ data }) => {
        if (!active) return;
        setSlots(data
          .filter((slot) => slot.isActive !== false)
          .map((slot) => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: normalizeTime(slot.startTime),
            endTime: normalizeTime(slot.endTime),
            clientId: slot.id || createClientId(),
          })));
      })
      .catch(() => {
        if (active) setError("Müsaitlik bilgileri yüklenemedi. Sayfayı yenileyip tekrar deneyin.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const activeDayCount = useMemo(() => new Set(slots.map((slot) => slot.dayOfWeek)).size, [slots]);
  const hasValidationError = slots.some((slot) => Boolean(slotError(slot, slots)));

  const addRange = (dayOfWeek: number) => {
    const range = findNewRange(slots.filter((slot) => slot.dayOfWeek === dayOfWeek));
    if (!range) {
      setError(`${DAY_LABELS[dayOfWeek]} için eklenebilecek boş bir saat aralığı kalmadı.`);
      return;
    }
    setSlots((current) => [...current, { dayOfWeek, ...range, clientId: createClientId() }]);
    setSaved(false);
    setError("");
  };

  const updateRange = (clientId: string, field: "startTime" | "endTime", value: string) => {
    setSlots((current) => current.map((slot) => (
      slot.clientId === clientId ? { ...slot, [field]: value } : slot
    )));
    setSaved(false);
    setError("");
  };

  const removeRange = (clientId: string) => {
    setSlots((current) => current.filter((slot) => slot.clientId !== clientId));
    setSaved(false);
    setError("");
  };

  const save = async () => {
    if (hasValidationError) {
      setError("Kaydetmeden önce çakışan veya geçersiz saat aralıklarını düzeltin.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = slots
        .map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }))
        .sort((first, second) => first.dayOfWeek - second.dayOfWeek || first.startTime.localeCompare(second.startTime));
      const { data } = await tutorApi.updateMyAvailability(payload);
      await refreshUser();
      setSlots(data.map((slot) => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: normalizeTime(slot.startTime),
        endTime: normalizeTime(slot.endTime),
        clientId: slot.id || createClientId(),
      })));
      setSaved(true);
    } catch (saveError) {
      setError(apiErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-5" aria-labelledby="availability-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" aria-hidden="true" />
            <h3 id="availability-heading" className="font-extrabold text-stone-900 text-lg">Haftalık Müsaitlik</h3>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-1 max-w-xl">
            Ders verebildiğiniz saatleri gün gün ekleyin. Bu program her hafta tekrar eder ve öğrenciler yalnızca bu aralıklarda ders talep edebilir.
          </p>
        </div>
        {!loading && (
          <div className="shrink-0 rounded-2xl bg-stone-50 border border-stone-100 px-3 py-2 text-xs font-bold text-stone-600">
            {slots.length === 0 ? "Program boş" : `${activeDayCount} gün · ${slots.length} saat aralığı`}
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center text-sm font-semibold text-stone-500">
          Müsaitlik takvimi yükleniyor…
        </div>
      ) : (
        <div className="space-y-3">
          {DAY_LABELS.map((day, dayOfWeek) => {
            const daySlots = slots
              .filter((slot) => slot.dayOfWeek === dayOfWeek)
              .sort((first, second) => first.startTime.localeCompare(second.startTime));
            return (
              <div key={day} className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-stone-800">{day}</h4>
                    <p className={`text-[11px] font-semibold mt-0.5 ${daySlots.length ? "text-emerald-600" : "text-stone-400"}`}>
                      {daySlots.length ? `${daySlots.length} müsaitlik aralığı` : "Bu gün müsait değilsiniz"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addRange(dayOfWeek)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-white px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
                    aria-label={`${day} gününe saat aralığı ekle`}
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Saat ekle
                  </button>
                </div>

                {daySlots.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {daySlots.map((slot) => {
                      const currentError = slotError(slot, slots);
                      return (
                        <div key={slot.clientId}>
                          <div className="grid grid-cols-[1fr_auto_1fr_auto] items-end gap-2 rounded-xl bg-white border border-stone-200 p-3">
                            <label className="text-[10px] font-extrabold uppercase tracking-wide text-stone-400">
                              Başlangıç
                              <select
                                value={slot.startTime}
                                onChange={(event) => updateRange(slot.clientId, "startTime", event.target.value)}
                                className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-sm font-bold text-stone-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                              >
                                {TIME_OPTIONS.map((time) => <option key={time} value={time}>{time}</option>)}
                              </select>
                            </label>
                            <span className="pb-2.5 text-xs font-bold text-stone-400">–</span>
                            <label className="text-[10px] font-extrabold uppercase tracking-wide text-stone-400">
                              Bitiş
                              <select
                                value={slot.endTime}
                                onChange={(event) => updateRange(slot.clientId, "endTime", event.target.value)}
                                className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-sm font-bold text-stone-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                              >
                                {TIME_OPTIONS.map((time) => <option key={time} value={time}>{time}</option>)}
                              </select>
                            </label>
                            <button
                              type="button"
                              onClick={() => removeRange(slot.clientId)}
                              className="mb-0.5 rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              aria-label={`${day} ${slot.startTime}-${slot.endTime} aralığını kaldır`}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                          {currentError && (
                            <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600">
                              <AlertCircle className="w-3 h-3" aria-hidden="true" /> {currentError}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {slots.length === 0 && !loading && !error && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs font-semibold text-amber-800">
          <Clock3 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          Takviminiz boş. Öğrencilerin ders saati seçebilmesi için en az bir güne saat aralığı ekleyin.
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 p-3 text-xs font-semibold text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" /> {error}
        </div>
      )}
      {saved && !error && (
        <div role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-bold text-emerald-700">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Haftalık müsaitlik takviminiz kaydedildi.
        </div>
      )}

      <button
        type="button"
        onClick={save}
        disabled={loading || saving || hasValidationError}
        className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        {saving ? "Takvim kaydediliyor…" : "Haftalık Takvimi Kaydet"}
      </button>
    </section>
  );
}
