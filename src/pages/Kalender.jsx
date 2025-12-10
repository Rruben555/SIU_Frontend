import React, { useState, useEffect } from "react";
import axios from 'axios';

const days = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function Kalender() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedDate, setSelectedDate] = useState(null);
  const [kegiatan, setKegiatan] = useState([]);
  const [kegiatanData, setKegiatanData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✔ FETCH KEGIATAN DARI BACKEND
  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const res = await axios.get("https://siu-backend-theta.vercel.app/ukm");

        // Gabungkan kegiatan dari semua UKM
        const allEvents = res.data.flatMap((ukm) =>
          ukm.kegiatan.map((k) => ({
            ...k,
            ukm_nama: ukm.nama,
            tanggal: k.tanggal?.split("T")[0] // ✔ FIX format tanggal
          }))
        );

        setKegiatanData(allEvents);
      } catch (err) {
        console.error("Gagal fetch kegiatan:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchKegiatan();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const dates = [];
  for (let i = 0; i < firstDay; i++) dates.push(null);
  for (let i = 1; i <= totalDays; i++) dates.push(i);

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  // ✔ KLIK TANGGAL → TAMPILKAN KEGIATAN HARI ITU
  const handleDateClick = (day) => {
    if (!day) return;

    const m = (month + 1).toString().padStart(2, "0");
    const d = day.toString().padStart(2, "0");
    const fullDate = `${year}-${m}-${d}`;

    setSelectedDate(fullDate);

    // Filter kegiatan pada hari itu
    const eventToday = kegiatanData.filter((k) => k.tanggal === fullDate);

    setKegiatan(eventToday);
  };

  const closePanel = () => {
    setSelectedDate(null);
    setKegiatan([]);
  };

  if (loading)
    return (
      <div className="w-full text-center py-10 text-xl font-semibold text-gray-600">
        Memuat Kalender...
      </div>
    );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex justify-center items-start py-12 px-4">

      {/* KONTEN KALENDER */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">

        <div className="flex justify-between items-center mb-8">
          <button
            onClick={prevMonth}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl shadow"
          >
            ←
          </button>

          <h2 className="text-3xl font-serif italic text-emerald-600">
            {currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
          </h2>

          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl shadow"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 text-center font-semibold text-gray-700 mb-4">
          {days.map((d) => (
            <div key={d} className="py-2 text-sm">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {dates.map((date, i) => {
            const isToday =
              date &&
              date === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            // ✔ FIX: cek kegiatan (format sudah sama)
            const fullDate =
              date &&
              `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

            const hasEvent = kegiatanData.some((k) => k.tanggal === fullDate);

            return (
              <div
                key={i}
                onClick={() => handleDateClick(date)}
                className={`relative h-20 flex items-center justify-center rounded-xl border cursor-pointer transition
                  ${
                    date
                      ? isToday
                        ? "bg-emerald-600 text-white font-bold shadow-md"
                        : "bg-gray-50 hover:bg-emerald-100 border-emerald-200"
                      : "bg-transparent border-none cursor-default"
                  }
                `}
              >
                {date || ""}

                {/* ✔ INDICATOR DOT */}
                {hasEvent && (
                  <span className="absolute bottom-2 h-2 w-2 rounded-full bg-red-600 shadow-md"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL KEGIATAN */}
      {selectedDate && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-emerald-200 z-50 animate-slideLeft">
          <div className="p-5 border-b bg-emerald-600 text-white flex justify-between items-center">
            <h2 className="text-xl font-bold">
              Kegiatan<br />
              <span className="text-sm opacity-90">{selectedDate}</span>
            </h2>

            <button
              onClick={closePanel}
              className="text-white text-xl hover:scale-110 transition"
            >
              ✕
            </button>
          </div>

          <div className="p-5 overflow-y-auto h-full">
            {kegiatan.length === 0 ? (
              <p className="text-gray-500 italic">Tidak ada kegiatan.</p>
            ) : (
              <ul className="space-y-4">
                {kegiatan.map((k, idx) => (
                  <li
                    key={idx}
                    className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm"
                  >
                    <p className="font-bold text-emerald-700">{k.nama}</p>
                    <p className="text-sm text-gray-600 italic">UKM: {k.ukm_nama}</p>

                    {k.deskripsi && (
                      <p className="text-sm mt-1">{k.deskripsi}</p>
                    )}

                    {k.link_wa && (
                      <a
                        href={k.link_wa}
                        target="_blank"
                        className="block text-blue-600 underline mt-1"
                      >
                        Join WA
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ANIMASI PANEL */}
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideLeft {
          animation: slideLeft 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Kalender;
