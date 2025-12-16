import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sharingAPI } from '../services/api';
import { type File } from '../types';

export const SharedFile = () => {
    const { shareLink } = useParams<{ shareLink: string }>();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadFile = async () => {
            try {
                if (!shareLink) throw new Error('No share link');
                const response = await sharingAPI.accessSharedFile(shareLink);
                setFile(response.data.file);
            } catch {
                setError('Invalid or expired link');
            } finally {
                setLoading(false);
            }
        };

        loadFile();
    }, [shareLink]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <h1 className="text-3xl font-bold mb-6">Shared File</h1>
                {file && (
                    <div className="space-y-4">
                        <p>
                            <strong>Filename:</strong> {file.filename}
                        </p>
                        <p>
                            <strong>Size:</strong> {(Number(file.fileSize) / 1024).toFixed(2)} KB
                        </p>
                        <p>
                            <strong>Type:</strong> {file.fileType}
                        </p>
                        <a
                            href={file.fileUrl}
                            download={file.filename}
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        >
                            Download File
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};
