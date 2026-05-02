import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import FormField from '../../../../components/ui/FormField';
import AdminButton from '../../../../components/ui/AdminButton';
import AdminSelect from '../../../../components/ui/AdminSelect';
import { Icons } from '../../../../components/Icons';
import AvatarUpload from '../../../../components/ui/AvatarUpload';
import { showToast } from '../../../../utils/swal';
import type { Speaker } from '../../../../data/agendaData';

interface SpeakerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  speaker: Speaker;
  onSave: (speaker: Speaker) => void;
  isNew: boolean;
}

export default function SpeakerEditModal({ isOpen, onClose, speaker, onSave, isNew }: SpeakerEditModalProps) {
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker>({ ...speaker });
  const [selectedSocialType, setSelectedSocialType] = useState('facebook');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editingSpeaker);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isNew ? 'Nuevo' : 'Editar'} Ponente`}
      maxWidth="600px"
    >
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1.5rem' }}>
        Los campos marcados con <span style={{ color: '#ef4444' }}>*</span> son obligatorios.
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <AvatarUpload 
            userId={editingSpeaker.id.toString()} 
            currentAvatarUrl={editingSpeaker.avatar} 
            folder="speakers"
            initials={editingSpeaker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            onAvatarChange={(newUrl) => setEditingSpeaker({ ...editingSpeaker, avatar: newUrl })} 
          />
        </div>
        <FormField label="NOMBRE" required>
          <input 
            type="text" 
            className="dashboard-input" 
            value={editingSpeaker.name} 
            onChange={e => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })} 
            required 
          />
        </FormField>
        <FormField label="CARGO / ROL" required>
          <input 
            type="text" 
            className="dashboard-input" 
            value={editingSpeaker.role} 
            onChange={e => setEditingSpeaker({ ...editingSpeaker, role: e.target.value })} 
            required 
          />
        </FormField>
        <FormField label="BIO (Opcional)">
          <textarea 
            className="dashboard-input" 
            value={editingSpeaker.bio} 
            onChange={e => setEditingSpeaker({ ...editingSpeaker, bio: e.target.value })} 
            style={{ minHeight: '100px' }} 
          />
        </FormField>

        <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '2rem 0 1rem', fontFamily: 'Syne', color: 'var(--blue)' }}>Redes Sociales</h4>
        
        <div style={{ background: '#f8f9fa', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <AdminSelect 
                value={selectedSocialType}
                onChange={(e: { target: { value: string } }) => setSelectedSocialType(e.target.value)}
                options={[
                  { value: 'facebook', label: 'Facebook' },
                  { value: 'instagram', label: 'Instagram' },
                  { value: 'tiktok', label: 'TikTok' },
                  { value: 'x', label: 'X (Twitter)' },
                  { value: 'linkedin', label: 'LinkedIn' },
                  { value: 'youtube', label: 'YouTube' },
                  { value: 'twitch', label: 'Twitch' },
                  { value: 'pinterest', label: 'Pinterest' },
                  { value: 'snapchat', label: 'Snapchat' },
                  { value: 'whatsapp', label: 'WhatsApp' },
                  { value: 'reddit', label: 'Reddit' },
                  { value: 'discord', label: 'Discord' },
                  { value: 'behance', label: 'Behance' },
                  { value: 'dribbble', label: 'Dribbble' },
                  { value: 'telegram', label: 'Telegram' },
                  { value: 'threads', label: 'Threads' }
                ]}
              />
            </div>
            <AdminButton 
              type="button" 
              onClick={() => {
                if (!editingSpeaker.socialLinks?.[selectedSocialType]) {
                  setEditingSpeaker({
                    ...editingSpeaker,
                    socialLinks: {
                      ...editingSpeaker.socialLinks,
                      [selectedSocialType]: ''
                    }
                  });
                } else {
                  showToast('Esta red social ya fue agregada', 'info');
                }
              }}
            >
              + Agregar Red
            </AdminButton>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {editingSpeaker.socialLinks && Object.entries(editingSpeaker.socialLinks).map(([type, url]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
                <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blue-light)', borderRadius: '6px' }}>
                  {type === 'facebook' && <Icons.Facebook size={16} color="var(--blue)" />}
                  {type === 'instagram' && <Icons.Instagram size={16} color="var(--blue)" />}
                  {type === 'tiktok' && <Icons.TikTok size={16} color="var(--blue)" />}
                  {type === 'x' && <Icons.TwitterX size={16} color="var(--blue)" />}
                  {type === 'linkedin' && <Icons.LinkedIn size={16} color="var(--blue)" />}
                  {type === 'youtube' && <Icons.Youtube size={16} color="var(--blue)" />}
                  {type === 'twitch' && <Icons.Twitch size={16} color="var(--blue)" />}
                  {type === 'pinterest' && <Icons.Pinterest size={16} color="var(--blue)" />}
                  {type === 'snapchat' && <Icons.Snapchat size={16} color="var(--blue)" />}
                  {type === 'whatsapp' && <Icons.WhatsApp size={16} color="var(--blue)" />}
                  {type === 'reddit' && <Icons.Reddit size={16} color="var(--blue)" />}
                  {type === 'discord' && <Icons.Discord size={16} color="var(--blue)" />}
                  {type === 'behance' && <Icons.Behance size={16} color="var(--blue)" />}
                  {type === 'dribbble' && <Icons.Dribbble size={16} color="var(--blue)" />}
                  {type === 'telegram' && <Icons.Telegram size={16} color="var(--blue)" />}
                  {type === 'threads' && <Icons.Threads size={16} color="var(--blue)" />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '2px' }}>{type}</span>
                  <input 
                    type="url" 
                    className="dashboard-input" 
                    style={{ margin: 0, padding: '6px 10px', fontSize: '13px' }}
                    value={(url as string) || ''} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingSpeaker({ 
                      ...editingSpeaker, 
                      socialLinks: { ...editingSpeaker.socialLinks, [type]: e.target.value } 
                    })} 
                    placeholder={`URL de ${type}...`}
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    const newLinks = { ...editingSpeaker.socialLinks };
                    delete newLinks[type];
                    setEditingSpeaker({ ...editingSpeaker, socialLinks: newLinks });
                  }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                >
                  <Icons.Trash size={16} />
                </button>
              </div>
            ))}
            {(!editingSpeaker.socialLinks || Object.keys(editingSpeaker.socialLinks).length === 0) && (
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#868e96', margin: '1rem 0' }}>No se han agregado redes sociales.</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
          <AdminButton type="submit" style={{ flex: 1 }}>Guardar Ponente</AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</AdminButton>
        </div>
      </form>
    </Modal>
  );
}
