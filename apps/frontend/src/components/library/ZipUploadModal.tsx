import React, { useState, useRef } from 'react';
import { 
  FileArchive, 
  Upload, 
  X, 
  Loader, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface ZipUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ZipUploadModal: React.FC<ZipUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.name.endsWith('.zip')) {
      setFile(selected);
      setError('');
    } else {
      setError('Please select a valid .zip file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('idle');
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/ingestion/upload-zip', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('success');
      setFile(null);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        setStatus('idle');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setError(err.response?.data?.message || 'Failed to upload ZIP file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Upload Module ZIP</h3>
                  <p className="text-sm text-gray-500 font-medium">Add Magento 2 modules directly to the registry.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-800 rounded-2xl p-12 text-center space-y-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="p-4 bg-gray-800 rounded-2xl w-fit mx-auto group-hover:bg-primary group-hover:text-black transition-all">
                    <FileArchive className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-bold">Drop your ZIP here</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-black">or click to browse</p>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".zip" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileArchive className="text-primary w-8 h-8" />
                    <div>
                      <p className="text-sm font-bold text-white max-w-[240px] truncate">{file.name}</p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => setFile(null)} className="text-gray-500 hover:text-red-500 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {status === 'success' && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500 animate-in zoom-in-95 duration-500">
                  <CheckCircle className="w-5 h-5" />
                  <p className="text-sm font-bold uppercase italic">Upload Successful! Syncing...</p>
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 animate-in zoom-in-95 duration-500">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-bold uppercase italic">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <Button 
                  variant="ghost" 
                  fullWidth 
                  onClick={onClose}
                  className="font-bold uppercase h-12"
                >
                  Cancel
                </Button>
                <Button 
                  fullWidth 
                  disabled={!file || uploading || status === 'success'}
                  onClick={handleUpload}
                  className="h-12 bg-primary text-black font-black uppercase italic shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {uploading ? (
                    <><Loader className="animate-spin w-4 h-4 mr-2" /> Uploading...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Start Ingestion</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
