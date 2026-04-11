import { useState, useEffect } from 'react';
import { getCurrentUser, updateUserData, type UserData } from '../utils/auth';
import ModuleTitle from '../components/ModuleTitle';
import shirtMan from '../assets/t-shirt-man.png';
import shirtWoman from '../assets/t-shirt-woman.png';

type Talla = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
type Sexo = 'Hombre' | 'Mujer';

export default function ShirtModule() {
  const [user, setUser] = useState<UserData | null>(getCurrentUser());
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTalla, setSelectedTalla] = useState<Talla>(user?.talla as Talla || 'M');
  const [selectedSexo, setSelectedSexo] = useState<Sexo>(user?.sexo as Sexo || 'Hombre');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const currentImage = (isEditing ? selectedSexo : user?.sexo) === 'Mujer' ? shirtWoman : shirtMan;

  useEffect(() => {
    if (user) {
      setSelectedTalla(user.talla as Talla || 'M');
      setSelectedSexo(user.sexo as Sexo || 'Hombre');
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;
    const updatedUser: UserData = {
      ...user,
      talla: selectedTalla,
      sexo: selectedSexo
    };
    
    const result = updateUserData(updatedUser);
    if (result.success) {
      setIsSuccessModalOpen(true);
      setIsEditing(false);
      setUser(getCurrentUser());
    }
  };

  const tallas: Talla[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="shirt-module">
      <ModuleTitle title="Mi playera" />
      
      <section className="dashboard-section shirt-container">
        {!isEditing ? (
          /* MODO VISUALIZACIÓN */
          <div className="shirt-layout">
            <div className="shirt-info">
              <h2 className="shirt-title">Tu Playera Oficial</h2>
              <p className="shirt-desc">
                Esta es la playera que recibirás al acreditar tu entrada el primer día del evento.
              </p>

              <div className="shirt-details-grid">
                <div className="detail-item">
                  <span className="detail-label">TALLA ELEGIDA</span>
                  <span className="detail-value">{user?.talla || 'S'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">SEXO / CORTE</span>
                  <span className="detail-value">{user?.sexo || 'Hombre'}</span>
                </div>
              </div>

              <div className="shirt-status-box">
                <div className="status-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                </div>
                <div className="status-content">
                  <h4>Confirmación final</h4>
                  <p>Tu talla ha sido reservada correctamente.</p>
                </div>
              </div>

              <button 
                className="btn-ghost" 
                style={{ marginTop: '1rem', width: 'auto', padding: '10px 20px', fontSize: '14px', border: '1.5px solid var(--blue)', color: 'var(--blue)' }}
                onClick={() => setIsEditing(true)}
              >
                ¿Necesitas cambiar tu talla?
              </button>
            </div>

            <div className="shirt-preview-box">
              <div className="preview-card">
                <img 
                  src={currentImage} 
                  alt="Official Congress Shirt" 
                  className="shirt-image"
                />
                <div className="preview-overlay">
                  <span>PREVIEW OFICIAL</span>
                </div>
              </div>
              <p className="preview-caption">Diseño oficial Congreso 2026 UMG</p>
            </div>
          </div>
        ) : (
          /* MODO SELECCIÓN (INTERACTIVO) */
          <div className="selection-layout">
             <div className="selection-main">
                <div className="selection-header">
                  <h2 className="selection-title">Personaliza tu talla</h2>
                  <p className="selection-desc">Selecciona el corte y la talla que mejor se adapte a ti.</p>
                </div>

                <div className="selection-form">
                  <div className="selection-group">
                    <label className="selection-label">SEXO</label>
                    <div className="toggle-buttons">
                      <button 
                        className={`toggle-btn ${selectedSexo === 'Hombre' ? 'active' : ''}`}
                        onClick={() => setSelectedSexo('Hombre')}
                      >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/><path d="M12 7c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z"/></svg>
                        Hombre
                      </button>
                      <button 
                        className={`toggle-btn ${selectedSexo === 'Mujer' ? 'active' : ''}`}
                        onClick={() => setSelectedSexo('Mujer')}
                      >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}}><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/><path d="M12 6c-1.768 0-3.2 1.432-3.2 3.2 0 1.259.73 2.341 1.776 2.871l-1.376 3.1c-.267.604.01 1.306.614 1.573s1.306-.01 1.573-.614L12 14.5l.614 1.63c.267.604.969.881 1.573.614s.881-.969.614-1.573l-1.376-3.1c1.046-.53 1.776-1.612 1.776-2.871 0-1.768-1.432-3.2-3.2-3.2z"/></svg>
                        Mujer
                      </button>
                    </div>
                  </div>

                  <div className="selection-group">
                    <label className="selection-label">TALLA</label>
                    <div className="size-buttons">
                      {tallas.map(t => (
                        <button 
                          key={t}
                          className={`size-btn ${selectedTalla === t ? 'active' : ''}`}
                          onClick={() => setSelectedTalla(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="selection-summary">
                    <label className="selection-label">TU SELECCIÓN</label>
                    <div className="summary-box">
                      <p>Corte: <strong>{selectedSexo === 'Hombre' ? 'Masculino' : 'Femenino'}</strong></p>
                      <p>Talla: <strong>{selectedTalla}</strong></p>
                      <p>Color: <strong>Azul UMG</strong></p>
                    </div>
                  </div>
                </div>

                <div className="selection-actions">
                  <button className="confirm-btn" onClick={handleSave}>Guardar selección</button>
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancelar</button>
                </div>
             </div>

             <div className="selection-preview">
                <label className="selection-label" style={{textAlign: 'center'}}>VISTA PREVIA</label>
                <div className="preview-card-small">
                  <img 
                    src={currentImage} 
                    alt="Official Shirt" 
                  />
                </div>
                <div className="preview-badge">
                  Talla {selectedTalla} · {selectedSexo === 'Hombre' ? 'Masculino' : 'Femenino'}
                </div>
             </div>
          </div>
        )}
      </section>

      {/* Modal de Éxito */}
      {isSuccessModalOpen && (
        <div className="modal-bg open" onClick={() => setIsSuccessModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#7ed321" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px' }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l3 3 5-5" />
              </svg>
            </div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px', fontFamily: 'Syne', fontWeight: 800 }}>¡Talla Actualizada!</h3>
            <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>Tu selección ha sido registrada correctamente.</p>
            <button className="submit-btn" style={{background: 'var(--blue)'}} onClick={() => setIsSuccessModalOpen(false)}>Entendido</button>
          </div>
        </div>
      )}

      <style>{`
        .shirt-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        .shirt-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 32px;
          margin-bottom: 1rem;
        }

        .selection-layout {
          display: grid;
          grid-template-columns: 2fr 130px;
          gap: 2rem;
          align-items: start;
        }

        .selection-header {
          margin-bottom: 1.5rem;
        }

        .selection-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 24px;
          margin-bottom: 0.5rem;
        }

        .selection-desc {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .selection-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
        }

        .selection-group {
          margin-bottom: 1.5rem;
        }

        .toggle-buttons {
          display: flex;
          gap: 10px;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid var(--border-med);
          background: #fff;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .toggle-btn.active {
          background: var(--blue-light);
          border-color: var(--blue);
          color: var(--blue);
          box-shadow: 0 0 0 1px var(--blue);
        }

        .size-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .size-btn {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid var(--border-med);
          background: #fff;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.2s;
        }

        .size-btn.active {
          background: var(--blue);
          border-color: var(--blue);
          color: #fff;
        }

        .summary-box {
          background: #f8f9fa;
          border: 1px solid var(--border-soft);
          border-radius: 10px;
          padding: 1.25rem;
        }

        .summary-box p {
          font-size: 14px;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }

        .summary-box p:last-child { margin-bottom: 0; }
        .summary-box strong { color: var(--text-primary); }

        .selection-actions {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .confirm-btn {
          background: var(--blue);
          color: #fff;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
        }

        .cancel-btn {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-soft);
          padding: 10px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
        }

        .selection-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .preview-card-small {
          background: #fff;
          border-radius: 12px;
          border: 1px solid var(--border-soft);
          padding: 8px;
          margin-bottom: 1rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .preview-card-small img {
          width: 80px;
          height: auto;
          display: block;
        }

        .preview-badge {
          background: var(--blue-light);
          color: var(--blue);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* --- Estilos Visualización --- */
        .shirt-desc {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .shirt-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-item {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-soft);
        }

        .detail-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .detail-value {
          font-size: 24px;
          font-weight: 800;
          font-family: 'Syne', sans-serif;
          color: var(--blue);
        }

        .shirt-status-box {
          background: #edf2ff;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          border: 1px solid #d0ebff;
        }

        .status-icon {
          color: #228be6;
          flex-shrink: 0;
        }

        .status-content h4 {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: #1864ab;
        }

        .status-content p {
          font-size: 13px;
          color: #1c7ed6;
          line-height: 1.4;
          margin: 0;
        }

        .shirt-preview-box {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .preview-card {
          position: relative;
          background: #fff;
          border-radius: 20px;
          padding: 1rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .shirt-image {
          width: 100%;
          max-width: 400px;
          border-radius: 12px;
          display: block;
        }

        .preview-overlay {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0,0,0,0.7);
          color: #fff;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .preview-caption {
          margin-top: 1rem;
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
