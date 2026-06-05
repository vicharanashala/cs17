import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api2 from '../../lib/axiosP2';

export default function FileDropZone({ images, onImagesChange, maxFiles = 5 }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    const arr = Array.from(files);
    const remaining = maxFiles - images.length;
    if (remaining <= 0) return;
    const toUpload = arr.slice(0, remaining);
    if (!toUpload.length) return;

    setUploadError('');
    setUploading(true);
    try {
      const formData = new FormData();
      toUpload.forEach((f) => formData.append('images', f));
      const { data } = await api2.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onImagesChange((prev) => [...prev, ...data.urls].slice(0, maxFiles));
    } catch {
      setUploadError('Screenshot upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer?.files;
    if (files?.length) handleFiles(files);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onInputChange = (e) => { if (e.target.files?.length) handleFiles(e.target.files); };

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed transition-all select-none
          ${dragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-ink-200 bg-surface hover:border-primary/50 hover:bg-surface-container-low'}
        `}
      >
        {/* Drag overlay */}
        <AnimatePresence>
          {dragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-primary/10 pointer-events-none z-10"
            >
              <span className="material-symbols-outlined text-3xl text-primary mb-1">cloud_upload</span>
              <p className="font-body-sm text-body-sm text-primary font-medium">Drop files here</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center justify-center gap-2 py-8 px-4">
          <span className="material-symbols-outlined text-2xl text-ink-300">add_photo_alternate</span>
          <p className="font-body-sm text-body-sm text-ink-400 text-center">
            <span className="text-primary font-medium">Click to browse</span> or drag & drop images
          </p>
          <p className="font-label-mono text-label-mono text-ink-400">
            {images.length}/{maxFiles} images · JPG, PNG, GIF up to 5MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      {uploading && (
        <p className="font-label-mono text-label-mono text-ink-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs animate-spin">refresh</span> Uploading…
        </p>
      )}
      {uploadError && (
        <p className="font-body-sm text-body-sm text-error">{uploadError}</p>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt={`Screenshot ${i + 1}`}
                className="w-16 h-16 object-cover rounded-lg border border-ink-200"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onImagesChange((prev) => prev.filter((_, idx) => idx !== i));
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-on-error rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}