import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../App';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);
  
  // ✅ NEW STATES
  const [registrations, setRegistrations] = useState([]);
  const [ukmTerdaftar, setUkmTerdaftar] = useState([]);
  const [kegiatanIkut, setKegiatanIkut] = useState([]);
  const [profileComplete, setProfileComplete] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quickRegisterOpen, setQuickRegisterOpen] = useState(false);
  const [selectedUkm, setSelectedUkm] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        navigate('/login');
        return;
      }

      // ✅ 1. GET REGISTRATIONS USER
      const regRes = await axios.get('/pendaftar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // ✅ 2. GET ALL UKM
      const ukmRes = await axios.get('/ukm');
      
      setRegistrations(regRes.data);
      
      // ✅ UKM TERDAFTAR (accepted anggota)
      const acceptedAnggota = regRes.data.filter(r => 
        r.type === 'anggota' && r.status === 'accepted'
      );
      setUkmTerdaftar(acceptedAnggota.map(r => 
        ukmRes.data.find(u => u.id === r.ukm_id)
      ).filter(Boolean));
      
      // ✅ KEGIATAN IKUT (accepted kegiatan)
      const acceptedKegiatan = regRes.data.filter(r => 
        r.type === 'kegiatan' && r.status === 'accepted'
      );
      setKegiatanIkut(acceptedKegiatan);

      // ✅ PROGRESS PROFIL
      const fields = ['nama', 'nim', 'email', 'fakultas'];
      const completeFields = fields.filter(field => user[field]);
      setProfileComplete(Math.round((completeFields.length / fields.length) * 100));
      
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  // ✅ QUICK DAFTAR UKM
  const handleQuickRegister = async (ukmId, type = 'anggota') => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/pendaftar', { ukm_id: ukmId, type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`✅ Berhasil daftar ${type === 'anggota' ? 'UKM' : 'kegiatan'}! Menunggu approve admin`);
      setQuickRegisterOpen(false);
      fetchProfileData(); // Refresh
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal daftar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* ✅ HEADER + PROGRESS BAR */}
        <div className="bg-white shadow-2xl rounded-3xl p-12 mb-12 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl border-6 border-white relative overflow-hidden">
              <span className="text-4xl font-bold text-white drop-shadow-lg">
                {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
              </span>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold text-white border-4 border-white shadow-lg">
                {ukmTerdaftar.length}
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-4">
            {user?.nama || 'Nama Pengguna'}
          </h1>
          
          <div className="text-2xl text-gray-600 mb-8">{user?.nim || 'NIM'}</div>
          
          {/* PROGRESS BAR */}
          <div className="mb-8">
            <div className="flex justify-between text-lg text-gray-600 mb-4">
              <span>Lengkapi Profil</span>
              <span>{profileComplete}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-4 rounded-full shadow-lg transition-all duration-1000"
                style={{ width: `${profileComplete}%` }}
              ></div>
            </div>
            {profileComplete < 100 && (
              <p className="text-sm text-gray-500 mt-2">
                Lengkapi {['fakultas', 'nim'][profileComplete / 25 | 0]} untuk 100% ✅
              </p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          
          {/* ✅ UKM TERDAFTAR */}
          <div className="bg-white shadow-2xl rounded-3xl p-10">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mr-4 shadow-lg">
                🏛️
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">UKM Terdaftar</h2>
                <p className="text-emerald-600 font-semibold">{ukmTerdaftar.length} UKM</p>
              </div>
            </div>
            
            {ukmTerdaftar.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-6xl mb-4">🏜️</div>
                <h3 className="text-2xl font-bold mb-2">Belum ada UKM</h3>
                <button 
                  onClick={() => setQuickRegisterOpen(true)}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:bg-emerald-700 shadow-xl mt-6 transition-all hover:scale-105"
                >
                  🚀 Daftar UKM Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {ukmTerdaftar.map(ukm => (
                  <div key={ukm.id} className="group bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200 hover:shadow-xl transition-all hover:-translate-y-1">
                    {ukm.gambar && (
                      <img src={ukm.gambar} alt={ukm.nama} className="w-20 h-20 object-cover rounded-xl mb-4 group-hover:scale-110 transition-transform" />
                    )}
                    <h4 className="font-bold text-xl mb-2">{ukm.nama}</h4>
                    <p className="text-gray-600 mb-4 line-clamp-2">{ukm.deskripsi}</p>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                        {ukm.anggota?.length || 0} anggota
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {ukm.kegiatan?.length || 0} kegiatan
                      </span>
                    </div>
                    {ukm.wa_group && (
                      <a href={`https://wa.me/${ukm.wa_group}`} 
                        className="inline-block bg-green-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-600 transition-all"
                        target="_blank" rel="noopener noreferrer"
                      >
                        📱 WA Group
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ✅ KEGIATAN IKUT + NOTIFIKASI */}
          <div className="bg-white shadow-2xl rounded-3xl p-10">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mr-4 shadow-lg">
                🎯
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Kegiatan & Notifikasi</h2>
                <p className="text-orange-600 font-semibold">
                  {kegiatanIkut.length} kegiatan |{' '}
                  {registrations.filter(r => r.status === 'pending').length} pending
                </p>
              </div>
            </div>

            {/* NOTIFIKASI PENDING */}
            {registrations.filter(r => r.status === 'pending').length > 0 && (
              <div className="mb-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
                <h4 className="font-bold text-xl mb-4 text-yellow-800">⏳ Menunggu Approve</h4>
                <div className="space-y-3">
                  {registrations.filter(r => r.status === 'pending').map(reg => (
                    <div key={reg.id} className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-2xl">⏳</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{reg.ukm_nama}</div>
                        <div className="text-sm text-gray-600">{reg.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-yellow-700 font-semibold">Pending</div>
                        <div className="text-xs text-gray-500">Admin review</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KEGIATAN SUDAH DIJADI */}
            <div className="space-y-4">
              <h4 className="font-bold text-xl mb-4 text-gray-800">✅ Kegiatan Sudah Ikut</h4>
              {kegiatanIkut.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📭</div>
                  <p>Belum ada kegiatan</p>
                </div>
              ) : (
                kegiatanIkut.map(reg => (
                  <div key={reg.id} className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
                    <div className="flex-1">
                      <div className="font-semibold">{reg.ukm_nama}</div>
                      <div className="text-sm text-gray-600">Kegiatan: {reg.kegiatan_nama}</div>
                    </div>
                    <span className="px-4 py-2 bg-green-200 text-green-800 rounded-full text-sm font-bold">
                      ✅ Approved
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ✅ QUICK REGISTER MODAL */}
        {quickRegisterOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-3xl p-10 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-3xl font-bold mb-8 text-gray-800 text-center">🚀 Daftar Cepat</h3>
              
              <div className="space-y-4 mb-8">
                <h4 className="font-bold text-xl mb-4">Pilih UKM:</h4>
                {/* TODO: Fetch all UKM list */}
                <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {[/* Mock data - replace with real API */].map(ukm => (
                    <button 
                      key={ukm.id}
                      onClick={() => handleQuickRegister(ukm.id)}
                      className="p-6 bg-gradient-to-br from-emerald-500 to-green-500 text-white rounded-2xl font-bold hover:from-emerald-600 hover:to-green-600 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-center"
                    >
                      <div className="text-2xl mb-2">{ukm.emoji}</div>
                      <div className="text-sm">{ukm.nama}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setQuickRegisterOpen(false)}
                className="w-full bg-gray-500 text-white py-4 px-8 rounded-2xl font-bold hover:bg-gray-600 transition-all"
              >
                ❌ Batal
              </button>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="grid md:grid-cols-3 gap-6 pt-12 border-t-4 border-emerald-100 bg-white rounded-3xl p-12 mt-12">
          <button 
            onClick={() => setQuickRegisterOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold py-8 px-12 rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all text-xl"
          >
            🚀 Daftar UKM Baru
          </button>
          <button 
            onClick={() => navigate('/kegiatan')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-8 px-12 rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all text-xl"
          >
            🎯 Cari Kegiatan
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-8 px-12 rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all text-xl"
          >
            🏠 Kembali Home
          </button>
        </div>

        {/* LOGOUT */}
        <div className="text-center mt-16">
          <button 
            onClick={() => {
              localStorage.clear();
              toast.success('Logout berhasil');
              navigate('/login');
            }}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-12 rounded-3xl shadow-xl hover:shadow-2xl hover:from-red-600 hover:to-red-700 transition-all text-xl"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
