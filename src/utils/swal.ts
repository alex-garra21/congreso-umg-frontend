import Swal from 'sweetalert2';

// Definimos los tipos localmente para evitar problemas de exportación si los hay
type SweetAlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question';

const isDarkMode = () => {
  if (typeof window === 'undefined') return false;
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
};

export const showToast = (title: string, icon: SweetAlertIcon = 'success') => {
  const dark = isDarkMode();
  
  return Swal.fire({
    title,
    icon,
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: dark ? '#232320' : '#ffffff',
    color: dark ? '#f0ede8' : '#1a1a18',
    customClass: {
      popup: 'swal2-custom-popup',
      title: 'swal2-custom-title'
    }
  });
};

export const showConfirm = async (
  title: string, 
  text: string, 
  confirmText: string = 'Confirmar', 
  isDestructive: boolean = false
): Promise<boolean> => {
  const dark = isDarkMode();

  const result = await Swal.fire({
    title,
    text,
    icon: isDestructive ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonColor: isDestructive ? '#e03131' : '#185FA5',
    cancelButtonColor: dark ? '#495057' : '#ced4da',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    background: dark ? '#232320' : '#ffffff',
    color: dark ? '#f0ede8' : '#1a1a18',
    padding: '2rem',
    customClass: {
      popup: 'swal2-custom-modal',
      title: 'swal2-custom-title-modal',
      htmlContainer: 'swal2-custom-text-modal',
      confirmButton: 'swal2-custom-button',
      cancelButton: 'swal2-custom-button swal2-cancel-btn'
    }
  });

  return result.isConfirmed;
};

export const showAlert = (title: string, text: string, icon: SweetAlertIcon = 'success') => {
  const dark = isDarkMode();

  return Swal.fire({
    title,
    text,
    icon,
    background: dark ? '#232320' : '#ffffff',
    color: dark ? '#f0ede8' : '#1a1a18',
    confirmButtonColor: '#185FA5',
    confirmButtonText: 'Entendido',
    padding: '2rem',
    customClass: {
      popup: 'swal2-custom-modal',
      title: 'swal2-custom-title-modal',
      htmlContainer: 'swal2-custom-text-modal',
      confirmButton: 'swal2-custom-button'
    }
  });
};
