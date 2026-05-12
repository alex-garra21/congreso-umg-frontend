import { useState, useEffect } from 'react';
import { useAgendaConfig, type AgendaConfig } from '../../../api/hooks/useAgendaConfig';
import ModuleTitle from '../../../components/ModuleTitle';
import AdminButton from '../../../components/ui/AdminButton';
import { Icons } from '../../../components/Icons';
import { showToast } from '../../../utils/swal';
import BackButton from '../../../components/ui/BackButton';

export default function AgendaConfigModule() {
  const { config: remoteConfig, updateConfig, loading } = useAgendaConfig();
  const [localConfig, setLocalConfig] = useState<AgendaConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (remoteConfig) {
      setLocalConfig(remoteConfig);
    }
  }, [remoteConfig]);

  if (loading || !localConfig) {
    return <div style={{ padding: '2rem' }}>Cargando configuración...</div>;
  }

  const handleChange = (key: keyof AgendaConfig, value: number) => {
    setLocalConfig(prev => prev ? { ...prev, [key]: value } : null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { success } = await updateConfig(localConfig);
    setIsSaving(false);
    if (success) {
      showToast('Configuración actualizada correctamente', 'success');
    } else {
      showToast('Error al guardar la configuración', 'error');
    }
  };

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <ModuleTitle title="Configuración Visual de la Agenda" />

      <div style={{
        maxWidth: '800px',
        background: 'var(--bg-card)',
        padding: '2rem',
        borderRadius: '24px',
        border: '1px solid var(--border-soft)',
        boxShadow: 'var(--shadow-lg)',
        marginTop: '2rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>

          {/* Dimensiones del Grid */}
          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
              <Icons.Maximize size={18} /> Dimensiones del Calendario
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Alto del Contenedor (Escala: {localConfig.row_height}px)
                </label>
                <input
                  type="range" min="5" max="30" step="1"
                  value={localConfig.row_height}
                  onChange={(e) => handleChange('row_height', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
                <p style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-muted)' }}>Aumenta este valor para que el horario se vea más alto y espaciado.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Redondeo de Esquinas ({localConfig.card_border_radius}px)
                </label>
                <input
                  type="range" min="0" max="30" step="2"
                  value={localConfig.card_border_radius}
                  onChange={(e) => handleChange('card_border_radius', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Espaciado Interno (Padding: {localConfig.card_padding}px)
                </label>
                <input
                  type="range" min="4" max="24" step="2"
                  value={localConfig.card_padding}
                  onChange={(e) => handleChange('card_padding', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>
            </div>
          </section>

          {/* Tipografía */}
          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
              <Icons.Type size={18} /> Tamaños de Fuente
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Título del Taller ({localConfig.font_size_title}px)
                </label>
                <input
                  type="range" min="10" max="18" step="1"
                  value={localConfig.font_size_title}
                  onChange={(e) => handleChange('font_size_title', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Hora y Etiquetas ({localConfig.font_size_time}px)
                </label>
                <input
                  type="range" min="8" max="14" step="1"
                  value={localConfig.font_size_time}
                  onChange={(e) => handleChange('font_size_time', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Nombre del Ponente ({localConfig.font_size_speaker}px)
                </label>
                <input
                  type="range" min="8" max="14" step="1"
                  value={localConfig.font_size_speaker}
                  onChange={(e) => handleChange('font_size_speaker', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>
            </div>
          </section>

        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'flex-end' }}>
          <AdminButton
            onClick={handleSave}
            disabled={isSaving}
            icon={isSaving ? <Icons.Clock size={20} /> : <Icons.Save size={20} />}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios Visuales'}
          </AdminButton>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '13px', alignItems: 'center' }}>
        <Icons.Info size={16} />
        <span>Los cambios se aplicarán automáticamente a todos los usuarios que visualicen la agenda.</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
        <BackButton />
      </div>
    </div>
  );
}
