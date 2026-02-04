import { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';

interface UploadStatus {
    customersUploaded: boolean;
    billsUploaded: boolean;
    paymentsUploaded: boolean;
    canUploadBills: boolean;
    canUploadPayments: boolean;
}

interface UploadResult {
    success: boolean;
    summary: {
        total: number;
        inserted: number;
        skipped: number;
        failed: number;
    };
    errors: Array<{
        row: number;
        field?: string;
        reason: string;
    }>;
    uploadLogId?: string;
}

export default function DataImport() {
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
        customersUploaded: false,
        billsUploaded: false,
        paymentsUploaded: false,
        canUploadBills: false,
        canUploadPayments: false,
    });
    const [loading, setLoading] = useState(true);

    // Fetch upload status on mount
    useEffect(() => {
        fetchUploadStatus();
    }, []);

    const fetchUploadStatus = async () => {
        try {
            const res = await fetch('/api/admin/upload/status', {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setUploadStatus(data);
            }
        } catch (error) {
            if (import.meta.env.DEV) console.error('Failed to fetch upload status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        fetchUploadStatus();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tally Data Import</h1>
                <p className="text-gray-600">
                    Upload your XML files in the correct order: Customers → Bills → Payments
                </p>
            </div>

            {/* Upload Order Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h2 className="font-semibold text-blue-900 mb-3">Upload Progress</h2>
                <div className="flex items-center space-x-4">
                    <StepIndicator
                        label="1. Customers"
                        completed={uploadStatus.customersUploaded}
                        active={!uploadStatus.customersUploaded}
                    />
                    <div className="flex-1 border-t-2 border-gray-300"></div>
                    <StepIndicator
                        label="2. Bills"
                        completed={uploadStatus.billsUploaded}
                        active={uploadStatus.canUploadBills && !uploadStatus.billsUploaded}
                    />
                    <div className="flex-1 border-t-2 border-gray-300"></div>
                    <StepIndicator
                        label="3. Payments"
                        completed={uploadStatus.paymentsUploaded}
                        active={uploadStatus.canUploadPayments && !uploadStatus.paymentsUploaded}
                    />
                </div>
            </div>

            {/* Upload Forms */}
            <div className="space-y-6">
                <XMLUploader
                    title="Step 1: Upload Customers XML"
                    uploadType="customers"
                    enabled={true}
                    icon={<Upload className="w-5 h-5" />}
                    onSuccess={handleUploadSuccess}
                />

                <XMLUploader
                    title="Step 2: Upload Bills XML"
                    uploadType="bills"
                    enabled={uploadStatus.canUploadBills}
                    disabledMessage="⚠️ Please upload Customers XML first"
                    icon={<Upload className="w-5 h-5" />}
                    onSuccess={handleUploadSuccess}
                />

                <XMLUploader
                    title="Step 3: Upload Payments/Receipts XML"
                    uploadType="payments"
                    enabled={uploadStatus.canUploadPayments}
                    disabledMessage="⚠️ Please upload Bills XML first"
                    icon={<Upload className="w-5 h-5" />}
                    onSuccess={handleUploadSuccess}
                />
            </div>
        </div>
    );
}

// Step Indicator Component
function StepIndicator({ label, completed, active }: {
    label: string;
    completed: boolean;
    active: boolean;
}) {
    return (
        <div className="flex flex-col items-center">
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${completed
                        ? 'bg-green-500 text-white'
                        : active
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                    }`}
            >
                {completed ? (
                    <CheckCircle className="w-6 h-6" />
                ) : (
                    <span className="text-sm font-semibold">{label.charAt(0)}</span>
                )}
            </div>
            <span className="text-xs mt-2 text-gray-600">{label}</span>
        </div>
    );
}

// XML Uploader Component
function XMLUploader({
    title,
    uploadType,
    enabled,
    disabledMessage,
    icon,
    onSuccess,
}: {
    title: string;
    uploadType: 'customers' | 'bills' | 'payments';
    enabled: boolean;
    disabledMessage?: string;
    icon: React.ReactNode;
    onSuccess: () => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.xml')) {
                setError('Only .xml files are allowed');
                setFile(null);
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`/api/admin/upload/${uploadType}`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.details || 'Upload failed');
            }

            setResult(data);
            onSuccess();
            setFile(null);

            // Reset file input
            const fileInput = document.getElementById(`file-${uploadType}`) as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const downloadErrors = async () => {
        if (!result?.uploadLogId) return;

        try {
            const res = await fetch(`/api/admin/upload/${result.uploadLogId}/errors`, {
                credentials: 'include',
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${uploadType}_errors.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error('Failed to download errors:', err);
        }
    };

    return (
        <div
            className={`border rounded-lg p-6 transition-opacity ${!enabled ? 'opacity-50 bg-gray-50' : 'bg-white'
                }`}
        >
            <div className="flex items-center space-x-3 mb-4">
                {icon}
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>

            {!enabled && disabledMessage && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{disabledMessage}</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 flex items-center space-x-2">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="mb-4">
                <label
                    htmlFor={`file-${uploadType}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Select XML File
                </label>
                <input
                    id={`file-${uploadType}`}
                    type="file"
                    accept=".xml"
                    disabled={!enabled}
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {file && (
                    <p className="text-sm text-gray-600 mt-2">
                        Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </p>
                )}
            </div>

            <button
                onClick={handleUpload}
                disabled={!enabled || !file || uploading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
                {uploading ? 'Uploading...' : 'Upload XML'}
            </button>

            {result && (
                <div className="mt-6">
                    <div
                        className={`border rounded-lg p-4 ${result.summary.failed === 0
                                ? 'bg-green-50 border-green-200'
                                : 'bg-yellow-50 border-yellow-200'
                            }`}
                    >
                        <div className="flex items-center space-x-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-gray-900">
                                {result.summary.failed === 0 ? 'Upload Successful!' : 'Upload Partially Successful'}
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Total Records:</span>
                                <span className="font-semibold ml-2">{result.summary.total}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">✅ Inserted:</span>
                                <span className="font-semibold ml-2 text-green-600">{result.summary.inserted}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">⚠️ Skipped:</span>
                                <span className="font-semibold ml-2 text-yellow-600">{result.summary.skipped}</span>
                            </div>
                            {result.summary.failed > 0 && (
                                <div>
                                    <span className="text-gray-600">❌ Failed:</span>
                                    <span className="font-semibold ml-2 text-red-600">{result.summary.failed}</span>
                                </div>
                            )}
                        </div>

                        {result.errors && result.errors.length > 0 && (
                            <div className="mt-4">
                                <button
                                    onClick={downloadErrors}
                                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download Error Report (CSV)</span>
                                </button>
                                <div className="mt-3 text-xs text-gray-600 bg-white rounded border p-3 max-h-32 overflow-y-auto">
                                    <p className="font-semibold mb-2">First few errors:</p>
                                    {result.errors.slice(0, 5).map((err, idx) => (
                                        <p key={idx} className="mb-1">
                                            Row {err.row}: {err.field && `[${err.field}] `}{err.reason}
                                        </p>
                                    ))}
                                    {result.errors.length > 5 && (
                                        <p className="italic mt-2">...and {result.errors.length - 5} more errors</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
