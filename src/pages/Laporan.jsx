import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

/* =======================
   METODE BARU (TAMBAHAN)
   ======================= */
const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) return 'Rp. 0';

  return (
    'Rp. ' +
    Number(angka)
      .toLocaleString('id-ID')
  );
};

function Laporan() {
  const [laporanData, setLaporanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          'https://siu-backend-theta.vercel.app/ukm'
        );
        setLaporanData(response.data);
      } catch (err) {
        console.error('Error fetching laporan:', err);
        setError('Gagal memuat data laporan');
        toast.error('Gagal memuat laporan UKM');
      } finally {
        setLoading(false);
      }
    };

    fetchLaporan();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-xl">Memuat laporan UKM...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 text-xl mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          Laporan UKM
        </h1>
        <p className="text-xl text-gray-600">
          Ringkasan kegiatan dan biaya per UKM
        </p>
      </div>

      {laporanData.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-500 mb-4">
            Belum ada laporan UKM tersedia
          </p>
        </div>
      ) : (
        laporanData.map((ukm) => (
          <div key={ukm.id} className="mb-16">
            <div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-2xl">
              <div>
                <h2
                  onClick={() => navigate(`/ukm/${ukm.id}`)}
                  className="text-2xl font-semibold cursor-pointer hover:underline"
                >
                  {ukm.nama}
                </h2>
                <p className="opacity-90">
                  {ukm.laporan?.length || 0} Laporan Tersedia
                </p>
              </div>

              {ukm.laporan && ukm.laporan.length > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-300">
                    Total Peserta:{' '}
                    {ukm.laporan.reduce(
                      (sum, lap) => sum + Number(lap.peserta || 0),
                      0
                    )}
                  </p>
                  <p className="text-lg opacity-90">
                    Total Biaya:{' '}
                    {formatRupiah(
                      ukm.laporan.reduce(
                        (sum, lap) => sum + Number(lap.biaya || 0),
                        0
                      )
                    )}
                  </p>
                </div>
              )}
            </div>

            {ukm.laporan && ukm.laporan.length > 0 ? (
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <table className="w-full">
                  <thead>
                    <tr className="bg-indigo-600 text-white">
                      <th className="px-6 py-4 text-left">Kegiatan</th>
                      <th className="px-6 py-4 text-left">Peserta</th>
                      <th className="px-6 py-4 text-left">Biaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ukm.laporan.map((lap, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-6 py-4">{lap.kegiatan}</td>
                        <td className="px-6 py-4">{lap.peserta}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-600">
                          {formatRupiah(lap.biaya)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}

export default Laporan;
