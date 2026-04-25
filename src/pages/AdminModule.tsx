// v3 - Added Agenda Sub-tabs (Horario, Ponentes, Categorías)
import React, { useState, useEffect } from 'react';
import { getRegisteredUsers, updateUserData, getTokens, generateToken, deleteToken, type UserData, type TokenData } from '../utils/auth';
import { 
  getAgenda, saveAgenda, 
  getSpeakers, saveSpeakers, 
  getCategories, saveCategories,
  type AgendaItem, type Speaker, type CategoryStyle 
} from '../utils/agendaStore';
import ModuleTitle from '../components/ModuleTitle';
import * as XLSX from 'xlsx';

interface AdminModuleProps {
  defaultTab: 'tokens' | 'users' | 'reports' | 'agenda';
}

export default function AdminModule({ defaultTab }: AdminModuleProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [categories, setCategories] = useState<Record<string, CategoryStyle>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Paginación
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  // Estados para Agenda Sub-tabs
  const [agendaTab, setAgendaTab] = useState<'schedule' | 'speakers' | 'categories'>('schedule');

  // Modals
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{name: string, style: CategoryStyle} | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMassModalOpen, setIsMassModalOpen] = useState(false);
  const [massQuantity, setMassQuantity] = useState(10);

  useEffect(() => {
    setUsers(getRegisteredUsers());
    setTokens(getTokens());
    setAgenda(getAgenda());
    setSpeakers(getSpeakers());
    setCategories(getCategories());
    setPage(1);
  }, [defaultTab]);

  const handleGenerateToken = () => {
    generateToken();
    setTokens(getTokens());
    setPage(1);
  };

  const handleMassGenerate = () => {
    for (let i = 0; i < massQuantity; i++) {
      generateToken();
    }
    setTokens(getTokens());
    setIsMassModalOpen(false);
    setPage(1);
  };

  const handleDeleteToken = (code: string) => {
    if (confirm('¿Estás seguro de eliminar este token?')) {
      deleteToken(code);
      setTokens(getTokens());
    }
  };

  const handleValidateUser = (user: UserData) => {
    const updated = { ...user, pagoValidado: true };
    updateUserData(updated);
    setUsers(getRegisteredUsers());
    alert(`Pago validado para ${user.nombres} ${user.apellidos}`);
  };

  const getWorkshopTitle = (id: string) => {
    const w = agenda.find(item => item.id === id);
    return w ? w.title : id;
  };

  const exportToExcel = () => {
    const filtered = users.filter(u => u.rol !== 'admin').filter(u => {
      const matchesSearch = u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.correo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWorkshop = selectedWorkshopFilter === '' || (u.talleres && u.talleres.includes(selectedWorkshopFilter));
      const matchesPayment = paymentFilter === 'all' || (paymentFilter === 'paid' && u.pagoValidado) || (paymentFilter === 'unpaid' && !u.pagoValidado);
      return matchesSearch && matchesWorkshop && matchesPayment;
    });

    if (filtered.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const data = filtered.map(u => {
      const workshopsText = selectedWorkshopFilter
        ? getWorkshopTitle(selectedWorkshopFilter)
        : (u.talleres?.map(tid => getWorkshopTitle(tid)).join(', ') || 'Sin talleres');

      return {
        'Participante': u.nombreDiploma || `${u.nombres} ${u.apellidos}`,
        'Correo Electrónico': u.correo,
        'Nombre Completo': `${u.nombres} ${u.apellidos}`,
        [selectedWorkshopFilter ? 'Taller' : 'Talleres Inscritos']: workshopsText,
        'Sexo': u.sexo === 'M' ? 'Hombre' : 'Mujer',
        'Tipo de Participante': u.tipoParticipante === 'alumno' ? 'Estudiante UMG' : (u.tipoParticipante === 'externo' ? 'Externo' : 'N/A'),
        'Carné': u.tipoParticipante === 'alumno' ? (u.carnet || 'N/A') : 'N/A',
        'Ciclo': u.tipoParticipante === 'alumno' ? (u.ciclo || 'N/A') : 'N/A',
        'Teléfono': u.telefono || 'N/A',
        'Estado de Pago': u.pagoValidado ? 'Pagado' : 'Sin pagar'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participantes");
    const workshopSuffix = selectedWorkshopFilter ? ` - ${getWorkshopTitle(selectedWorkshopFilter)}` : '';
    XLSX.writeFile(workbook, `Reporte_Congreso_2026${workshopSuffix}.xlsx`);
  };

  const exportTokensToExcel = () => {
    if (tokens.length === 0) {
      alert('No hay tokens para exportar.');
      return;
    }
    const data = tokens.map(t => ({
      'Token de Activación': t.code,
      'Estado': t.used ? 'Utilizado' : 'Disponible',
      'Utilizado por': t.usedBy || 'N/A'
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tokens");
    XLSX.writeFile(workbook, `Tokens_Activacion_2026.xlsx`);
  };

  const Pagination = ({ current, total, onPageChange }: { current: number, total: number, onPageChange: (p: number) => void }) => {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', padding: '1rem' }}>
        <button 
          onClick={() => onPageChange(Math.max(1, current - 1))} 
          disabled={current === 1} 
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-soft)', background: 'white', cursor: current === 1 ? 'not-allowed' : 'pointer', opacity: current === 1 ? 0.5 : 1, fontWeight: 600, fontSize: '14px' }}
        >
          Anterior
        </button>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>Página {current} de {totalPages}</span>
        <button 
          onClick={() => onPageChange(Math.min(totalPages, current + 1))} 
          disabled={current === totalPages} 
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-soft)', background: 'white', cursor: current === totalPages ? 'not-allowed' : 'pointer', opacity: current === totalPages ? 0.5 : 1, fontWeight: 600, fontSize: '14px' }}
        >
          Siguiente
        </button>
      </div>
    );
  };

  // HANDLERS AGENDA
  const handleSaveAgendaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const newAgenda = agenda.some(a => a.id === editingItem.id)
      ? agenda.map(a => a.id === editingItem.id ? editingItem : a)
      : [...agenda, editingItem];
    setAgenda(newAgenda);
    saveAgenda(newAgenda);
    setIsAgendaModalOpen(false);
  };

  const handleDeleteAgendaItem = (id: string) => {
    if (confirm('¿Eliminar taller de la agenda?')) {
      const newAgenda = agenda.filter(a => a.id !== id);
      setAgenda(newAgenda);
      saveAgenda(newAgenda);
    }
  };

  // HANDLERS SPEAKERS
  const handleSaveSpeaker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpeaker) return;
    const newSpeakers = speakers.some(s => s.id === editingSpeaker.id)
      ? speakers.map(s => s.id === editingSpeaker.id ? editingSpeaker : s)
      : [...speakers, editingSpeaker];
    setSpeakers(newSpeakers);
    saveSpeakers(newSpeakers);
    setIsSpeakerModalOpen(false);
  };

  const handleDeleteSpeaker = (id: number) => {
    if (confirm('¿Eliminar ponente?')) {
      const newSpeakers = speakers.filter(s => s.id !== id);
      setSpeakers(newSpeakers);
      saveSpeakers(newSpeakers);
    }
  };

  // HANDLERS CATEGORIES
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const newCategories = { ...categories, [editingCategory.name]: editingCategory.style };
    setCategories(newCategories);
    saveCategories(newCategories);
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (name: string) => {
    if (confirm('¿Eliminar categoría?')) {
      const newCategories = { ...categories };
      delete newCategories[name];
      setCategories(newCategories);
      saveCategories(newCategories);
    }
  };

  return (
    <div className="admin-module">
      {defaultTab === 'tokens' && (
        <section className="dashboard-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <ModuleTitle title="Tokens de Activación" />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-lg btn-lg-primary" onClick={handleGenerateToken}>+ Generar Token</button>
              <button className="btn-lg btn-outline" onClick={() => setIsMassModalOpen(true)}>Generación Masiva</button>
              <button className="btn-lg btn-success" onClick={exportTokensToExcel}>Exportar Excel</button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr><th>Código</th><th>Estado</th><th>Usuario</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
              </thead>
              <tbody>
                {tokens.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map(t => (
                  <tr key={t.code}>
                    <td style={{ fontWeight: 700, color: 'var(--blue)' }}>{t.code}</td>
                    <td><span className={`badge ${t.used ? 'used' : 'avail'}`}>{t.used ? 'UTILIZADO' : 'DISPONIBLE'}</span></td>
                    <td>{t.usedBy || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteToken(t.code)} className="btn-delete">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination current={page} total={tokens.length} onPageChange={setPage} />
          </div>
        </section>
      )}

      {defaultTab === 'users' && (
        <section className="dashboard-section">
          <ModuleTitle title="Validación de Usuarios" />
          <input
            type="text" className="dashboard-input" placeholder="Buscar por nombre o correo..."
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{ marginBottom: '1.5rem' }}
          />
          <div className="user-grid-admin">
            {users.filter(u => u.rol !== 'admin').filter(u =>
              u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
              u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
              u.correo.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map(u => (
              <div key={u.correo} className="admin-user-card">
                <div>
                  <div className="u-name">{u.nombres} {u.apellidos}</div>
                  <div className="u-email">{u.correo}</div>
                  <span className={`badge ${u.pagoValidado ? 'paid' : 'pend'}`}>{u.pagoValidado ? 'PAGADO' : 'PENDIENTE'}</span>
                </div>
                {!u.pagoValidado && (
                  <button className="btn-sm-primary" onClick={() => handleValidateUser(u)}>Validar</button>
                )}
              </div>
            ))}
          </div>
          <Pagination current={page} total={users.filter(u => u.rol !== 'admin').length} onPageChange={setPage} />
        </section>
      )}

      {defaultTab === 'reports' && (
        <section className="dashboard-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <ModuleTitle title="Reporte de Inscritos" />
            <button className="btn-lg btn-success" onClick={exportToExcel}>Exportar a Excel</button>
          </div>
          <div className="filters-bar-admin" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input type="text" className="dashboard-input" placeholder="Buscar participante..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} style={{ flex: 2, minWidth: '200px' }} />
            <select className="dashboard-input" value={selectedWorkshopFilter} onChange={(e) => { setSelectedWorkshopFilter(e.target.value); setPage(1); }} style={{ flex: 1, minWidth: '150px' }}>
              <option value="">Todos los talleres</option>
              {agenda.filter(a => a.speaker).map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
            </select>
            <select className="dashboard-input" value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value as any); setPage(1); }} style={{ flex: 1, minWidth: '150px' }}>
              <option value="all">Todos los estados</option>
              <option value="paid">Solo pagados</option>
              <option value="unpaid">Solo sin pagar</option>
            </select>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Participante</th>
                  <th>Correo</th>
                  <th>Nombre Completo</th>
                  <th>{selectedWorkshopFilter ? 'Taller' : 'Talleres'}</th>
                  <th>Sexo</th>
                  <th>Tipo</th>
                  <th>Carné</th>
                  <th>Ciclo</th>
                  <th>Teléfono</th>
                  <th>Estado de Pago</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.rol !== 'admin').filter(u => {
                  const matchesSearch = u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) || u.correo.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesWorkshop = selectedWorkshopFilter === '' || (u.talleres && u.talleres.includes(selectedWorkshopFilter));
                  const matchesPayment = paymentFilter === 'all' || (paymentFilter === 'paid' && u.pagoValidado) || (paymentFilter === 'unpaid' && !u.pagoValidado);
                  return matchesSearch && matchesWorkshop && matchesPayment;
                }).slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map(u => (
                  <tr key={u.correo}>
                    <td><strong>{u.nombreDiploma || `${u.nombres} ${u.apellidos}`}</strong></td>
                    <td>{u.correo}</td>
                    <td>{u.nombres} {u.apellidos}</td>
                    <td>
                      {selectedWorkshopFilter ? getWorkshopTitle(selectedWorkshopFilter) : (u.talleres?.length ? u.talleres.map(id => getWorkshopTitle(id)).join(', ') : '-')}
                    </td>
                    <td>{u.sexo === 'M' ? 'Hombre' : 'Mujer'}</td>
                    <td>{u.tipoParticipante === 'alumno' ? 'Estudiante UMG' : (u.tipoParticipante === 'externo' ? 'Externo' : '-')}</td>
                    <td>{u.tipoParticipante === 'alumno' ? (u.carnet || '-') : '-'}</td>
                    <td>{u.tipoParticipante === 'alumno' ? (u.ciclo || '-') : '-'}</td>
                    <td>{u.telefono || '-'}</td>
                    <td><span className={`badge ${u.pagoValidado ? 'paid' : 'pend'}`}>{u.pagoValidado ? 'Pagado' : 'Sin pagar'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination current={page} total={users.filter(u => u.rol !== 'admin').filter(u => {
              const matchesSearch = u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) || u.correo.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesWorkshop = selectedWorkshopFilter === '' || (u.talleres && u.talleres.includes(selectedWorkshopFilter));
              const matchesPayment = paymentFilter === 'all' || (paymentFilter === 'paid' && u.pagoValidado) || (paymentFilter === 'unpaid' && !u.pagoValidado);
              return matchesSearch && matchesWorkshop && matchesPayment;
            }).length} onPageChange={setPage} />
          </div>
        </section>
      )}

      {defaultTab === 'agenda' && (
        <section className="dashboard-section">
          <div className="section-header">
            <ModuleTitle title="Gestión de Agenda" />
            <div className="tab-navigation-agenda">
              <button className={`tab-btn ${agendaTab === 'schedule' ? 'active' : ''}`} onClick={() => setAgendaTab('schedule')}>Horario</button>
              <button className={`tab-btn ${agendaTab === 'speakers' ? 'active' : ''}`} onClick={() => setAgendaTab('speakers')}>Ponentes</button>
              <button className={`tab-btn ${agendaTab === 'categories' ? 'active' : ''}`} onClick={() => setAgendaTab('categories')}>Categorías</button>
            </div>
          </div>

          {agendaTab === 'schedule' && (
            <div className="tab-content-agenda">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn-lg btn-lg-primary" onClick={() => { setEditingItem({ id: `w-${Date.now()}`, title: '', time: '8:00 AM', endTime: '10:00 AM', description: '', tag: 'IA', period: 'Mañana', location: 'SALA A', room: 'SALA A' }); setIsAgendaModalOpen(true); }}>
                  + Nuevo Taller
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Título</th><th>Horario</th><th>Sala</th><th>Categoría</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
                </thead>
                <tbody>
                  {agenda.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.title}</strong><br /><small>{item.speaker?.name || 'General'}</small></td>
                      <td>{item.time} - {item.endTime}</td>
                      <td>{item.room}</td>
                      <td><span className="tag-pill">{item.tag}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => { setEditingItem(item); setIsAgendaModalOpen(true); }} className="btn-edit-sm">Editar</button>
                        <button onClick={() => handleDeleteAgendaItem(item.id)} className="btn-delete-sm">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {agendaTab === 'speakers' && (
            <div className="tab-content-agenda">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn-lg btn-lg-primary" onClick={() => { setEditingSpeaker({ id: Date.now(), name: '', initials: '', role: '', tag: '', bio: '', bgColor: '#ffffff', textColor: '#01579b' }); setIsSpeakerModalOpen(true); }}>
                  + Nuevo Ponente
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Nombre</th><th>Cargo</th><th>Bio</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
                </thead>
                <tbody>
                  {speakers.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong> ({s.initials})</td>
                      <td>{s.role}</td>
                      <td style={{ maxWidth: '300px', fontSize: '12px' }}>{s.bio.substring(0, 80)}...</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => { setEditingSpeaker(s); setIsSpeakerModalOpen(true); }} className="btn-edit-sm">Editar</button>
                        <button onClick={() => handleDeleteSpeaker(s.id)} className="btn-delete-sm">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {agendaTab === 'categories' && (
            <div className="tab-content-agenda">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn-lg btn-lg-primary" onClick={() => { setEditingCategory({ name: '', style: { bg: 'rgba(0,0,0,0.05)', text: '#333' } }); setIsCategoryModalOpen(true); }}>
                  + Nueva Categoría
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Nombre</th><th>Vista Previa</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
                </thead>
                <tbody>
                  {Object.entries(categories).map(([name, style]) => (
                    <tr key={name}>
                      <td><strong>{name}</strong></td>
                      <td><span className="tag-pill" style={{ backgroundColor: style.bg, color: style.text }}>{name}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => { setEditingCategory({ name, style }); setIsCategoryModalOpen(true); }} className="btn-edit-sm">Editar</button>
                        <button onClick={() => handleDeleteCategory(name)} className="btn-delete-sm">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* MODAL HORARIO (WORKSHOP) */}
      {isAgendaModalOpen && editingItem && (
        <div className="modal-bg open" onClick={() => setIsAgendaModalOpen(false)}>
          <div className="modal agenda-modal" onClick={e => e.stopPropagation()}>
            <h3>{agenda.some(a => a.id === editingItem.id) ? 'Editar Taller' : 'Nuevo Taller'}</h3>
            <form onSubmit={handleSaveAgendaItem} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>TÍTULO</label>
                  <input type="text" value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>SALA</label>
                  <select value={editingItem.room} onChange={e => setEditingItem({ ...editingItem, room: e.target.value, location: e.target.value })} required>
                    {['SALA A', 'SALA B', 'SALA C', 'SALA D', 'SALA E', 'GENERAL'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>PONENTE</label>
                  <select 
                    value={editingItem.speaker?.id || ''} 
                    onChange={e => {
                      const s = speakers.find(sp => sp.id === parseInt(e.target.value));
                      setEditingItem({ ...editingItem, speaker: s });
                    }}
                  >
                    <option value="">Ninguno / General</option>
                    {speakers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>CATEGORÍA</label>
                  <select value={editingItem.tag} onChange={e => setEditingItem({ ...editingItem, tag: e.target.value })} required>
                    {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>INICIO</label>
                  <input type="text" value={editingItem.time} onChange={e => setEditingItem({ ...editingItem, time: e.target.value })} placeholder="8:00 AM" required />
                </div>
                <div className="form-group">
                  <label>FIN</label>
                  <input type="text" value={editingItem.endTime} onChange={e => setEditingItem({ ...editingItem, endTime: e.target.value })} placeholder="10:00 AM" required />
                </div>
              </div>
              <div className="form-group">
                <label>DESCRIPCIÓN</label>
                <textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-solid">Guardar Taller</button>
                <button type="button" onClick={() => setIsAgendaModalOpen(false)} className="btn-ghost">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PONENTE */}
      {isSpeakerModalOpen && editingSpeaker && (
        <div className="modal-bg open" onClick={() => setIsSpeakerModalOpen(false)}>
          <div className="modal agenda-modal" onClick={e => e.stopPropagation()}>
            <h3>{speakers.some(s => s.id === editingSpeaker.id) ? 'Editar Ponente' : 'Nuevo Ponente'}</h3>
            <form onSubmit={handleSaveSpeaker} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>NOMBRE</label>
                  <input type="text" value={editingSpeaker.name} onChange={e => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>INICIALES</label>
                  <input type="text" value={editingSpeaker.initials} onChange={e => setEditingSpeaker({ ...editingSpeaker, initials: e.target.value })} maxLength={3} required />
                </div>
              </div>
              <div className="form-group">
                <label>CARGO / ROL</label>
                <input type="text" value={editingSpeaker.role} onChange={e => setEditingSpeaker({ ...editingSpeaker, role: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>BIOGRAFÍA</label>
                <textarea value={editingSpeaker.bio} onChange={e => setEditingSpeaker({ ...editingSpeaker, bio: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>COLOR FONDO AVATAR</label>
                  <input type="color" value={editingSpeaker.bgColor} onChange={e => setEditingSpeaker({ ...editingSpeaker, bgColor: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>COLOR TEXTO AVATAR</label>
                  <input type="color" value={editingSpeaker.textColor} onChange={e => setEditingSpeaker({ ...editingSpeaker, textColor: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-solid">Guardar Ponente</button>
                <button type="button" onClick={() => setIsSpeakerModalOpen(false)} className="btn-ghost">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CATEGORÍA */}
      {isCategoryModalOpen && editingCategory && (
        <div className="modal-bg open" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3>{categories[editingCategory.name] ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            <form onSubmit={handleSaveCategory} className="admin-form">
              <div className="form-group">
                <label>NOMBRE</label>
                <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>COLOR TEXTO</label>
                <input type="color" value={editingCategory.style.text} onChange={e => setEditingCategory({ ...editingCategory, style: { ...editingCategory.style, text: e.target.value } })} />
              </div>
              <div className="form-group">
                <label>FONDO (RGBA/HEX)</label>
                <input type="text" value={editingCategory.style.bg} onChange={e => setEditingCategory({ ...editingCategory, style: { ...editingCategory.style, bg: e.target.value } })} placeholder="rgba(0,0,0,0.1)" />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-solid">Guardar</button>
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="btn-ghost">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MASIVO TOKENS */}
      {isMassModalOpen && (
        <div className="modal-bg open" onClick={() => setIsMassModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3>Generación Masiva</h3>
            <div className="form-group">
              <label>CANTIDAD</label>
              <input type="number" value={massQuantity} onChange={e => setMassQuantity(parseInt(e.target.value) || 0)} min="1" max="100" />
            </div>
            <div className="form-actions">
              <button onClick={handleMassGenerate} className="btn-solid">Generar</button>
              <button onClick={() => setIsMassModalOpen(false)} className="btn-ghost">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-module { padding: 0.5rem; }
        .admin-table { width: 100%; border-collapse: collapse; margin-top: 1rem; background: white; border-radius: 12px; overflow: hidden; }
        .admin-table th { background: #f8f9fa; padding: 12px 15px; text-align: left; font-size: 11px; text-transform: uppercase; color: var(--text-secondary); }
        .admin-table td { padding: 15px; border-bottom: 1px solid var(--border-soft); font-size: 14px; }
        
        .badge { font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 700; }
        .badge.used { background: #f1f3f5; color: #adb5bd; }
        .badge.avail { background: #ebfbee; color: #2f9e44; }
        .badge.paid { background: #e6fcf5; color: #0ca678; }
        .badge.pend { background: #fff5f5; color: #f03e3e; }

        .btn-delete { background: none; border: none; color: #fa5252; cursor: pointer; font-weight: 600; font-size: 12px; }
        .btn-edit-sm { background: #e7f5ff; color: #1971c2; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 8px; font-weight: 600; }
        .btn-delete-sm { background: #fff5f5; color: #e03131; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: 600; }

        .filters-bar-admin { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .user-grid-admin { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
        .admin-user-card { padding: 1.25rem; border-radius: 12px; background: white; border: 1px solid var(--border-soft); display: flex; justify-content: space-between; align-items: center; }
        .u-name { font-weight: 700; }
        .u-email { font-size: 12px; color: var(--text-secondary); margin-bottom: 5px; }

        .admin-form { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .admin-form input, .admin-form select, .admin-form textarea { width: 100%; padding: 10px; border: 1px solid var(--border-soft); border-radius: 8px; font-size: 14px; }
        .admin-form textarea { height: 100px; resize: none; }
        .admin-form label { font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 5px; display: block; }
        .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
        
        .tag-pill { background: #f1f3f5; padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 600; }
        .tab-navigation-agenda { display: flex; gap: 1rem; margin-top: 1rem; }
        .tab-btn { background: none; border: none; padding: 8px 20px; font-size: 14px; font-weight: 600; color: var(--text-secondary); cursor: pointer; border-radius: 8px; transition: all 0.2s; }
        .tab-btn.active { background: var(--blue); color: white; }
        .tab-content-agenda { margin-top: 2rem; background: white; padding: 2rem; border-radius: 16px; border: 1px solid var(--border-soft); }
      `}</style>
    </div>
  );
}
