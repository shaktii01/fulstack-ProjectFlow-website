import React, { useRef, useState } from 'react';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

/**
 * ImageUpload — reusable avatar/logo uploader via ImageKit.
 *
 * Props:
 *   currentImage  {string}   — existing image URL to display
 *   onUpload      {function} — called with the new CDN URL when upload succeeds
 *   shape         {string}   — 'circle' | 'square' (default: 'square')
 *   size          {number}   — pixel dimension of the preview box (default: 80)
 *   label         {string}   — accessible aria-label
 */
const ImageUpload = ({
  currentImage,
  onUpload,
  shape = 'square',
  size = 80,
  label = 'Upload image',
}) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentImage || '');

  const borderRadius = shape === 'circle' ? '50%' : '0.75rem';

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }

    setError('');
    setUploading(true);

    // Optimistic local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      // POST file to our backend → backend uploads to ImageKit server-side (no CORS)
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPreview(data.url);
      onUpload(data.url);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Upload failed. Try again.';
      setError(msg);
      setPreview(currentImage || '');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Clickable avatar preview */}
      <div
        role="button"
        aria-label={label}
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        style={{
          width: size,
          height: size,
          borderRadius,
          position: 'relative',
          cursor: uploading ? 'not-allowed' : 'pointer',
          overflow: 'hidden',
          flexShrink: 0,
          border: '2px dashed hsl(var(--primary) / 0.5)',
          background: 'hsl(var(--primary) / 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="group transition-all hover:border-primary/80"
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Camera className="h-7 w-7 text-muted-foreground/50" />
        )}

        {/* Hover / uploading overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'hsl(var(--background) / 0.65)',
            backdropFilter: 'blur(2px)',
            opacity: uploading ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
          className="group-hover:!opacity-100"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          ) : (
            <Camera className="h-5 w-5 text-primary" />
          )}
        </div>
      </div>

      {/* Helper text */}
      <p className="text-[10px] text-muted-foreground text-center">
        {uploading ? 'Uploading…' : 'Click to upload'}
        <br />
        <span className="opacity-70">PNG, JPG, WEBP · max 5 MB</span>
      </p>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUpload;
