import { useState } from 'react';
import { useAuth } from '../../../api/hooks/useAuth';
import { validateTokenMutation } from '../../../api/supabase/users/userMutations';
import ModuleTitle from '../../../components/ModuleTitle';
import { showToast } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';
import LoadingButton from '../../../components/ui/LoadingButton';
import BackButton from '../../../components/ui/BackButton';

export default function PaymentModule() {
  const [codigo, setCodigo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, refetchProfile } = useAuth();

  const isPaid = user?.pagoValidado;

  const handleSendPayment = async () => {
    if (!codigo.trim()) {
      showToast('Por favor, ingresa el código de pago.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await validateTokenMutation(codigo.trim());

      if (result.success) {
        refetchProfile();
        showToast('¡Código validado exitosamente! Tu inscripción ha sido activada.', 'success');
      } else {
        if (result.errorType === 'too_many_attempts') {
          showToast('Demasiados intentos fallidos. Por favor, intenta de nuevo más tarde o contacta a soporte.', 'error');
        } else if (result.errorType === 'not_found') {
          showToast('El código ingresado no existe. Por favor, verifica que lo hayas escrito correctamente.', 'error');
        } else if (result.errorType === 'already_used') {
          showToast('Este código ya ha sido validado por otro usuario.', 'warning');
        } else {
          showToast('Hubo un problema al validar tu código. Por favor, intenta de nuevo.', 'error');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPaid) {
    return (
      <div className="payment-module">
        <ModuleTitle title="Estado de pago" />
        <section className="dashboard-section" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', color: 'var(--status-success)', display: 'flex', justifyContent: 'center' }}>
            <Icons.CheckCircle size={80} strokeWidth={2} />
          </div>
          <h2 style={{ fontFamily: 'Source Sans 3', fontWeight: 800, fontSize: '32px', marginBottom: '1rem' }}>¡Pago Completado!</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2.5rem', fontSize: '16px', lineHeight: '1.6' }}>
            Tu inscripción ha sido validada exitosamente. Ya puedes disfrutar de todos los beneficios del congreso y elegir tus talleres.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <BackButton
              to="/dashboard/talleres"
              label="Ir a Selección de Talleres"
              icon={<Icons.Calendar size={18} color="#ffffff" />}
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="payment-module">
      <ModuleTitle title="Verificación de pago" />
      <section className="dashboard-section">

        <div className="payment-tab-content">
          <div className="payment-method-view">
            <h3 style={{ fontFamily: 'Source Sans 3', fontWeight: 800, fontSize: '20px', marginBottom: '0.5rem' }}>Ingresa tu código de pago a continuación:</h3>
            <p className="method-desc" style={{ color: 'var(--text-secondary)' }}>Ingresa el código de activación que se te proporcionó para validar el pago de tu inscripción.</p>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>CÓDIGO DE PAGO</label>
              <input
                type="text"
                placeholder="Ej: C2026-aBcD-1xYz-9QkL"
                className="dashboard-input"
                style={{ fontSize: '16px', padding: '14px' }}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>
          </div>

          <div className="payment-actions" style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
            <LoadingButton
              isLoading={isSubmitting}
              loadingText="Validando..."
              onClick={handleSendPayment}
              style={{ minWidth: '200px' }}
            >
              Validar código
            </LoadingButton>
          </div>
        </div>
      </section>

      {/* Botón regresar al inicio */}
      <BackButton />
    </div>
  );
}

