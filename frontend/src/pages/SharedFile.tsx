import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccessSharedFile } from '../hooks/useFiles';
import { Download, AlertCircle, Lock, LogIn } from 'lucide-react';

export const SharedFile = () => {
    const { shareLink } = useParams<{ shareLink: string }>();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    const { data: response, isLoading, error, isError } = useAccessSharedFile(shareLink || '');

    useEffect(() => {
        
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleDownload = () => {
        if (response?.data?.file?.filebaseUrl) {
            const link = document.createElement('a');
            link.href = response.data.file.filebaseUrl;
            link.download = response.data.file.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleLogin = () => {
        navigate('/login');
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-red-100 p-4 rounded-full">
                            <Lock className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Authentication Required</h1>
                    <p className="text-center text-gray-600 mb-6">You must be logged in to access shared files.</p>

                    <button
                        onClick={handleLogin}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md flex items-center justify-center space-x-2"
                    >
                        <LogIn className="w-5 h-5" />
                        <span>Go to Login</span>
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading shared file...</p>
                </div>
            </div>
        );
    }

    if (isError || !response?.data?.file) {
        const errorMessage = (error as any)?.response?.data?.message || 'Invalid or expired share link';

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-red-100 p-4 rounded-full">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-center text-gray-600 mb-6">{errorMessage}</p>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const file = response.data.file;
    const sharedBy = response.data.sharedBy;
    const expiresAt = response.data.expiresAt;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-2xl mx-auto">
              
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared File</h1>
                    <p className="text-gray-600">
                        Shared by <span className="font-semibold">{sharedBy.username}</span>
                    </p>
                </div>

             
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                    
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Filename</p>
                                <p className="text-lg font-semibold text-gray-900 break-all">{file.filename}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                        File Size
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {(Number(file.fileSize) / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                        File Type
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">{file.fileType}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Shared By</p>
                                <p className="text-lg font-semibold text-gray-900">{sharedBy.email}</p>
                            </div>

                            {expiresAt && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Expires</p>
                                    <p className="text-lg font-semibold text-orange-600">
                                        {new Date(expiresAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                  
                    <button
                        onClick={handleDownload}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md flex items-center justify-center space-x-2 text-lg"
                    >
                        <Download className="w-6 h-6" />
                        <span>Download File</span>
                    </button>

                  
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};
