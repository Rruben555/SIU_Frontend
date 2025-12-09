import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const UkmKomentar = ({ ukmId, user, token }) => {
  const [komentar, setKomentar] = useState([]);
  const [newKomentar, setNewKomentar] = useState('');
  const [rating, setRating] = useState(5);
  const [loadingKomentar, setLoadingKomentar] = useState(false);
  
  // ✅ EDIT STATE
  const [editingId, setEditingId] = useState(null);
  const [editKomentar, setEditKomentar] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [loadingEdit, setLoadingEdit] = useState(false);
  
  const navigate = useNavigate();

  // Fetch komentar
  useEffect(() => {
    fetchKomentar();
  }, [ukmId]);

  const fetchKomentar = async () => {
    try {
      const response = await axios.get(`https://siu-backend-theta.vercel.app/ukm-komentar/${ukmId}`);
      setKomentar(response.data);
    } catch (error) {
      console.error('Error fetch komentar:', error);
    }
  };

  // ✅ HANDLE EDIT
  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditKomentar(item.komentar);
    setEditRating(item.rating);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditKomentar('');
    setEditRating(5);
  };

  // ✅ SUBMIT EDIT
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editKomentar.trim().length < 10) {
      toast.error('Komentar minimal 10 karakter!');
      return;
    }

    try {
      setLoadingEdit(true);
      toast.loading('Memperbarui komentar...', { id: 'edit-komentar' });
      
      await axios.put(`https://siu-backend-theta.vercel.app/ukm-komentar/${editingId}`, {
        komentar: editKomentar,
        rating: editRating
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('✅ Komentar diperbarui!', { id: 'edit-komentar' });
      setEditingId(null);
      setEditKomentar('');
      setEditRating(5);
      fetchKomentar(); // Refresh
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal update komentar', { id: 'edit-komentar' });
    } finally {
      setLoadingEdit(false);
    }
  };

  // Tambah komentar (sama seperti sebelumnya)
  const handleSubmitKomentar = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Login dulu untuk komen!');
      navigate('/login');
      return;
    }
    if (newKomentar.trim().length < 10) {
      toast.error('Komentar minimal 10 karakter!');
      return;
    }

    try {
      setLoadingKomentar(true);
      toast.loading('Mengirim komentar...', { id: 'komentar' });
      
      await axios.post(`https://siu-backend-theta.vercel.app/ukm-komentar/${ukmId}`, {
        komentar: newKomentar,
        rating
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('✅ Komentar berhasil!', { id: 'komentar' });
      setNewKomentar('');
      setRating(5);
      fetchKomentar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal tambah komentar', { id: 'komentar' });
    } finally {
      setLoadingKomentar(false);
    }
  };

  return (
    <div className="mt-12 p-8 bg-white rounded-3xl shadow-2xl">
      <h3 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
        💬 Komentar 
        <span className="ml-3 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-lg font-semibold">
          ({komentar.length})
        </span>
      </h3>

      {/* FORM KOMENTAR BARU */}
      {token ? (
        <form onSubmit={handleSubmitKomentar} className="bg-emerald-50 p-8 rounded-2xl mb-8 border-2 border-emerald-200">
          {/* Form sama seperti sebelumnya */}
          <div className="flex items-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4 shadow-lg">
              {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xl mb-1">{user?.nama}</h4>
              <div className="flex items-center space-x-1 mb-2">
                {[1,2,3,4,5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-all hover:scale-110 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <textarea
            value={newKomentar}
            onChange={(e) => setNewKomentar(e.target.value)}
            placeholder="Bagikan pengalaman Anda..."
            className="w-full p-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-400 min-h-[120px] text-lg"
          />
          
          <button
            type="submit"
            disabled={loadingKomentar || newKomentar.trim().length < 10}
            className="w-full mt-4 bg-emerald-600 text-white py-4 px-8 rounded-2xl font-bold text-xl hover:bg-emerald-700 disabled:opacity-50"
          >
            {loadingKomentar ? '⏳ Mengirim...' : '💬 Kirim Komentar'}
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 p-12 rounded-2xl text-center">
          <button onClick={() => navigate('/login')} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold">
            Login untuk Komen
          </button>
        </div>
      )}

      {/* LIST KOMENTAR */}
      <div className="space-y-6">
        {komentar.map((item) => (
          <div key={item.id} className="bg-gray-50 p-6 rounded-2xl border-l-4 border-emerald-400 hover:shadow-md">
            {editingId === item.id ? (
              /* ✅ EDIT FORM */
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                    {item.user_nama.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-lg">{item.user_nama}</h5>
                    <div className="flex space-x-1">
                      {[1,2,3,4,5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          className={`text-xl ${star <= editRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <textarea
                  value={editKomentar}
                  onChange={(e) => setEditKomentar(e.target.value)}
                  className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-yellow-400 min-h-[100px]"
                  rows="3"
                />
                
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={loadingEdit || editKomentar.trim().length < 10}
                    className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-yellow-600 disabled:opacity-50"
                  >
                    {loadingEdit ? '⏳' : '✅ Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-gray-600"
                  >
                    ❌ Batal
                  </button>
                </div>
              </form>
            ) : (
              /* ✅ NORMAL VIEW */
              <>
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
                    {item.user_nama.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-bold text-lg">{item.user_nama}</h5>
                      <span className="text-sm text-gray-500">({item.nim})</span>
                    </div>
                    <div className="flex space-x-1 mb-2">
                      {[1,2,3,4,5].map((star) => (
                        <span key={star} className={`text-xl ${star <= item.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-800 mb-4">{item.komentar}</p>
                
                {/* ✅ EDIT BUTTON - OWNER ONLY */}
                {token && user?.id == item.user_id && (
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UkmKomentar;
