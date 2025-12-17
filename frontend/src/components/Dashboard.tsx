import { useState } from 'react';
import { useGetFiles, useUploadFile, useDeleteFiles, useShareFileWithUsers, useSearchUser } from '../hooks/useFiles';
import { useNavigate } from 'react-router-dom';
import { sharingAPI } from '../services/api';
import { type File } from '../types';
import { Upload, Link2, Trash2, X, Check, LogOut, File as FileIcon, FolderOpen, Users, Loader } from 'lucide-react';

export const Dashboard = () => {
    const navigate = useNavigate();
    const { data: files = [], isLoading } = useGetFiles();
    const { mutate: uploadFile, isPending: isUploading } = useUploadFile();
    const { mutate: deleteFile } = useDeleteFiles();
    const { mutate: shareWithUsers, isPending: isSharing } = useShareFileWithUsers();

    const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
    const [shareLink, setShareLink] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [showUserShareModal, setShowUserShareModal] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // User sharing state
    const [selectedFileForShare, setSelectedFileForShare] = useState<File | null>(null);
    const [emailInput, setEmailInput] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<Array<{ id: string; email: string; username: string }>>([]);
    const [expiryDays, setExpiryDays] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Search for user by email
    const { data: searchResult, isLoading: isSearching } = useSearchUser(emailInput);

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        uploadFile(formData, {
            onSuccess: () => {
                setSelectedFile(null);
                alert('File uploaded successfully!');
            }
        });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleGenerateLink = async (file: File) => {
        try {
            const response = await sharingAPI.generateLink(file.id, 24);
            setShareLink(response.data.shareLink);
            setShowShareModal(true);
        } catch {
            alert('Failed to generate link');
        }
    };

    const handleShareWithUsers = (file: File) => {
        setSelectedFileForShare(file);
        setShowUserShareModal(true);
        setEmailInput('');
        setSelectedUsers([]);
        setExpiryDays(0);
    };

    const handleAddUser = (user: any) => {
        // Check if user already added
        if (selectedUsers.find((u) => u.id === user.id)) {
            alert('User already added');
            return;
        }

        setSelectedUsers([...selectedUsers, user]);
        setEmailInput('');
        setShowSuggestions(false);
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
    };

    const submitUserShare = () => {
        if (!selectedFileForShare || selectedUsers.length === 0) {
            alert('Please select at least one user');
            return;
        }

        const userIds = selectedUsers.map((u) => u.id);

        shareWithUsers(
            {
                fileId: selectedFileForShare.id,
                userIds,
                expiryDays: expiryDays || undefined
            },
            {
                onSuccess: () => {
                    alert(`File shared with ${selectedUsers.length} user(s)!`);
                    setShowUserShareModal(false);
                    setEmailInput('');
                    setSelectedUsers([]);
                    setExpiryDays(0);
                    setSelectedFileForShare(null);
                },
                onError: () => {
                    alert('Failed to share file');
                }
            }
        );
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    const handleDelete = (fileId: string) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            deleteFile(fileId);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return '🖼️';
        if (['pdf'].includes(ext || '')) return '📄';
        if (['doc', 'docx'].includes(ext || '')) return '📝';
        if (['xls', 'xlsx'].includes(ext || '')) return '📊';
        if (['zip', 'rar'].includes(ext || '')) return '📦';
        return '📁';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                                <FolderOpen className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                File Sharing
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Upload Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        <Upload className="w-5 h-5 mr-2 text-blue-600" />
                        Upload File
                    </h2>

                    <div
                        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                            dragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />

                        {selectedFile ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center space-x-3 text-green-600">
                                    <Check className="w-6 h-6" />
                                    <span className="font-medium">{selectedFile.name}</span>
                                </div>
                                <div className="flex justify-center space-x-3">
                                    <button
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                                    >
                                        {isUploading ? 'Uploading...' : 'Upload File'}
                                    </button>
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="bg-blue-100 p-4 rounded-full">
                                        <Upload className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Click to upload
                                    </label>
                                    <span className="text-gray-500"> or drag and drop</span>
                                </div>
                                <p className="text-sm text-gray-500">Any file type, up to 50MB</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Files List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <FileIcon className="w-5 h-5 mr-2 text-blue-600" />
                            Your Files
                            <span className="ml-3 text-sm font-normal text-gray-500">
                                ({files.length} {files.length === 1 ? 'file' : 'files'})
                            </span>
                        </h2>
                    </div>

                    {files.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-gray-100 p-6 rounded-full">
                                    <FolderOpen className="w-12 h-12 text-gray-400" />
                                </div>
                            </div>
                            <p className="text-gray-500 text-lg">No files uploaded yet</p>
                            <p className="text-gray-400 text-sm mt-2">Upload your first file to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            File
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Size
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Uploaded
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {files.map((file) => (
                                        <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{getFileIcon(file.filename)}</span>
                                                    <span className="font-medium text-gray-900">{file.filename}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-gray-600">
                                                {formatFileSize(Number(file.fileSize))}
                                            </td>
                                            <td className="px-8 py-5 text-gray-600">
                                                {new Date(file.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleShareWithUsers(file)}
                                                        className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                        <span>Share</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleGenerateLink(file)}
                                                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                                                    >
                                                        <Link2 className="w-4 h-4" />
                                                        <span>Link</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(file.id)}
                                                        className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* User Share Modal with Email Autocomplete */}
            {showUserShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                        <button
                            onClick={() => setShowUserShareModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-purple-100 p-4 rounded-full">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Share with Users</h3>
                        <p className="text-center text-gray-500 mb-6">
                            Share <span className="font-semibold">{selectedFileForShare?.filename}</span> with specific
                            users
                        </p>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {/* Email Input with Autocomplete */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search by Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={(e) => {
                                            setEmailInput(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        placeholder="user@example.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                    />
                                    {isSearching && (
                                        <Loader className="absolute right-3 top-3 w-4 h-4 animate-spin text-purple-600" />
                                    )}
                                </div>

                                {/* Autocomplete Suggestions */}
                                {showSuggestions && emailInput && searchResult?.data && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                        <button
                                            type="button"
                                            onClick={() => handleAddUser(searchResult.data)}
                                            className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {searchResult.data.username}
                                                </p>
                                                <p className="text-sm text-gray-600">{searchResult.data.email}</p>
                                            </div>
                                            <Check className="w-4 h-4 text-purple-600" />
                                        </button>
                                    </div>
                                )}

                                {showSuggestions && emailInput && !searchResult?.data && !isSearching && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3 text-center text-gray-600">
                                        No user found
                                    </div>
                                )}
                            </div>

                            {/* Selected Users */}
                            {selectedUsers.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Selected Users ({selectedUsers.length})
                                    </label>
                                    <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        {selectedUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between bg-white p-2 rounded border border-purple-200"
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{user.username}</p>
                                                    <p className="text-xs text-gray-600">{user.email}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveUser(user.id)}
                                                    className="text-red-600 hover:text-red-700 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Expiry Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiry (days) - Optional
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={expiryDays}
                                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                                    placeholder="0 = Never expires"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave 0 for permanent access</p>
                            </div>
                        </div>

                        <button
                            onClick={submitUserShare}
                            disabled={isSharing || selectedUsers.length === 0}
                            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isSharing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Sharing...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    <span>
                                        Share with {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
                                    </span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setShowUserShareModal(false)}
                            className="w-full mt-2 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Share Link Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-green-100 p-4 rounded-full">
                                <Link2 className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Share Link Generated!</h3>
                        <p className="text-center text-gray-500 mb-6">Anyone with this link can access the file</p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                            <input
                                type="text"
                                readOnly
                                value={shareLink}
                                className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
                            />
                        </div>

                        <button
                            onClick={copyToClipboard}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md flex items-center justify-center space-x-2 mb-3"
                        >
                            {copiedLink ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-5 h-5" />
                                    <span>Copy Link</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
