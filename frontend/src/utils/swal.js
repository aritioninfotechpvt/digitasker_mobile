import Swal from 'sweetalert2';

export const showSuccess = (title, text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#0066ff',
    background: '#ffffff',
    color: '#0f172a'
  });
};

export const showError = (title, text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#0066ff',
    background: '#ffffff',
    color: '#0f172a'
  });
};

export const showConfirm = async (title, text, confirmButtonText = 'Yes, proceed') => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0066ff',
    cancelButtonColor: '#64748b',
    confirmButtonText,
    background: '#ffffff',
    color: '#0f172a'
  });
  return result.isConfirmed;
};

export const showToast = (title, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    background: '#0f172a',
    color: '#ffffff'
  });
  Toast.fire({ icon, title });
};

export const showPrompt = async (title, inputLabel = '', placeholder = '', inputType = 'text') => {
  const { value } = await Swal.fire({
    title,
    input: inputType,
    inputLabel,
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonColor: '#0066ff',
    cancelButtonColor: '#64748b'
  });
  return value;
};

export const showRichModal = (title, htmlContent) => {
  return Swal.fire({
    title,
    html: htmlContent,
    width: '520px',
    confirmButtonColor: '#0066ff',
    confirmButtonText: 'Close',
    customClass: {
      title: 'swal-compact-title',
      htmlContainer: 'swal-compact-html'
    }
  });
};
