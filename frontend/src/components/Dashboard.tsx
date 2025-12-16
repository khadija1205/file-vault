import { useState } from 'react';
import { useGetFiles, useUploadFile, useDeleteFiles } from '../hooks/useFiles';
import { useNavigate } from 'react-router-dom';
import { sharingAPI } from '../services/api';
import { type File } from '../types';

export const Dashboard = () => {
    const navigate = useNavigate();
    const { data: files = [], isLoading } = useGetFiles();
    const { mutate: UploadFile, isPending: isUploading } = useUploadFile();
    const { mutate: deleteFile } = useDeleteFiles();
    const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
    const [shareLink, setShareLink] = useState('');
    const [copiedLink, setCopiedLink] = useState(false);

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        UploadFile(formData, {
            onSuccess: () => {
                setSelectedFile(null);
                alert('File uploaded successfully!');
            }
        });
    };

    const handleGenerateLink = async (file: File) => {
        try {
            const response = await sharingAPI.generateLink(file.id, 24);
            setShareLink(response.data.shareLink);
        } catch {
            alert('Failed to generate link');
        }
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

    if (isLoading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">File Sharing</h1>

                <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Logout
                </button>
            </div>

            {/* upload */}
            <div>
                <h2>Upload File</h2>
                <div>
                    <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="flex-1 px-4 py-2 border rounded"
                    />

                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>

            {/* Files */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-2xl font-bold">Your Files</h2>
                </div>

                {files.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No files uploaded yet</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="w-full">
                                <tr>
                                    <th className="px-6 py-3 text-left">Filename</th>
                                    <th className="px-6 py-3 text-left">Size</th>
                                    <th className="px-6 py-3 text-left">Uploaded</th>
                                    <th className="px-6 py-3 text-left">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {files.map((file) => (
                                    <tr key={file.id} className="border-t hover:bg-gray-50">
                                        <td className="px-6 py-4">{file.filename}</td>
                                        <td className="px-6 py-4">{(Number(file.fileSize) / 1024).toFixed(2)} KB</td>
                                        <td className="px-6 py-4">{new Date(file.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 space-x-2">
                                            <button
                                                onClick={() => handleGenerateLink(file)}
                                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                            >
                                                Share Link
                                            </button>
                                            <button
                                                onClick={() => deleteFile(file.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Share Link */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                    <h3 className="text-xl font-bold mb-4">Share Link Generated</h3>

                    <input type="text" readOnly className="w-full px-4 py-2 border rounded mb-4" />
                    <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Copy Link</button>
                    <button className="w-full mt-2 bg-gray-300 text-black py-2 rounded hover:bg-gray-400">Close</button>
                </div>
            </div>
        </div>
    );
};
