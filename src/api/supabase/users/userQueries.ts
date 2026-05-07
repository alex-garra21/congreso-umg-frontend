import { supabase } from '../../../utils/supabase';
import type { UserData, TokenData } from '../../../utils/auth';
import { getEnrolledWorkshopsQuery, getAttendancesQuery } from '../enrollment/enrollmentQueries';

/**
 * QUERIES - Lectura de usuarios y tokens
 */

export async function getAllUsersQuery(): Promise<UserData[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*, tokens_creados:tokens_pago!creado_por(count)')
    .order('apellidos', { ascending: true });

  if (error) throw new Error(`Error al obtener usuarios: ${error.message}`);
  if (!data) return [];

  // Obtener todas las inscripciones y asistencias de una sola vez para evitar N+1 queries
  const { data: allInscripciones } = await supabase
    .from('inscripciones_talleres')
    .select(`
      id_usuario,
      id_charla,
      charlas!id_charla (
        categoria_id,
        categorias!categoria_id (nombre)
      )
    `);

  const { data: allAsistencias } = await supabase
    .from('asistencias')
    .select('id_usuario, id_charla, fecha_hora');

  // Agrupar en memoria
  const inscripcionesByUser: Record<string, any[]> = {};
  if (allInscripciones) {
    for (const row of allInscripciones) {
      const charla = row.charlas as any;
      const categoria = charla?.categorias?.nombre || '';
      if (!inscripcionesByUser[row.id_usuario]) inscripcionesByUser[row.id_usuario] = [];
      inscripcionesByUser[row.id_usuario].push({ id: row.id_charla, category: categoria });
    }
  }

  const asistenciasByUser: Record<string, any[]> = {};
  if (allAsistencias) {
    for (const row of allAsistencias) {
      if (!asistenciasByUser[row.id_usuario]) asistenciasByUser[row.id_usuario] = [];
      asistenciasByUser[row.id_usuario].push({ workshopId: row.id_charla, timestamp: row.fecha_hora });
    }
  }

  return data.map(userData => {
    const tokens = (userData as any).tokens_pago;
    const tokenInfo = Array.isArray(tokens) ? tokens[0] : tokens;

    return {
      id: userData.id,
      nombres: userData.nombres,
      apellidos: userData.apellidos,
      sexo: userData.sexo || 'M',
      correo: userData.correo,
      contrasena: 'auth_managed',
      rol: userData.rol as any,
      pagoValidado: userData.pago_validado,
      nombreDiploma: userData.nombre_diploma,
      tipoParticipante: userData.tipo_participante,
      carnet: userData.carnet,
      ciclo: userData.ciclo,
      telefono: userData.telefono,
      correoDiploma: userData.correo_diploma,
      desactivado: userData.desactivado || false,
      dpi: userData.dpi,
      avatarUrl: userData.avatar_url,
      tokenCreatedBy: tokenInfo?.creado_por,
      diplomaEditado: userData.diploma_editado,
      talleres: inscripcionesByUser[userData.id] || [],
      asistencias: asistenciasByUser[userData.id] || [],
      limiteTokens: userData.limite_tokens || 0,
      tokensCreados: (userData as any).tokens_creados?.[0]?.count || 0
    };
  });
}

export async function getTokensQuery(): Promise<TokenData[]> {
  const { data, error } = await supabase
    .from('tokens_pago')
    .select(`
      codigo, 
      correlativo_control,
      usado, 
      usado_por,
      creado_por,
      fecha_creacion,
      fecha_uso,
      usado_por_user:usuarios!usado_por(nombres, apellidos, correo, tipo_participante),
      creado_por_user:usuarios!creado_por(nombres, apellidos, rol)
    `);
    
  if (error) throw new Error(`Error al obtener tokens: ${error.message}`);
  if (!data) return [];

  return data.map(d => {
    const u = Array.isArray(d.usado_por_user) ? d.usado_por_user[0] : d.usado_por_user;
    const name = u ? `${(u as any).nombres} ${(u as any).apellidos}`.trim() : '';
    
    const creator = Array.isArray(d.creado_por_user) ? d.creado_por_user[0] : d.creado_por_user;
    const creatorName = creator ? `${(creator as any).nombres} ${(creator as any).apellidos}`.trim() : '';

    let type = (u as any)?.tipo_participante;
    if (type) type = type.toLowerCase();

    return {
      code: d.codigo,
      controlCode: d.correlativo_control,
      used: d.usado,
      usedBy: u ? (u as any).correo : undefined,
      usedByName: name || undefined,
      usedByType: type || undefined,
      createdAt: d.fecha_creacion,
      usedAt: d.fecha_uso,
      createdBy: d.creado_por,
      createdByName: creatorName || undefined,
      createdByRole: (creator as any)?.rol
    };
  });
}
export async function getUserProfileQuery(userId: string): Promise<UserData | null> {
  const { data: userData, error } = await supabase
    .from('usuarios')
    .select('*, tokens_creados:tokens_pago!creado_por(count)')
    .eq('id', userId)
    .single();

  if (error) throw new Error(`Error al obtener perfil: ${error.message}`);
  if (!userData) return null;

  const talleres = await getEnrolledWorkshopsQuery(userData.id);
  const asistencias = await getAttendancesQuery(userData.id);

  return {
    id: userData.id,
    nombres: userData.nombres,
    apellidos: userData.apellidos,
    sexo: userData.sexo || 'M',
    correo: userData.correo,
    contrasena: 'auth_managed',
    rol: userData.rol as any,
    pagoValidado: userData.pago_validado,
    pagoEnviado: userData.pago_enviado,
    nombreDiploma: userData.nombre_diploma,
    tipoParticipante: userData.tipo_participante,
    carnet: userData.carnet,
    ciclo: userData.ciclo,
    telefono: userData.telefono,
    correoDiploma: userData.correo_diploma,
    desactivado: userData.desactivado || false,
    dpi: userData.dpi,
    talleres,
    asistencias,
    diplomaEditado: userData.diploma_editado,
    avatarUrl: userData.avatar_url,
    limiteTokens: userData.limite_tokens || 0,
    tokensCreados: (userData as any).tokens_creados?.[0]?.count || 0
  };
}
