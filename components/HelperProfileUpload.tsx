import React, { useState, useEffect } from 'react';
import { Nationality, WorkExperienceType } from '../types';

interface HelperProfileUploadProps {
    user: any;
    onSuccess?: () => void;
}

const HelperProfileUpload: React.FC<HelperProfileUploadProps> = ({ user, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: 25,
        nationality: Nationality.FILIPINO,
        yearsInHK: 0,
        workExperienceType: WorkExperienceType.NEW,
        salary: 4500,
        skills: [] as string[],
        languages: [] as string[],
        imageUrl: '',
        availability: 'Immediately',
        description: ''
    });

    const [skillInput, setSkillInput] = useState('');
    const [languageInput, setLanguageInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [existingProfile, setExistingProfile] = useState<any>(null);

    useEffect(() => {
        // Fetch existing profile if any
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const res = await fetch(`/api/helpers?userId=${user.id}`);
                const data = await res.json();
                if (data && data.length > 0) {
                    const profile = data[0];
                    setExistingProfile(profile);
                    setFormData({
                        name: profile.name || '',
                        age: profile.age || 25,
                        nationality: profile.nationality || Nationality.FILIPINO,
                        yearsInHK: profile.yearsInHK || 0,
                        workExperienceType: profile.workExperienceType || WorkExperienceType.NEW,
                        salary: profile.salary || 4500,
                        skills: profile.skills || [],
                        languages: profile.languages || [],
                        imageUrl: profile.imageUrl || '',
                        availability: profile.availability || 'Immediately',
                        description: profile.description || ''
                    });
                    setImagePreview(profile.imageUrl || '');
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };
        fetchProfile();
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
    };

    const addLanguage = () => {
        if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
            setFormData({ ...formData, languages: [...formData.languages, languageInput.trim()] });
            setLanguageInput('');
        }
    };

    const removeLanguage = (lang: string) => {
        setFormData({ ...formData, languages: formData.languages.filter(l => l !== lang) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            let imageUrl = formData.imageUrl;

            // If new image is uploaded, convert to base64
            if (imageFile) {
                imageUrl = imagePreview;
            }

            const profileData = {
                ...formData,
                imageUrl,
                userId: user.id,
                status: 'pending'
            };

            const endpoint = existingProfile ? `/api/helpers/${existingProfile.id}` : '/api/helpers';
            const method = existingProfile ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save profile');
            }

            alert(existingProfile ? 'Profile updated successfully! Waiting for admin approval.' : 'Profile created successfully! Waiting for admin approval.');
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to save profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.role !== 'helper') {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="bg-yellow-50 p-8 rounded-2xl border border-yellow-200">
                    <p className="text-yellow-800 font-medium">This feature is only available for Helper accounts.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold mb-2">
                    {existingProfile ? 'Edit Your Profile' : 'Create Your Profile'}
                </h2>
                <p className="text-gray-600 mb-8">
                    Fill in your details to help employers find you. Your profile will be reviewed by admin before being published.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photo Upload */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Profile Photo</label>
                        <div className="flex items-center gap-6">
                            {imagePreview && (
                                <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-2xl object-cover border-2 border-gray-200" />
                            )}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <p className="text-xs text-gray-500 mt-2">Upload a clear photo of yourself</p>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter your full name"
                        />
                    </div>

                    {/* Age */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Age *</label>
                        <input
                            type="number"
                            required
                            min="18"
                            max="65"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Nationality */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nationality *</label>
                        <select
                            required
                            value={formData.nationality}
                            onChange={(e) => setFormData({ ...formData, nationality: e.target.value as Nationality })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {Object.values(Nationality).map(nat => (
                                <option key={nat} value={nat}>{nat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Years in HK */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Years Working in Hong Kong</label>
                        <input
                            type="number"
                            min="0"
                            max="50"
                            value={formData.yearsInHK}
                            onChange={(e) => setFormData({ ...formData, yearsInHK: parseInt(e.target.value) })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0"
                        />
                    </div>

                    {/* Work Experience Type */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Work Experience Type *</label>
                        <select
                            required
                            value={formData.workExperienceType}
                            onChange={(e) => setFormData({ ...formData, workExperienceType: e.target.value as WorkExperienceType })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {Object.values(WorkExperienceType).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Expected Salary */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Expected Monthly Salary (HKD) *</label>
                        <input
                            type="number"
                            required
                            min="4000"
                            max="10000"
                            step="100"
                            value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Skills</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g., Cooking, Cleaning, Child Care"
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.skills.map(skill => (
                                <span key={skill} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} className="text-blue-900 hover:text-red-600">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Languages */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Languages</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={languageInput}
                                onChange={(e) => setLanguageInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                                className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g., English, Cantonese, Mandarin"
                            />
                            <button
                                type="button"
                                onClick={addLanguage}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.languages.map(lang => (
                                <span key={lang} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                    {lang}
                                    <button type="button" onClick={() => removeLanguage(lang)} className="text-green-900 hover:text-red-600">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Availability *</label>
                        <select
                            required
                            value={formData.availability}
                            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Immediately">Immediately</option>
                            <option value="Within 1 month">Within 1 month</option>
                            <option value="Within 2 months">Within 2 months</option>
                            <option value="Within 3 months">Within 3 months</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">About Yourself *</label>
                        <textarea
                            required
                            rows={5}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Tell employers about your experience, strengths, and what makes you a great helper..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HelperProfileUpload;
