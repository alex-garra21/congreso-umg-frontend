import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { type AgendaItem, type Speaker, generateSlug } from '../utils/agendaStore';
import { useCharlas } from '../api/hooks/useAgenda';
import { useAuth } from '../api/hooks/useAuth';
import { loginUser, type UserData } from '../utils/auth';
import { useMarkAttendance } from '../api/hooks/useEnrollment';

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedUser, setConfirmedUser] = useState<UserData | null>(null);
  const [confirmationTime, setConfirmationTime] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user: authUser } = useAuth();
  const markAttendanceMutation = useMarkAttendance();

  const { data: agenda = [], isLoading } = useCharlas();

  // Actualizar el tiempo cada 30 segundos para que la página sea reactiva al horario
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Cargar Taller
    if (workshopId && agenda.length > 0) {
      const item = agenda.find(a => a.id === workshopId || generateSlug(a.title) === workshopId);
      if (item) {
        setWorkshop(item);
        if (item.speaker) {
          setSpeaker(item.speaker as Speaker);
        }
      }

      if (authUser) {
        setEmail(authUser.correo); 
      }
    }
  }, [workshopId, agenda]);

  const handleConfirmAttendance = async (e?: React.FormEvent, isQuickConfirm: boolean = false) => {
    if (e) e.preventDefault();
    setError('');

    if (!workshop) {
      setError('Taller no encontrado.');
      return;
    }

    let user: UserData | null = null;

    if (isQuickConfirm && authUser) {
      user = authUser;
    } else {
      if (!email || !password) {
        setError('Por favor, ingresa tus credenciales.');
        return;
      }
      // Verificación de Usuario
      const loginResult = await loginUser(email, password);
      if (!loginResult.success || !loginResult.user) {
        setError(loginResult.message);
        return;
      }
      user = loginResult.user;
    }
    
    if (!user || !user.id) {
      setError('Error interno: El usuario no es válido.');
      return;
    }

    // 2. Verificación de Inscripción al taller
    const isEnrolled = user.talleres?.includes(workshop.id);
    if (!isEnrolled) {
      setError('No apareces inscrito en este taller. Primero debes agregarlo a tu agenda en la sección "Mis Talleres" de tu perfil.');
      return;
    }

    // 3. Verificación de Horario (Usando currentTime para consistencia)
    const startTime = parseTimeStr(workshop.time, workshop.date);
    const endTime = parseTimeStr(workshop.endTime, workshop.date);

    // Usar el tiempo de gracia configurado o 10 minutos por defecto
    const graceMinutes = workshop.gracePeriod !== undefined ? workshop.gracePeriod : 10;
    endTime.setMinutes(endTime.getMinutes() + graceMinutes);

    if (currentTime < startTime || currentTime > endTime) {
      setError(`La confirmación de asistencia está disponible desde el inicio del taller (${workshop.time}) hasta ${graceMinutes} minutos después de su finalización (${workshop.endTime}).`);
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
    try {
      await markAttendanceMutation.mutateAsync({ userId: user.id, workshopId: workshop.id });
    } catch (error) {
      setError('Ocurrió un error al registrar tu asistencia en la nube. Por favor intenta de nuevo.');
      return;
    }

    // 6. Registrar asistencia en la nube (Ya se hizo arriba, esto dispara el éxito visual)
    const timestamp = new Date().toISOString();
    setConfirmedUser(user);
    setConfirmationTime(timestamp);
    setIsSuccess(true);
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

  // Determinar si el taller está fuera de horario
  const checkIsOutOfTime = () => {
    if (!workshop) return true;
    const startTime = parseTimeStr(workshop.time, workshop.date);
    const endTime = parseTimeStr(workshop.endTime, workshop.date);
    const graceMinutes = workshop.gracePeriod !== undefined ? workshop.gracePeriod : 10;
    endTime.setMinutes(endTime.getMinutes() + graceMinutes);
    return currentTime < startTime || currentTime > endTime;
  };

  const isOutOfTime = checkIsOutOfTime();

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando información del taller...</p>
      </div>
    );
  }

  if (!workshop) {
    return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: '#1a365d', marginBottom: '1rem', fontFamily: 'Syne' }}>Taller no encontrado</h2>
          <p style={{ color: '#4a5568', marginBottom: '2rem' }}>El código del taller proporcionado no es válido o ya no existe.</p>
          <Link to="/" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: 600 }}>Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, background: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', fontFamily: 'Inter, sans-serif' }}>

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
          <p style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            letterSpacing: '1px', 
            color: isOutOfTime ? '#fc8181' : '#63b3ed', 
            textTransform: 'uppercase', 
            marginBottom: '8px' 
          }}>
            {isOutOfTime ? 'Taller fuera de horario' : 'Taller en curso'}
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

      {/* Formulario / Estado de Éxito - Solo se muestra si NO está fuera de horario o si ya tuvo éxito */}
      {(!isOutOfTime || isSuccess) && (
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
              {authUser ? (
                /* Vista de Confirmación Rápida */
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: '#eef6ff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#1971c2', 
                    fontWeight: 700, 
                    fontSize: '20px',
                    margin: '0 auto 1rem'
                  }}>
                    {authUser.nombres[0]}{authUser.apellidos[0]}
                  </div>
                  <h2 style={{ fontSize: '22px', fontFamily: 'Syne', fontWeight: 800, color: '#1a202c', marginBottom: '8px' }}>
                    ¡Hola, {authUser.nombres.split(' ')[0]}!
                  </h2>
                  <p style={{ fontSize: '14px', color: '#718096', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Hemos detectado tu sesión activa. ¿Deseas confirmar tu asistencia a este taller?
                  </p>

                  {error && (
                    <div style={{ backgroundColor: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '1.5rem', border: '1px solid #feb2b2' }}>
                      {error}
                    </div>
                  )}

                  <button
                    onClick={(e) => handleConfirmAttendance(e, true)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#0ca678',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      boxShadow: '0 4px 12px rgba(12, 166, 120, 0.3)'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#099268'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#0ca678'}
                  >
                    Sí, confirmar ahora
                  </button>

                  <button
                    onClick={() => {
                      import('../utils/supabase').then(m => m.supabase.auth.signOut());
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3182ce',
                      fontSize: '13px',
                      marginTop: '1.5rem',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    No soy yo, usar otra cuenta
                  </button>
                </div>
              ) : (
                /* Formulario Tradicional */
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

                  <form onSubmit={(e) => handleConfirmAttendance(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Tu contraseña"
                          required
                          style={{ width: '100%', padding: '12px 16px', paddingRight: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          )}
                        </button>
                      </div>
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
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>

              {/* Header del usuario confirmado */}
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
      )}

      {/* Mensaje informativo si está fuera de horario */}
      {isOutOfTime && !isSuccess && (
        <div style={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          marginTop: '2rem',
          color: '#4a5568'
        }}>
          <p style={{ fontSize: '14px' }}>
            La confirmación de asistencia se habilitará automáticamente cuando inicie el taller.
          </p>
        </div>
      )}
    </div>
  );
}
