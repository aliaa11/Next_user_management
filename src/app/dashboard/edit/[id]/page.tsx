'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getUser, updateUser, getCurrentUser } from '@/lib/api';
import Link from 'next/link';

export default function EditUserPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  } as {
    name: string;
    email: string;
    password?: string;
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [currentUser, setCurrentUser] = useState<any>(null);

useEffect(() => {
  const load = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      setError('Failed to get current user');
    }
  };
  load();
}, []);

useEffect(() => {
  if (currentUser) {
    fetchUser();
  }
}, [currentUser, userId]);

const fetchUser = async () => {
  try {
    const response = await getUser(userId);
    const user = response.user || response;

    const isAdmin = currentUser?.role === 'admin';
    const isOwner = String(currentUser?.id) === userId;

    if (!isAdmin && !isOwner) {
      setError('You can only edit your own profile');
      return;
    }

    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
    });
  } catch (err: any) {
    setError(err.message);
  } finally {
    setFetchLoading(false);
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { password, ...updateData } = formData;
      const finalData = password ? formData : updateData;
      await updateUser(userId, finalData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (fetchLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-black">Edit Profile</h1>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-500"
            >
              Back to Dashboard
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password (leave blank to keep current)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
 
