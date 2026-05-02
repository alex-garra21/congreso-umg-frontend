import React, { useRef, useState } from 'react';
import { Icons } from '../Icons';
import { uploadAvatar, deleteFile } from '../../utils/storage';
import { showToast } from '../../utils/swal';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange: (newUrl: string) => void;
  userId: string;
  folder?: 'users' | 'speakers';
  initials?: string;
}

export default function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarChange, 
  userId, 
  folder = 'users',
  initials = 'U'
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones básicas
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona una imagen válida', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      showToast('La imagen es muy pesada (máximo 2MB)', 'error');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Si ya hay una imagen, borrarla del storage antes de subir la nueva
      if (currentAvatarUrl) {
        await deleteFile('avatars', currentAvatarUrl);
      }

      const publicUrl = await uploadAvatar(userId, file, folder);
      if (publicUrl) {
        onAvatarChange(publicUrl);
        showToast('Imagen actualizada correctamente', 'success');
      } else {
        showToast('Error al subir la imagen', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Error inesperado al subir', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async () => {
    if (!currentAvatarUrl) return;
    
    setIsUploading(true);
    try {
      const success = await deleteFile('avatars', currentAvatarUrl);
      if (success) {
        onAvatarChange('');
        showToast('Imagen eliminada y espacio liberado', 'success');
      } else {
        // Si falla el borrado físico, igual limpiamos la DB por precaución
        onAvatarChange('');
      }
    } catch (error) {
      onAvatarChange('');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="avatar-upload-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '2rem'
    }}>
      <div 
        className="avatar-preview-wrapper" 
        onClick={triggerUpload}
        style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          cursor: 'pointer',
          border: '4px solid #fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transition: 'transform 0.2s ease',
          backgroundColor: '#f1f5f9',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {currentAvatarUrl ? (
          <img 
            src={currentAvatarUrl} 
            alt="Avatar" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <span style={{ 
            fontSize: '36px', 
            fontWeight: 800, 
            color: 'var(--blue)', 
            fontFamily: 'Syne' 
          }}>
            {initials}
          </span>
        )}

        {/* Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isUploading ? 1 : 0,
          transition: 'opacity 0.2s ease',
          color: '#fff'
        }} className="avatar-overlay">
          {isUploading ? (
            <div className="spinner-mini"></div>
          ) : (
            <Icons.Camera size={32} />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <span 
          onClick={triggerUpload}
          style={{ 
            fontSize: '11px', 
            color: 'var(--blue)', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-block'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--blue-dark)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--blue)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isUploading ? 'Subiendo...' : (currentAvatarUrl ? 'Cambiar foto' : 'Subir foto')}
        </span>

        {currentAvatarUrl && !isUploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '0',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#c53030';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Icons.Trash size={14} />
            Eliminar
          </button>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      <style>{`
        .avatar-preview-wrapper:hover .avatar-overlay {
          opacity: 1 !important;
        }
        .spinner-mini {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
