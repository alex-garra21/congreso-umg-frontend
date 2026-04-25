import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAgenda, type AgendaItem, type Speaker } from '../utils/agendaStore';
import { getRegisteredUsers, updateUserData, type UserData } from '../utils/auth';
import { markAttendanceCloud } from '../utils/supabaseEnrollment';

// Utility to parse time strings like "9:00 AM" to Date objects
function parseTimeStr(timeStr: string, baseDate?: string): Date {
  const [time, modifier] = timeStr.trim().split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (hours === 12) {
    hours = modifier === 'PM' ? 12 : 0;
  } else if (modifier === 'PM') {
    hours += 12;
  }

  // Si hay una fecha base (YYYY-MM-DD), la usamos. Si no, usamos hoy.
  let date: Date;
  if (baseDate) {
    // Usamos T00:00:00 para evitar problemas de zona horaria al crear el objeto Date
    date = new Date(`${baseDate}T00:00:00`);
  } else {
    date = new Date();
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
}

export default function AttendancePage() {
  const { workshopId } = useParams<{ workshopId: string }>();
  const [workshop, setWorkshop] = useState<AgendaItem | null>(null);
  const [speaker, setSpeaker] = useState<Speaker | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedUser, setConfirmedUser] = useState<UserData | null>(null);
  const [confirmationTime, setConfirmationTime] = useState<string>('');

  useEffect(() => {
    const loadWorkshop = () => {
      if (workshopId) {
        const agenda = getAgenda();
        const item = agenda.find(a => a.id === workshopId);
        if (item) {
          setWorkshop(item);
          if (item.speaker) {
            setSpeaker(item.speaker as Speaker);
          }
        }
      }
    };

    loadWorkshop();

    window.addEventListener('agendaUpdate', loadWorkshop);
    return () => window.removeEventListener('agendaUpdate', loadWorkshop);
  }, [workshopId]);

  const handleConfirmAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!workshop) {
      setError('Taller no encontrado.');
      return;
    }

    if (!email || !password) {
      setError('Por favor, ingresa tus credenciales.');
      return;
    }

    // 1. Verificación de Usuario
    const users = getRegisteredUsers();
    const user = users.find(u => u.correo.toLowerCase() === email.toLowerCase());

    if (!user || !user.id) {
      setError('Usuario no encontrado. Verifica tu correo.');
      return;
    }

    if (user.contrasena !== password) {
      setError('Contraseña incorrecta.');
      return;
    }

    // 2. Verificación de Inscripción al taller
    const isEnrolled = user.talleres?.includes(workshop.id);
    if (!isEnrolled) {
      setError('No estás inscrito en este taller según tu agenda.');
      return;
    }

    // 3. Verificación de Horario
    const now = new Date();
    const startTime = parseTimeStr(workshop.time, workshop.date);
    const endTime = parseTimeStr(workshop.endTime, workshop.date);

    // Usar el tiempo de gracia configurado o 10 minutos por defecto
    const graceMinutes = workshop.gracePeriod !== undefined ? workshop.gracePeriod : 10;
    endTime.setMinutes(endTime.getMinutes() + graceMinutes);

    // Para evitar bloqueos durante pruebas de desarrollo, si el evento es en el futuro/pasado, 
    // en producción debería restringirse estrictamente. Aquí lo implementamos según los requisitos.
    if (now < startTime || now > endTime) {
      setError(`La confirmación de asistencia solo está disponible durante el horario del taller (${workshop.time} - ${workshop.endTime}) y hasta ${graceMinutes} minutos después.`);
      return;
    }

    // 4. Verificación si ya confirmó antes
    const existingConfirmation = user.asistencias?.find(a => a.workshopId === workshop.id);
    if (existingConfirmation) {
      setConfirmedUser(user);
      setConfirmationTime(existingConfirmation.timestamp);
      setIsSuccess(true);
      return;
    }

    // 5. Registrar asistencia en la NUBE
    const { success } = await markAttendanceCloud(user.id, workshop.id);
    if (!success) {
      setError('Error de conexión al registrar la asistencia en la nube.');
      return;
    }

    // 6. Registrar asistencia local
    const timestamp = new Date().toISOString();
    const updatedUser: UserData = {
      ...user,
      asistencias: [...(user.asistencias || []), { workshopId: workshop.id, timestamp }]
    };

    const updateResult = await updateUserData(updatedUser);
    if (updateResult.success) {
      setConfirmedUser(updatedUser);
      setConfirmationTime(timestamp);
      setIsSuccess(true);
    } else {
      setError('Error al actualizar registro local.');
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString('es-GT', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!workshop) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: '#1a365d', marginBottom: '1rem', fontFamily: 'Syne' }}>Taller no encontrado</h2>
          <p style={{ color: '#4a5568', marginBottom: '2rem' }}>El código del taller proporcionado no es válido o ya no existe.</p>
          <Link to="/" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: 600 }}>Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', fontFamily: 'Inter, sans-serif' }}>

      {/* Tarjeta del Taller */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#0a2540',
        borderRadius: '16px',
        padding: '2rem',
        color: 'white',
        marginBottom: '1rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Decoración circular */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: '#63b3ed', textTransform: 'uppercase', marginBottom: '8px' }}>
            Taller en curso
          </p>
          <h1 style={{ fontSize: '28px', fontFamily: 'Syne', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {workshop.title}
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem', fontSize: '14px', color: '#e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '12px' }}>🕒</span>
              {workshop.time} – {workshop.endTime}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '12px' }}>🎤</span>
              {speaker ? speaker.name : 'General'}
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 600 }}>
            <span style={{ color: '#fc8181' }}>📍</span> {workshop.room}
          </div>
        </div>
      </div>

      {/* Formulario / Estado de Éxito */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {!isSuccess ? (
          <>
            <h2 style={{ fontSize: '22px', fontFamily: 'Syne', fontWeight: 800, color: '#1a202c', marginBottom: '8px' }}>
              Identifícate para confirmar
            </h2>
            <p style={{ fontSize: '14px', color: '#718096', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Ingresa tus datos una sola vez. Este dispositivo te recordará para futuros talleres.
            </p>

            {error && (
              <div style={{ backgroundColor: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '1.5rem', border: '1px solid #feb2b2' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleConfirmAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#4a5568', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#4a5568', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#1971c2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#1864ab'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#1971c2'}
              >
                Confirmar asistencia
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>

            {/* Header del usuario */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #edf2f7' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eef6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1971c2', fontWeight: 700, fontSize: '18px' }}>
                {(confirmedUser?.nombres?.[0] || '')}{(confirmedUser?.apellidos?.[0] || '')}
              </div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#1a202c' }}>{confirmedUser?.nombres} {confirmedUser?.apellidos}</div>
                <div style={{ fontSize: '13px', color: '#718096' }}>{confirmedUser?.correo}</div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '16px',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#0ca678" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 style={{ fontSize: '24px', fontFamily: 'Syne', fontWeight: 800, color: '#1a365d', marginBottom: '1rem', lineHeight: 1.2 }}>
                ¡Ya confirmaste tu<br />asistencia!
              </h2>
              <p style={{ color: '#4a5568', fontSize: '14px', marginBottom: '2rem', lineHeight: 1.5 }}>
                Tu presencia en este taller ya fue registrada correctamente.
              </p>

              <div style={{ width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                  <span style={{ color: '#718096' }}>Participante</span>
                  <span style={{ fontWeight: 600, color: '#1a202c', textAlign: 'right' }}>{confirmedUser?.nombres} {confirmedUser?.apellidos?.split(' ')[0]}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                  <span style={{ color: '#718096' }}>Taller</span>
                  <span style={{ fontWeight: 600, color: '#1a202c', textAlign: 'right', maxWidth: '150px' }}>{workshop.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                  <span style={{ color: '#718096' }}>Sala</span>
                  <span style={{ fontWeight: 600, color: '#1a202c', textAlign: 'right' }}>{workshop.room}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#718096' }}>Registrado</span>
                  <span style={{ fontWeight: 600, color: '#1a202c', textAlign: 'right' }}>{formatDate(confirmationTime)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
