import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import React, { useState } from 'react';
import { useAuth } from '../api/hooks/useAuth';
import logoUMG from '../assets/UMG-LOGO.svg';
import { Icons } from './Icons';
import { getParticipantLabel } from '../data/userTypes';

interface SidebarProps {
  onModuleChange?: (moduleId: string) => void;
}

export default function Sidebar({ onModuleChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPaid = user?.pagoValidado;

  interface MenuItem {
    id: string;
    label: string;
    Icon: React.FC<any>;
    section: string;
    badge?: string;
  }

  const isAdmin = user?.rol === 'admin';
  const menuItems: MenuItem[] = [
    { id: 'inicio', label: 'Inicio', Icon: Icons.Home, section: 'GENERAL' },
    { id: 'perfil', label: 'Mi perfil', Icon: Icons.User, section: 'GENERAL' },
  ];

  if (isAdmin) {
    menuItems.push(
      { id: 'admin-tokens', label: 'Tokens de Pago', Icon: Icons.Shield, section: 'ADMINISTRACIÓN' },
      { id: 'admin-usuarios', label: 'Usuarios', Icon: Icons.User, section: 'ADMINISTRACIÓN' },
      { id: 'admin-asistencia', label: 'Control Asistencia', Icon: Icons.CheckCircle, section: 'ADMINISTRACIÓN' },
      { id: 'admin-reportes', label: 'Reportes', Icon: Icons.BarChart, section: 'ADMINISTRACIÓN' },
      { id: 'admin-agenda', label: 'Gestión Agenda', Icon: Icons.Clipboard, section: 'ADMINISTRACIÓN' }
    );
  } else {
    menuItems.push(
      { id: 'pago', label: 'Pago', Icon: Icons.CreditCard, section: 'INSCRIPCIÓN', badge: isPaid ? 'OK' : 'PEND' },
      { id: 'talleres', label: 'Mis talleres', Icon: Icons.Calendar, section: 'INSCRIPCIÓN' },
      { id: 'diploma', label: 'Diploma', Icon: Icons.Award, section: 'INSCRIPCIÓN' }
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (!user) return '??';
    const n = user.nombres?.[0] || '';
    const a = user.apellidos?.[0] || '';
    return (n + a).toUpperCase() || 'U';
  };

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {isExpanded ? (
            <div className="logo-full">
              <span className="logo-main">CONGRESO 2026</span>
              <span className="logo-sub">SISTEMAS UMG - COBÁN</span>
            </div>
          ) : (
            <img src={logoUMG} alt="UMG" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
          )}
        </div>
        <button className="expand-toggle" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '◀' : '▶'}
        </button>
      </div>

      <div 
        className="sidebar-user" 
        onClick={() => navigate('/dashboard/perfil')}
      >
        <div className="user-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            getInitials()
          )}
        </div>
        {isExpanded && (
          <div className="user-info" key={`${user?.correo}-${user?.nombres}-${user?.tipoParticipante}`}>
            <span className="user-name">
              {user?.nombres || 'Usuario'} {user?.apellidos || ''}
            </span>
            <span className="user-role">
              {getParticipantLabel(user?.tipoParticipante)}
            </span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {['GENERAL', 'INSCRIPCIÓN', 'ADMINISTRACIÓN']
          .filter(section => {
            if (section === 'INSCRIPCIÓN' && isAdmin) return false;
            if (section === 'ADMINISTRACIÓN' && !isAdmin) return false;
            return true;
          })
          .map(section => (
            <div key={section} className="nav-section">
              {isExpanded && <span className="section-title">{section}</span>}
              <ul className="nav-list">
                {menuItems.filter(item => item.section === section).map(item => (
                  <li key={item.id} className="nav-item">
                    <button
                      className={`nav-link ${location.pathname.includes(item.id) ? 'active' : (item.id === 'inicio' && location.pathname === '/dashboard' ? 'active' : '')}`}
                      onClick={() => {
                        navigate(`/dashboard/${item.id}`);
                        onModuleChange?.(item.id);
                      }}
                    >
                      <span className="nav-icon"><item.Icon size={18} /></span>
                      {isExpanded && <span className="nav-label">{item.label}</span>}
                      {isExpanded && item.badge && (
                        <span className={`nav-badge ${item.badge === 'PEND' ? 'pending' : ''}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon"><Icons.LogOut size={18} /></span>
          {isExpanded && <span className="nav-label">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
