import React, { useState, useEffect } from 'react';
import { HelperProfile, JobPost } from '../types';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'helpers' | 'jobs' | 'users'>('helpers');
    const [helpers, setHelpers] = useState<HelperProfile[]>([]);
    const [jobs, setJobs] = useState<JobPost[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ helpers: 0, jobs: 0, users: 0 });

    useEffect(() => {
        fetchData();
        fetchStats();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const hRes = await fetch('/api/helpers?admin=true');
            const jRes = await fetch('/api/jobs?admin=true');
            const uRes = await fetch('/api/users');
            const hData = await hRes.json();
            const jData = await jRes.json();
            const uData = await uRes.json();
            setStats({
                helpers: hData.length,
                jobs: jData.length,
                users: uData.length
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = `/api/${activeTab}${activeTab !== 'users' ? '?admin=true' : ''}`;
            const response = await fetch(endpoint);
            const data = await response.json();
            if (activeTab === 'helpers') setHelpers(data);
            else if (activeTab === 'jobs') setJobs(data);
            else if (activeTab === 'users') setUsers(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserAccess = async (user: any, field: 'canViewHelpers' | 'canViewJobs') => {
        const newValue = user[field] === 1 || user[field] === true ? 0 : 1;
        try {
            await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...user, [field]: newValue })
            });
            fetchData();
        } catch (error) {
            console.error('Error updating user access:', error);
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data: any = Object.fromEntries(formData.entries());

        // Basic parsing for arrays/numbers/checkboxes
        if (data.salary) data.salary = Number(data.salary);
        if (data.age) data.age = Number(data.age);
        if (data.skills) data.skills = data.skills.split(',').map((s: string) => s.trim());
        if (data.languages) data.languages = data.languages.split(',').map((s: string) => s.trim());
        if (data.requirements) data.requirements = data.requirements.split(',').map((s: string) => s.trim());

        // Handle checkboxes for users
        if (activeTab === 'users') {
            data.canViewHelpers = formData.get('canViewHelpers') !== null;
            data.canViewJobs = formData.get('canViewJobs') !== null;
        }

        try {
            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem ? `/api/${activeTab}/${editingItem.id}` : `/api/${activeTab}`;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setIsModalOpen(false);
                setEditingItem(null);
                fetchData();
                fetchStats();
            }
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    const renderHelpers = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">Nationality</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {helpers.map(helper => (
                        <tr key={helper.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-medium text-gray-900">{helper.name}</td>
                            <td className="px-6 py-4 text-gray-600">{helper.nationality}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${helper.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    helper.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {helper.status?.toUpperCase() || 'PENDING'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-3 text-xs">
                                {helper.status !== 'approved' && (
                                    <button
                                        onClick={async () => {
                                            await fetch(`/api/helpers/${helper.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ ...helper, status: 'approved' })
                                            });
                                            fetchData();
                                        }}
                                        className="text-white bg-green-600 hover:bg-green-700 font-semibold px-2 py-1 rounded transition"
                                    > Approve </button>
                                )}
                                <button onClick={() => { setEditingItem(helper); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 font-semibold px-3 py-1 bg-indigo-50 rounded-full transition">Edit</button>
                                <button onClick={() => handleDelete(helper.id)} className="text-red-600 hover:text-red-900 font-semibold px-3 py-1 bg-red-50 rounded-full transition text-right">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderJobs = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {jobs.map(job => (
                        <tr key={job.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                            <td className="px-6 py-4 text-gray-600">{job.location}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${job.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    job.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {job.status?.toUpperCase() || 'PENDING'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-3 text-xs">
                                {job.status !== 'approved' && (
                                    <button
                                        onClick={async () => {
                                            await fetch(`/api/jobs/${job.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ ...job, status: 'approved' })
                                            });
                                            fetchData();
                                        }}
                                        className="text-white bg-green-600 hover:bg-green-700 font-semibold px-2 py-1 rounded transition"
                                    > Approve </button>
                                )}
                                <button onClick={() => { setEditingItem(job); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 font-semibold px-3 py-1 bg-indigo-50 rounded-full transition">Edit</button>
                                <button onClick={() => handleDelete(job.id)} className="text-red-600 hover:text-red-900 font-semibold px-3 py-1 bg-red-50 rounded-full transition text-right">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderUsers = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">User Info</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">Role & Status</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">Access Control</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-xs">
                                <div className="font-bold text-gray-900">{user.name}</div>
                                <div className="text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full w-fit ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                        user.role === 'employer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                    <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full w-fit ${user.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                                        }`}>
                                        {user.status?.toUpperCase() || 'PENDING'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-2">
                                    {user.role === 'employer' && (
                                        <button
                                            onClick={() => toggleUserAccess(user, 'canViewHelpers')}
                                            className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition flex items-center gap-1 ${user.canViewHelpers ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${user.canViewHelpers ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            View Helpers
                                        </button>
                                    )}
                                    {user.role === 'helper' && (
                                        <button
                                            onClick={() => toggleUserAccess(user, 'canViewJobs')}
                                            className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition flex items-center gap-1 ${user.canViewJobs ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${user.canViewJobs ? 'bg-blue-500' : 'bg-gray-400'}`} />
                                            View Jobs
                                        </button>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2 text-xs">
                                {user.status !== 'approved' && (
                                    <button
                                        onClick={async () => {
                                            await fetch(`/api/users/${user.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ ...user, status: 'approved' })
                                            });
                                            fetchData();
                                        }}
                                        className="text-white bg-green-600 hover:bg-green-700 font-semibold px-2 py-1 rounded transition"
                                    > Approve </button>
                                )}
                                <button onClick={() => { setEditingItem(user); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 font-semibold px-3 py-1 bg-indigo-50 rounded-full transition">Edit</button>
                                <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 font-semibold px-3 py-1 bg-red-50 rounded-full transition text-right">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );


    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            const response = await fetch(`/api/${activeTab}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchData();
                fetchStats();
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingItem ? 'Edit' : 'Add New'} {activeTab.slice(0, -1)}</h3>
                            <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="text-white/80 hover:text-white transition">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                            {activeTab === 'helpers' && (
                                <>
                                    <input name="name" defaultValue={editingItem?.name} placeholder="Name" className="w-full p-3 border rounded-xl" required />
                                    <input name="age" type="number" defaultValue={editingItem?.age} placeholder="Age" className="w-full p-3 border rounded-xl" required />
                                    <input name="nationality" defaultValue={editingItem?.nationality} placeholder="Nationality" className="w-full p-3 border rounded-xl" required />
                                    <input name="salary" type="number" defaultValue={editingItem?.salary} placeholder="Salary" className="w-full p-3 border rounded-xl" required />
                                    <input name="experience" defaultValue={editingItem?.experience} placeholder="Experience" className="w-full p-3 border rounded-xl" required />
                                    <input name="availability" defaultValue={editingItem?.availability} placeholder="Availability" className="w-full p-3 border rounded-xl" required />
                                    <textarea name="description" defaultValue={editingItem?.description} placeholder="Description" className="w-full p-3 border rounded-xl" required />
                                    <input name="imageUrl" defaultValue={editingItem?.imageUrl} placeholder="Image URL" className="w-full p-3 border rounded-xl" required />
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-500 ml-1">Status</label>
                                        <select name="status" defaultValue={editingItem?.status || 'pending'} className="w-full p-3 border rounded-xl bg-white">
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <input name="skills" defaultValue={editingItem?.skills?.join(', ')} placeholder="Skills (comma separated)" className="w-full p-3 border rounded-xl" />
                                    <input name="languages" defaultValue={editingItem?.languages?.join(', ')} placeholder="Languages (comma separated)" className="w-full p-3 border rounded-xl" />
                                </>
                            )}
                            {activeTab === 'jobs' && (
                                <>
                                    <input name="title" defaultValue={editingItem?.title} placeholder="Job Title" className="w-full p-3 border rounded-xl" required />
                                    <input name="location" defaultValue={editingItem?.location} placeholder="Location" className="w-full p-3 border rounded-xl" required />
                                    <input name="salary" defaultValue={editingItem?.salary} placeholder="Salary Range" className="w-full p-3 border rounded-xl" required />
                                    <input name="expiryDate" type="date" defaultValue={editingItem?.expiryDate} placeholder="Expiry Date" className="w-full p-3 border rounded-xl" required />
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-500 ml-1">Status</label>
                                        <select name="status" defaultValue={editingItem?.status || 'pending'} className="w-full p-3 border rounded-xl bg-white">
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <textarea name="description" defaultValue={editingItem?.description} placeholder="Description" className="w-full p-3 border rounded-xl" required />
                                    <input name="requirements" defaultValue={editingItem?.requirements?.join(', ')} placeholder="Requirements (comma separated)" className="w-full p-3 border rounded-xl" />
                                </>
                            )}
                            {activeTab === 'users' && (
                                <>
                                    <input name="name" defaultValue={editingItem?.name} placeholder="Full Name" className="w-full p-3 border rounded-xl" required />
                                    <input name="email" type="email" defaultValue={editingItem?.email} placeholder="Email" className="w-full p-3 border rounded-xl" required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold text-gray-500 ml-1">Role</label>
                                            <select name="role" defaultValue={editingItem?.role || 'employer'} className="w-full p-3 border rounded-xl bg-white">
                                                <option value="employer">Employer</option>
                                                <option value="helper">Helper</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold text-gray-500 ml-1">Status</label>
                                            <select name="status" defaultValue={editingItem?.status || 'pending'} className="w-full p-3 border rounded-xl bg-white">
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl">
                                        <label className="text-xs font-bold text-gray-500">Access Permissions</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" name="canViewHelpers" defaultChecked={editingItem?.canViewHelpers === 1 || editingItem?.canViewHelpers === true} className="w-4 h-4" />
                                                <span className="text-sm font-medium">View Helpers</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" name="canViewJobs" defaultChecked={editingItem?.canViewJobs === 1 || editingItem?.canViewJobs === true} className="w-4 h-4" />
                                                <span className="text-sm font-medium">View Jobs</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
                <p className="mt-2 text-sm text-gray-600">Comprehensive dashboard for managing platform data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-tight">Total Helpers</div>
                    <div className="mt-2 flex items-baseline">
                        <div className="text-4xl font-extrabold text-gray-900">{stats.helpers}</div>
                        <div className="ml-2 text-sm text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">Active</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-tight">Live Jobs</div>
                    <div className="mt-2 flex items-baseline">
                        <div className="text-4xl font-extrabold text-gray-900">{stats.jobs}</div>
                        <div className="ml-2 text-sm text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">Posted</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-tight">Registered Users</div>
                    <div className="mt-2 flex items-baseline">
                        <div className="text-4xl font-extrabold text-gray-900">{stats.users}</div>
                        <div className="ml-2 text-sm text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full">Growth</div>
                    </div>
                </div>
            </div>

            <div className="flex space-x-6 mb-8 border-b border-gray-100">
                {(['helpers', 'jobs', 'users'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 px-2 text-sm font-bold transition-all ${activeTab === tab ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="bg-white shadow-xl shadow-gray-100 rounded-3xl overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-2xl font-bold capitalize text-gray-900">{activeTab} Entry Control</h2>
                            <button
                                onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create New
                            </button>
                        </div>
                        <div className="p-2">
                            {activeTab === 'helpers' && renderHelpers()}
                            {activeTab === 'jobs' && renderJobs()}
                            {activeTab === 'users' && renderUsers()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
