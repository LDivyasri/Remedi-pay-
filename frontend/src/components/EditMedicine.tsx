import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPut } from '../utils/api';

export function EditMedicine() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userProfile, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    expiry_date: ''
  });

  useEffect(() => {
    if (!accessToken || !id) return;
    fetchMedicine();
  }, [accessToken, id]);

  const fetchMedicine = async () => {
    try {
      const med = await apiGet<any>(`/medicines/${id}`, accessToken);
      setForm({
        name: med.name || '',
        description: med.description || '',
        category: med.category || '',
        price: String(med.price ?? ''),
        quantity: String(med.quantity ?? ''),
        expiry_date: med.expiry_date ? new Date(med.expiry_date).toISOString().slice(0, 10) : ''
      });
    } catch (e: any) {
      setError(e.message || 'Failed to load medicine');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price: form.price ? Number(form.price) : undefined,
        quantity: form.quantity ? Number(form.quantity) : undefined,
        expiry_date: form.expiry_date || undefined,
      };
      await apiPut(`/medicines/${id}`, body, accessToken);
      navigate('/medicines');
    } catch (e: any) {
      setError(e.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (userProfile?.role !== 'seller') {
    navigate('/dashboard');
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Medicine</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input name="name" value={form.name} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input name="category" value={form.category} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input type="number" name="price" value={form.price} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input type="number" name="quantity" value={form.quantity} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input type="date" name="expiry_date" value={form.expiry_date} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={() => navigate('/medicines')} className="px-4 py-2 border rounded-md">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}


