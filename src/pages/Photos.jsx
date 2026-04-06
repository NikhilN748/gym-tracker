import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fmtDate } from '../lib/utils';
import Modal from '../components/Modal';

export default function Photos() {
  const { photos, addPhoto, deletePhoto } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [viewPhoto, setViewPhoto] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1000;
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = (h / w) * maxW;
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        addPhoto(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDelete = () => {
    if (deleteId) {
      deletePhoto(deleteId);
      setDeleteId(null);
      setViewPhoto(null);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/progress')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" id="photos-back">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Progress Photos</h1>
        </div>
        <button onClick={() => fileRef.current?.click()} className="btn-primary" id="upload-photo-btn">
          <Plus size={16} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {/* Warning */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-2">
        <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Photos are stored in browser localStorage. Export your data regularly to avoid loss. Large numbers of photos may slow performance.
        </p>
      </div>

      {/* Grid */}
      {photos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No photos yet. Tap + to add one.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <button
              key={p.id}
              onClick={() => setViewPhoto(p)}
              className="relative aspect-square rounded-xl overflow-hidden group"
              id={`photo-${p.id}`}
            >
              <img src={p.dataUrl} alt="Progress" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <span className="text-[10px] text-white font-medium">
                  {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Full screen view */}
      {viewPhoto && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col" onClick={() => setViewPhoto(null)}>
          <div className="flex items-center justify-between p-4">
            <span className="text-white text-sm">{fmtDate(viewPhoto.date)}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteId(viewPhoto.id); }}
                className="p-2 rounded-lg bg-white/10 text-white"
                id="delete-photo-btn"
              >
                <Trash2 size={18} />
              </button>
              <button onClick={() => setViewPhoto(null)} className="p-2 rounded-lg bg-white/10 text-white" id="close-photo-view">
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img src={viewPhoto.dataUrl} alt="Progress" className="max-w-full max-h-full object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Photo" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">This photo will be permanently deleted.</p>
        <div className="flex gap-2">
          <button onClick={handleDelete} className="btn-danger flex-1" id="confirm-delete-photo">Delete</button>
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
