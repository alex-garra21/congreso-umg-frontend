// v3 - Added Agenda Sub-tabs (Horario, Ponentes, Categorías)
import React, { useState, useEffect } from 'react';
import { getAllUsersCloud, updateUserData, getTokens, generateToken, deleteToken, type UserData, type TokenData } from '../utils/auth';
import {
  getAgenda, saveAgenda,
  getSpeakers, saveSpeakers,
  getCategories, saveCategories,
  getRooms, saveRooms,
  type AgendaItem, type Speaker, type CategoryStyle
} from '../utils/agendaStore';
import ModuleTitle from '../components/ModuleTitle';
import ConfirmModal from '../components/ConfirmModal';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface AdminModuleProps {
  defaultTab: 'tokens' | 'users' | 'reports' | 'agenda' | 'attendance';
}

export default function AdminModule({ defaultTab }: AdminModuleProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [categories, setCategories] = useState<Record<string, CategoryStyle>>({});
  const [rooms, setRooms] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [participantTypeFilter, setParticipantTypeFilter] = useState<'all' | 'alumno' | 'externo'>('all');

  // Paginación
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  // Estados para Agenda Sub-tabs
  const [agendaTab, setAgendaTab] = useState<'schedule' | 'speakers' | 'categories' | 'rooms'>('schedule');

  // Modals
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ name: string, style: CategoryStyle } | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<{ oldName: string, newName: string } | null>(null);
  const [isMassModalOpen, setIsMassModalOpen] = useState(false);
  const [massQuantity, setMassQuantity] = useState(10);
  
  // Estados para Modal de Gracia
  const [isGraceModalOpen, setIsGraceModalOpen] = useState(false);
  const [graceWorkshop, setGraceWorkshop] = useState<AgendaItem | null>(null);
  const [tempGrace, setTempGrace] = useState<number>(10);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Modal de confirmación
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void, isDestructive = false, confirmText = 'Confirmar') => {
    setConfirmModalState({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        await onConfirm();
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
      },
      isDestructive,
      confirmText
    });
  };

  useEffect(() => {
    getAllUsersCloud().then(setUsers);
    getTokens().then(setTokens);
    setAgenda(getAgenda());
    setSpeakers(getSpeakers());
    setCategories(getCategories());
    setRooms(getRooms());
    setPage(1);
  }, [defaultTab]);

  const handleGenerateToken = async () => {
    await generateToken();
    setTokens(await getTokens());
    setPage(1);
  };

  const handleMassGenerate = async () => {
    for (let i = 0; i < massQuantity; i++) {
      await generateToken();
    }
    setTokens(await getTokens());
    setIsMassModalOpen(false);
    setPage(1);
  };

  const handleDeleteToken = async (code: string) => {
    openConfirm('Eliminar Token', '¿Estás seguro de eliminar este token?', async () => {
      await deleteToken(code);
      setTokens(await getTokens());
    }, true, 'Eliminar');
  };

  const handleValidateUser = async (user: UserData) => {
    const updated = { ...user, pagoValidado: true };
    await updateUserData(updated);
    setUsers(await getAllUsersCloud());
    alert(`Pago validado para ${user.nombres} ${user.apellidos}`);
  };

  const handleDeactivateUser = async (user: UserData) => {
    openConfirm('Desactivar Usuario', `¿Estás seguro de desactivar a ${user.nombres} ${user.apellidos}? No aparecerá en los informes y reportes.`, async () => {
      const updated = { ...user, desactivado: true };
      await updateUserData(updated);
      setUsers(await getAllUsersCloud());
    }, true, 'Desactivar');
  };

  const handleActivateUser = async (user: UserData) => {
    openConfirm('Activar Usuario', `¿Estás seguro de activar nuevamente a ${user.nombres} ${user.apellidos}?`, async () => {
      const updated = { ...user, desactivado: false };
      await updateUserData(updated);
      setUsers(await getAllUsersCloud());
    }, false, 'Activar');
  };

  const handlePromoteToAdmin = async (user: UserData) => {
    openConfirm('Promover a Administrador', `¿Estás seguro de promover a ${user.nombres} ${user.apellidos} a Administrador?`, async () => {
      const updated = { ...user, rol: 'admin' as const };
      await updateUserData(updated);
      setUsers(await getAllUsersCloud());
    }, false, 'Promover');
  };

  const handleDemoteToUser = async (user: UserData) => {
    openConfirm('Degradar a Usuario', `¿Estás seguro de degradar a ${user.nombres} ${user.apellidos} a Usuario participante?`, async () => {
      const updated = { ...user, rol: 'usuario' as const };
      await updateUserData(updated);
      setUsers(await getAllUsersCloud());
    }, true, 'Degradar');
  };

  const getWorkshopTitle = (id: string) => {
    const w = agenda.find(item => item.id === id);
    return w ? w.title : id;
  };

  const exportToExcel = async () => {
    const filtered = users.filter(u => u.rol !== 'admin' && !u.desactivado).filter(u => {
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participantes');

    const columnTitle = selectedWorkshopFilter ? 'Taller' : 'Todos los talleres';

    worksheet.columns = [
      { header: 'Participante', key: 'name', width: 30 },
      { header: 'Correo Electrónico', key: 'email', width: 30 },
      { header: columnTitle, key: 'workshops', width: 40 },
      { header: 'Sexo', key: 'gender', width: 15 },
      { header: 'Tipo de Participante', key: 'type', width: 25 },
      { header: 'Carné', key: 'idCard', width: 15 },
      { header: 'Ciclo', key: 'cycle', width: 10 },
      { header: 'Teléfono', key: 'phone', width: 15 },
      { header: 'Estado de Pago', key: 'payment', width: 20 },
    ];

    filtered.forEach(u => {
      const workshopsText = selectedWorkshopFilter
        ? getWorkshopTitle(selectedWorkshopFilter)
        : (u.talleres?.map(tid => getWorkshopTitle(tid)).join(', ') || 'Sin talleres');

      worksheet.addRow({
        name: u.nombreDiploma || `${u.nombres} ${u.apellidos}`,
        email: u.correoDiploma || u.correo,
        workshops: workshopsText,
        gender: u.sexo === 'M' ? 'Hombre' : 'Mujer',
        type: u.tipoParticipante === 'alumno' ? 'Estudiante UMG' : (u.tipoParticipante === 'externo' ? 'Externo' : 'N/A'),
        idCard: u.tipoParticipante === 'alumno' ? (u.carnet || 'N/A') : 'N/A',
        cycle: u.tipoParticipante === 'alumno' ? (u.ciclo || 'N/A') : 'N/A',
        phone: u.telefono || 'N/A',
        payment: u.pagoValidado ? 'Pagado' : 'Sin pagar'
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const workshopSuffix = selectedWorkshopFilter ? ` - ${getWorkshopTitle(selectedWorkshopFilter)}` : ' - Todos los talleres';
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Reporte_Congreso_2026${workshopSuffix}.xlsx`);
  };

  const exportDiplomasToExcel = async () => {
    const filtered = users.filter(u => u.rol !== 'admin' && !u.desactivado).filter(u => {
      const matchesSearch = u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.correo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWorkshop = selectedWorkshopFilter === '' || (u.talleres && u.talleres.includes(selectedWorkshopFilter));
      const matchesPayment = paymentFilter === 'all' || (paymentFilter === 'paid' && u.pagoValidado) || (paymentFilter === 'unpaid' && !u.pagoValidado);
      const matchesType = participantTypeFilter === 'all' || u.tipoParticipante === participantTypeFilter;
      return matchesSearch && matchesWorkshop && matchesPayment && matchesType;
    });

    if (filtered.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lista para Diplomas');

    const columnTitle = selectedWorkshopFilter ? 'Taller' : 'Talleres';

    worksheet.columns = [
      { header: 'Participante', key: 'name', width: 35 },
      { header: 'Correo Electrónico', key: 'email', width: 35 },
      { header: columnTitle, key: 'workshops', width: 45 }
    ];

    filtered.forEach(u => {
      const workshopsText = selectedWorkshopFilter
        ? getWorkshopTitle(selectedWorkshopFilter)
        : (u.talleres?.map(tid => getWorkshopTitle(tid)).join(', ') || 'Sin talleres');

      worksheet.addRow({
        name: u.nombreDiploma || `${u.nombres} ${u.apellidos}`,
        email: u.correoDiploma || u.correo,
        workshops: workshopsText
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const workshopSuffix = selectedWorkshopFilter ? ` - ${getWorkshopTitle(selectedWorkshopFilter)}` : ' - Todos los talleres';
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Lista_Diplomas_2026${workshopSuffix}.xlsx`);
  };

  const exportTokensToExcel = async () => {
    if (tokens.length === 0) {
      alert('No hay tokens para exportar.');
      return;
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tokens');

    worksheet.columns = [
      { header: 'Token de Activación', key: 'code', width: 25 },
      { header: 'Estado', key: 'status', width: 20 },
      { header: 'Utilizado por', key: 'usedBy', width: 30 }
    ];

    tokens.forEach(t => {
      worksheet.addRow({
        code: t.code,
        status: t.used ? 'Utilizado' : 'Disponible',
        usedBy: t.usedBy || 'N/A'
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Tokens_Acceso_Congreso_2026.xlsx');
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
    openConfirm('Eliminar Taller', '¿Eliminar taller de la agenda?', () => {
      const newAgenda = agenda.filter(a => a.id !== id);
      setAgenda(newAgenda);
      saveAgenda(newAgenda);
    }, true, 'Eliminar');
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

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.newName.trim()) return;
    
    let newRooms = [...rooms];
    if (editingRoom.oldName && rooms.includes(editingRoom.oldName)) {
      newRooms = newRooms.map(r => r === editingRoom.oldName ? editingRoom.newName : r);
      // Actualizar también las charlas que usaban esa sala
      const newAgenda = agenda.map(a => a.room === editingRoom.oldName ? { ...a, room: editingRoom.newName, location: editingRoom.newName } : a);
      setAgenda(newAgenda);
      saveAgenda(newAgenda);
    } else if (!rooms.includes(editingRoom.newName)) {
      newRooms.push(editingRoom.newName);
    }
    
    setRooms(newRooms);
    saveRooms(newRooms);
    setIsRoomModalOpen(false);
  };

  const handleDeleteRoom = (roomName: string) => {
    openConfirm('Eliminar Sala', `¿Eliminar la sala "${roomName}"?`, () => {
      const newRooms = rooms.filter(r => r !== roomName);
      setRooms(newRooms);
      saveRooms(newRooms);
    }, true, 'Eliminar');
  };

  const handleUpdateGracePeriod = (workshopId: string) => {
    const workshop = agenda.find(a => a.id === workshopId);
    if (!workshop) return;
    setGraceWorkshop(workshop);
    setTempGrace(workshop.gracePeriod ?? 10);
    setIsGraceModalOpen(true);
  };

  const saveGracePeriod = () => {
    if (!graceWorkshop) return;
    const newAgenda = agenda.map(a => a.id === graceWorkshop.id ? { ...a, gracePeriod: tempGrace } : a);
    setAgenda(newAgenda);
    saveAgenda(newAgenda);
    setIsGraceModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleShowLink = (workshopId: string) => {
    const link = `${window.location.origin}/asistencia/${workshopId}`;
    window.open(link, '_blank');
  };

  const handleDeleteSpeaker = (id: number) => {
    openConfirm('Eliminar Ponente', '¿Eliminar ponente?', () => {
      const newSpeakers = speakers.filter(s => s.id !== id);
      setSpeakers(newSpeakers);
      saveSpeakers(newSpeakers);
    }, true, 'Eliminar');
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
    openConfirm('Eliminar Categoría', '¿Eliminar categoría?', () => {
      const newCategories = { ...categories };
      delete newCategories[name];
      setCategories(newCategories);
      saveCategories(newCategories);
    }, true, 'Eliminar');
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
          <ModuleTitle title="Usuarios" />
          <input
            type="text" className="dashboard-input" placeholder="Buscar por nombre o correo..."
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{ marginBottom: '1.5rem' }}
          />
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado de Pago</th>
                  <th style={{ textAlign: 'right' }}>Opciones</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u =>
                  u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  u.correo.toLowerCase().includes(searchTerm.toLowerCase())
                ).slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map(u => (
                  <tr key={u.correo}>
                    <td><strong>{u.nombres} {u.apellidos}</strong></td>
                    <td>{u.correo}</td>
                    <td>
                      {u.rol === 'admin' ? (
                        <span className="badge" style={{ backgroundColor: '#862e9c', color: 'white' }}>ADMINISTRADOR</span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: '#f1f3f5', color: '#495057' }}>PARTICIPANTE</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${u.desactivado ? 'pend' : (u.pagoValidado ? 'paid' : 'pend')}`}>
                        {u.desactivado ? 'DESACTIVADO' : (u.pagoValidado ? 'PAGADO' : 'PENDIENTE')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {!u.desactivado && !u.pagoValidado && u.rol !== 'admin' && (
                        <button className="btn-edit-sm" style={{ backgroundColor: '#e6fcf5', color: '#0ca678' }} onClick={() => handleValidateUser(u)}>Validar Pago</button>
                      )}
                      
                      {u.rol === 'admin' ? (
                        <button className="btn-edit-sm" style={{ backgroundColor: '#ffe3e3', color: '#e03131' }} onClick={() => handleDemoteToUser(u)}>Degradar a Usuario</button>
                      ) : (
                        !u.desactivado && (
                          <button className="btn-edit-sm" style={{ backgroundColor: '#fff3cd', color: '#856404' }} onClick={() => handlePromoteToAdmin(u)}>Promover a Admin</button>
                        )
                      )}
                      
                      {u.desactivado ? (
                        <button className="btn-edit-sm" style={{ backgroundColor: '#e7f5ff', color: '#1971c2' }} onClick={() => handleActivateUser(u)}>Activar</button>
                      ) : (
                        <button className="btn-delete-sm" onClick={() => handleDeactivateUser(u)}>Desactivar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination current={page} total={users.filter(u =>
            u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.correo.toLowerCase().includes(searchTerm.toLowerCase())
          ).length} onPageChange={setPage} />
        </section>
      )}

      {defaultTab === 'attendance' && (
        <section className="dashboard-section">
          <ModuleTitle title="Control de Asistencia" />
          <div className="table-responsive" style={{ marginTop: '1.5rem' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Taller</th>
                  <th>Horario Actual</th>
                  <th>Gracia (min)</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {agenda.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>{item.room}</div>
                    </td>
                    <td>{item.time} - {item.endTime}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#eef2ff', color: '#4338ca' }}>
                        +{item.gracePeriod ?? 10} min
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="btn-edit-sm" style={{ backgroundColor: '#f3f0ff', color: '#6741d9' }} onClick={() => handleUpdateGracePeriod(item.id)}>
                        Configurar Gracia
                      </button>
                      <button className="btn-edit-sm" style={{ backgroundColor: '#e7f5ff', color: '#1971c2' }} onClick={() => handleShowLink(item.id)}>
                        Ver Enlace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {defaultTab === 'reports' && (
        <section className="dashboard-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <ModuleTitle title="Reporte de Inscritos" />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-lg btn-success" onClick={exportToExcel}>Exportar a Todas las Columnas</button>
              <button className="btn-lg btn-solid" onClick={exportDiplomasToExcel} style={{ backgroundColor: '#4a5568' }}>Exportar lista para Diplomas</button>
            </div>
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
            <select className="dashboard-input" value={participantTypeFilter} onChange={(e) => { setParticipantTypeFilter(e.target.value as any); setPage(1); }} style={{ flex: 1, minWidth: '150px' }}>
              <option value="all">Todos los tipos</option>
              <option value="alumno">Estudiante UMG</option>
              <option value="externo">Participante Externo</option>
            </select>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Participante</th>
                  <th>Correo</th>
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
                {users.filter(u => u.rol !== 'admin' && !u.desactivado).filter(u => {
                  const matchesSearch = u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) || u.correo.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesWorkshop = selectedWorkshopFilter === '' || (u.talleres && u.talleres.includes(selectedWorkshopFilter));
                  const matchesPayment = paymentFilter === 'all' || (paymentFilter === 'paid' && u.pagoValidado) || (paymentFilter === 'unpaid' && !u.pagoValidado);
                  const matchesType = participantTypeFilter === 'all' || u.tipoParticipante === participantTypeFilter;
                  return matchesSearch && matchesWorkshop && matchesPayment && matchesType;
                }).slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map(u => (
                  <tr key={u.correo}>
                    <td><strong>{u.nombreDiploma || `${u.nombres} ${u.apellidos}`}</strong></td>
                    <td>{u.correoDiploma || u.correo}</td>
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
            <Pagination current={page} total={users.filter(u => u.rol !== 'admin' && !u.desactivado).filter(u => {
              const matchesSearch = u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) || u.correo.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesWorkshop = selectedWorkshopFilter === '' || (u.talleres && u.talleres.includes(selectedWorkshopFilter));
              const matchesPayment = paymentFilter === 'all' || (paymentFilter === 'paid' && u.pagoValidado) || (paymentFilter === 'unpaid' && !u.pagoValidado);
              const matchesType = participantTypeFilter === 'all' || u.tipoParticipante === participantTypeFilter;
              return matchesSearch && matchesWorkshop && matchesPayment && matchesType;
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
              <button className={`tab-btn ${agendaTab === 'rooms' ? 'active' : ''}`} onClick={() => setAgendaTab('rooms')}>Salas</button>
            </div>
          </div>

          {agendaTab === 'schedule' && (
            <div className="tab-content-agenda">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn-lg btn-lg-primary" onClick={() => { 
                  const today = new Date().toISOString().split('T')[0];
                  setEditingItem({ id: `w-${Date.now()}`, title: '', time: '8:00 AM', endTime: '10:00 AM', description: '', tag: 'IA', period: 'Mañana', location: 'SALA A', room: 'SALA A', date: today }); 
                  setIsAgendaModalOpen(true); 
                }}>
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

          {agendaTab === 'rooms' && (
            <div className="tab-content-agenda">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn-lg btn-lg-primary" onClick={() => { setEditingRoom({ oldName: '', newName: '' }); setIsRoomModalOpen(true); }}>
                  + Nueva Sala
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Nombre de la Sala</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
                </thead>
                <tbody>
                  {rooms.map(roomName => (
                    <tr key={roomName}>
                      <td><strong>{roomName}</strong></td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => { setEditingRoom({ oldName: roomName, newName: roomName }); setIsRoomModalOpen(true); }} className="btn-edit-sm">Editar</button>
                        <button onClick={() => handleDeleteRoom(roomName)} className="btn-delete-sm">Eliminar</button>
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
        <div className="modal-bg open">
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
                    {rooms.map(r => <option key={r} value={r}>{r}</option>)}
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
                  <label>FECHA</label>
                  <input
                    type="date"
                    value={editingItem.date || new Date().toISOString().split('T')[0]}
                    onChange={e => setEditingItem({ ...editingItem, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>INICIO</label>
                  <select value={editingItem.time} onChange={e => setEditingItem({ ...editingItem, time: e.target.value })} required>
                    {['12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>FIN</label>
                  <select value={editingItem.endTime} onChange={e => setEditingItem({ ...editingItem, endTime: e.target.value })} required>
                    {['12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
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

      {/* MODAL CONFIGURAR GRACIA */}
      {isGraceModalOpen && graceWorkshop && (
        <div className="modal-bg open">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 style={{ fontFamily: 'Syne', marginBottom: '1rem' }}>Tiempo de Gracia</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '1.5rem' }}>
              Configura los minutos adicionales para validar asistencia después de finalizar <strong>{graceWorkshop.title}</strong>.
            </p>
            <div className="form-group">
              <label>MINUTOS ADICIONALES</label>
              <input 
                type="number" 
                value={tempGrace} 
                onChange={e => setTempGrace(parseInt(e.target.value) || 0)} 
                min="0"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
            <div className="form-actions" style={{ marginTop: '2rem' }}>
              <button className="btn-solid" onClick={saveGracePeriod} style={{ width: '100%' }}>Guardar Cambios</button>
              <button className="btn-ghost" onClick={() => setIsGraceModalOpen(false)} style={{ width: '100%' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ÉXITO (Diseño solicitado) */}
      {isSuccessModalOpen && (
        <div className="modal-bg open">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              border: '4px solid #82d616', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 2rem',
              color: '#82d616'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Syne', fontSize: '32px', fontWeight: 800, marginBottom: '1rem' }}>¡Cambios Guardados!</h2>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '2.5rem' }}>Tu información ha sido actualizada correctamente.</p>
            <button 
              className="btn-solid" 
              onClick={() => setIsSuccessModalOpen(false)}
              style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: 700, borderRadius: '12px' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL PONENTE */}
      {isSpeakerModalOpen && editingSpeaker && (
        <div className="modal-bg open">
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
              <div className="form-group">
                <label>IMAGEN DEL PONENTE (AVATAR)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {editingSpeaker.avatar && (
                    <img
                      src={editingSpeaker.avatar}
                      alt="Avatar Preview"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditingSpeaker({ ...editingSpeaker, avatar: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
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
        <div className="modal-bg open">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{categories[editingCategory.name] ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            <form onSubmit={handleSaveCategory} className="admin-form">
              <div className="form-group">
                <label>NOMBRE CATEGORÍA</label>
                <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} disabled={!!categories[editingCategory.name] && editingCategory.name !== ''} required />
                {!!categories[editingCategory.name] && <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>El nombre no se puede cambiar, elimina y crea una nueva si es necesario.</small>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>COLOR FONDO</label>
                  <input type="text" value={editingCategory.style.bg} onChange={e => setEditingCategory({ ...editingCategory, style: { ...editingCategory.style, bg: e.target.value } })} placeholder="ej. rgba(1, 87, 155, 0.15) o #f0f0f0" required />
                </div>
                <div className="form-group">
                  <label>COLOR TEXTO</label>
                  <input type="text" value={editingCategory.style.text} onChange={e => setEditingCategory({ ...editingCategory, style: { ...editingCategory.style, text: e.target.value } })} placeholder="ej. #01579b" required />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-solid">Guardar Categoría</button>
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="btn-ghost">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SALA */}
      {isRoomModalOpen && editingRoom && (
        <div className="modal-bg open">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 style={{ fontFamily: 'Syne', marginBottom: '1rem' }}>{editingRoom.oldName ? 'Editar Sala' : 'Nueva Sala'}</h3>
            <form onSubmit={handleSaveRoom} className="admin-form">
              <div className="form-group">
                <label>NOMBRE DE LA SALA</label>
                <input 
                  type="text" 
                  value={editingRoom.newName} 
                  onChange={e => setEditingRoom({ ...editingRoom, newName: e.target.value })} 
                  placeholder="Ej. SALA F"
                  required 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <div className="form-actions" style={{ marginTop: '2rem' }}>
                <button type="submit" className="btn-solid" style={{ width: '100%' }}>Guardar Sala</button>
                <button type="button" className="btn-ghost" onClick={() => setIsRoomModalOpen(false)} style={{ width: '100%' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ÉXITO (Diseño solicitado) */}
      {isSuccessModalOpen && (
        <div className="modal-bg open">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              border: '4px solid #82d616', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 2rem',
              color: '#82d616'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Syne', fontSize: '32px', fontWeight: 800, marginBottom: '1rem' }}>¡Cambios Guardados!</h2>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '2.5rem' }}>Tu información ha sido actualizada correctamente.</p>
            <button 
              className="btn-solid" 
              onClick={() => setIsSuccessModalOpen(false)}
              style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: 700, borderRadius: '12px' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL MASIVO TOKENS */}
      {isMassModalOpen && (
        <div className="modal-bg open">
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

      <ConfirmModal
        {...confirmModalState}
        onCancel={() => setConfirmModalState(p => ({ ...p, isOpen: false }))}
      />

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
