(() => {
  const TOAST_TYPES = {
    info: { border: '#3498db', icon: 'ℹ️' },
    success: { border: '#4caf50', icon: '✅' },
    error: { border: '#e74c3c', icon: '⚠️' },
    warning: { border: '#f39c12', icon: '⚠️' }
  };

  let toastCounter = 0;
  let containerElement = null;

  function ensureStyles() {
    if (document.getElementById('feedback-styles')) {
      return;
    }
    const style = document.createElement('style');
    style.id = 'feedback-styles';
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 9999;
        max-width: 320px;
        pointer-events: none;
      }

      .toast-message {
        background: #ffffff;
        border-radius: 0.75rem;
        padding: 0.75rem 1rem;
        box-shadow: 0 10px 25px rgba(31, 45, 61, 0.1);
        border-left: 4px solid var(--toast-border, #3498db);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
        color: #2c3e50;
        font-size: 0.95rem;
        font-family: 'Work Sans', Arial, sans-serif;
        pointer-events: auto;
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }

      .toast-message.hide {
        opacity: 0;
        transform: translateY(-10px);
      }

      .toast-message__icon {
        font-size: 1.25rem;
        line-height: 1.3rem;
      }

      .toast-message__content {
        flex: 1;
        white-space: pre-line;
      }

      .toast-message__close {
        background: transparent;
        border: none;
        color: #7f8c8d;
        font-size: 1.1rem;
        cursor: pointer;
        padding: 0;
      }

      .toast-message__close:hover {
        color: #2c3e50;
      }

      .btn-loading {
        position: relative;
        pointer-events: none;
        opacity: 0.8;
      }

      .btn-loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 16px;
        height: 16px;
        margin: -8px 0 0 -8px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.5);
        border-top-color: rgba(255, 255, 255, 1);
        animation: btn-spinner 0.6s linear infinite;
      }

      .btn-loading span {
        opacity: 0;
      }

      .input-error {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 1px rgba(231, 76, 60, 0.2);
      }

      .field-error-message {
        color: #e74c3c;
        font-size: 0.825rem;
        margin-top: 0.25rem;
      }

      @keyframes btn-spinner {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  function getContainer() {
    if (!containerElement) {
      containerElement = document.createElement('div');
      containerElement.className = 'toast-container';
      containerElement.setAttribute('aria-live', 'polite');
      containerElement.setAttribute('aria-atomic', 'false');
      document.body.appendChild(containerElement);
    }
    return containerElement;
  }

  function createToast(message, type = 'info', duration = 4000) {
    ensureStyles();
    const container = getContainer();
    const toast = document.createElement('div');
    const toastId = `toast-${Date.now()}-${++toastCounter}`;
    toast.className = 'toast-message';
    toast.dataset.toastId = toastId;

    const variant = TOAST_TYPES[type] || TOAST_TYPES.info;
    toast.style.setProperty('--toast-border', variant.border);

    toast.innerHTML = `
      <span class="toast-message__icon">${variant.icon}</span>
      <div class="toast-message__content">${message}</div>
      <button type="button" aria-label="Fechar" class="toast-message__close">×</button>
    `;

    const dismiss = () => {
      if (!toast.classList.contains('hide')) {
        toast.classList.add('hide');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }
    };

    toast.querySelector('.toast-message__close').addEventListener('click', dismiss);

    container.appendChild(toast);

    if (duration !== 0) {
      setTimeout(dismiss, duration);
    }

    return {
      id: toastId,
      dismiss,
      element: toast
    };
  }

  function dismissToastById(toastId) {
    const container = getContainer();
    const toast = container.querySelector(`[data-toast-id="${toastId}"]`);
    if (toast) {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function extractMessageFromData(data) {
    if (!data || typeof data !== 'object') return '';
    if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
    if (typeof data.error === 'string' && data.error.trim()) return data.error.trim();
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      if (typeof first === 'string') return first;
      if (first && typeof first.message === 'string') return first.message;
    }
    if (typeof data.detail === 'string' && data.detail.trim()) return data.detail.trim();
    if (typeof data.details === 'string' && data.details.trim()) return data.details.trim();
    return '';
  }

  function collectErrorDetails(data) {
    if (!data || typeof data !== 'object') return [];

    const detalhes = [];

    if (Array.isArray(data.errors)) {
      data.errors.forEach((item) => {
        if (typeof item === 'string' && item.trim()) {
          detalhes.push(item.trim());
        } else if (item && typeof item === 'object') {
          if (item.message) {
            detalhes.push(String(item.message));
          } else if (item.field && item.error) {
            detalhes.push(`${item.field}: ${item.error}`);
          }
        }
      });
    } else if (data.errors && typeof data.errors === 'object') {
      Object.entries(data.errors).forEach(([campo, mensagem]) => {
        if (Array.isArray(mensagem)) {
          mensagem.forEach((msg) => detalhes.push(`${campo}: ${msg}`));
        } else if (mensagem) {
          detalhes.push(`${campo}: ${mensagem}`);
        }
      });
    }

    if (Array.isArray(data.detalhes)) {
      data.detalhes.filter(Boolean).forEach((d) => detalhes.push(String(d)));
    }

    if (Array.isArray(data.detail)) {
      data.detail.filter(Boolean).forEach((d) => detalhes.push(String(d)));
    }

    if (Array.isArray(data.mensagens)) {
      data.mensagens.filter(Boolean).forEach((d) => detalhes.push(String(d)));
    }

    return detalhes;
  }

  function findFieldContainer(field) {
    if (!field) return null;
    return field.closest('.form-group') || field.parentElement;
  }

  function clearFieldError(field) {
    if (!field) return;
    field.classList.remove('input-error');
    const container = findFieldContainer(field);
    if (!container) return;
    const messageEl = container.querySelector('.field-error-message');
    if (messageEl) {
      messageEl.remove();
    }
  }

  function setFieldError(field, message) {
    if (!field || !message) return;
    const container = findFieldContainer(field);
    if (!container) return;

    field.classList.add('input-error');
    let messageEl = container.querySelector('.field-error-message');
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.className = 'field-error-message';
      messageEl.setAttribute('role', 'alert');
      container.appendChild(messageEl);
    }
    messageEl.textContent = message;
  }

  function normalizeFieldValue(field) {
    if (!field) return '';
    if (field.type === 'checkbox') {
      return field.checked ? field.value || 'on' : '';
    }
    if (field.type === 'number') {
      return field.value !== '' ? field.value : '';
    }
    if (field.value === undefined || field.value === null) return '';
    return String(field.value).trim();
  }

  function validateFields(fields = []) {
    if (!Array.isArray(fields) || fields.length === 0) {
      return { valid: true, messages: [] };
    }

    const mensagens = [];

    fields.forEach((config) => {
      const { field, name, rules = {}, getValue } = config;
      if (!field && typeof getValue !== 'function') return;

      const targetField = field || null;
      if (targetField) {
        clearFieldError(targetField);
      }

      const rawValue = typeof getValue === 'function' ? getValue(field) : normalizeFieldValue(field);
      const valor = rawValue === null || rawValue === undefined ? '' : String(rawValue).trim();
      const label = name || field.getAttribute('aria-label') || field.getAttribute('placeholder') || field.name || 'Campo';

      let mensagemErro = '';

      if (rules.required && !valor) {
        mensagemErro = `${label} é obrigatório.`;
      }

      if (!mensagemErro && rules.email && valor && !EMAIL_REGEX.test(valor)) {
        mensagemErro = `${label} deve ser um e-mail válido.`;
      }

      if (!mensagemErro && typeof rules.minLength === 'number' && valor.length < rules.minLength) {
        mensagemErro = `${label} deve ter ao menos ${rules.minLength} caracteres.`;
      }

      if (!mensagemErro && typeof rules.maxLength === 'number' && valor.length > rules.maxLength) {
        mensagemErro = `${label} deve ter no máximo ${rules.maxLength} caracteres.`;
      }

      if (!mensagemErro && rules.pattern && valor && !rules.pattern.test(valor)) {
        mensagemErro = rules.patternMessage || `${label} não está em um formato válido.`;
      }

      if (!mensagemErro && rules.date) {
        const data = new Date(valor);
        if (!valor || Number.isNaN(data.getTime())) {
          mensagemErro = `${label} deve ser uma data válida.`;
        } else if (rules.future === false && data > new Date()) {
          mensagemErro = `${label} não pode ser uma data futura.`;
        }
      }

      if (!mensagemErro && typeof rules.custom === 'function') {
        const resultadoCustom = rules.custom(valor, field);
        if (resultadoCustom !== true) {
          mensagemErro = typeof resultadoCustom === 'string' ? resultadoCustom : `${label} é inválido.`;
        }
      }

      if (mensagemErro) {
        setFieldError(targetField || field, mensagemErro);
        mensagens.push(mensagemErro);
      }
    });

    return { valid: mensagens.length === 0, messages: mensagens };
  }

  function attachValidationListeners(fields = []) {
    if (!Array.isArray(fields)) return;
    fields.forEach(({ field }) => {
      if (!field) return;
      const handler = () => clearFieldError(field);
      field.addEventListener('input', handler);
      field.addEventListener('change', handler);
      field.addEventListener('blur', handler);
    });
  }

  function showDetailedError(error, fallbackMessage = 'Não foi possível concluir a operação.') {
    if (!error) {
      showToast(fallbackMessage, 'error');
      return;
    }

    const detalhes = Array.isArray(error.details) ? error.details.filter(Boolean) : [];
    const mensagens = [];

    if (error.message) {
      mensagens.push(error.message);
    } else if (fallbackMessage) {
      mensagens.push(fallbackMessage);
    }

    if (detalhes.length > 0) {
      mensagens.push(detalhes.map((msg) => `• ${msg}`).join('\n'));
    }

    showToast(mensagens.join('\n'), 'error');
  }

  async function apiFetch(url, options = {}, config = {}) {
    const {
      button,
      loadingButtonText,
      loadingMessage,
      successMessage,
      errorMessage,
      suppressDefaultError,
      parseJson = false,
      handleBusinessError = true
    } = config;

    let previousButtonText = null;
    let loadingToast = null;

    if (button) {
      if (!button.dataset.originalLabel) {
        button.dataset.originalLabel = button.textContent.trim();
      }
      if (!button.dataset.originalMarkup) {
        button.dataset.originalMarkup = button.innerHTML;
      }
      previousButtonText = button.dataset.originalLabel;
      button.disabled = true;
      button.classList.add('btn-loading');
      if (loadingButtonText) {
        button.innerHTML = `<span>${loadingButtonText}</span>`;
      } else {
        button.innerHTML = `<span>${previousButtonText}</span>`;
      }
    } else if (loadingMessage) {
      loadingToast = createToast(loadingMessage, 'info', 0);
    }

    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type') || '';
      let responseData = null;

      if (contentType.includes('application/json')) {
        try {
          responseData = await response.clone().json();
        } catch (jsonParseError) {
          responseData = null;
        }
      }

      if (!response.ok) {
        let derivedMessage = errorMessage || extractMessageFromData(responseData);
        if (!derivedMessage) {
          try {
            const text = await response.clone().text();
            derivedMessage = text && text !== '[object Object]' ? text : '';
          } catch (textError) {
            derivedMessage = '';
          }
        }
        if (!derivedMessage) {
          derivedMessage = `Erro ${response.status}`;
        }
        if (!suppressDefaultError) {
          const detalhes = collectErrorDetails(responseData);
          const mensagemToast = detalhes.length > 0
            ? `${derivedMessage}\n${detalhes.map((msg) => `• ${msg}`).join('\n')}`
            : derivedMessage;
          createToast(mensagemToast, 'error');
        }
        const error = new Error(derivedMessage);
        error.response = response;
        error.data = responseData;
        error.details = collectErrorDetails(responseData);
        throw error;
      }

      if (handleBusinessError && responseData && responseData.success === false) {
        const mensagemNegocio = extractMessageFromData(responseData) || errorMessage || 'Não foi possível completar a ação.';
        if (!suppressDefaultError) {
          const detalhes = collectErrorDetails(responseData);
          const mensagemToast = detalhes.length > 0
            ? `${mensagemNegocio}\n${detalhes.map((msg) => `• ${msg}`).join('\n')}`
            : mensagemNegocio;
          createToast(mensagemToast, 'error');
        }
        const businessError = new Error(mensagemNegocio);
        businessError.response = response;
        businessError.data = responseData;
        businessError.details = collectErrorDetails(responseData);
        throw businessError;
      }

      if (successMessage) {
        createToast(successMessage, 'success');
      }

      if (parseJson) {
        if (responseData !== null) {
          return responseData;
        }
        try {
          return await response.json();
        } catch (jsonError) {
          return null;
        }
      }

      return response;
    } catch (error) {
      if (errorMessage && suppressDefaultError) {
        createToast(errorMessage, 'error');
      } else if (!suppressDefaultError && !errorMessage) {
        const detalhes = Array.isArray(error?.details) && error.details.length > 0
          ? `\n${error.details.map((msg) => `• ${msg}`).join('\n')}`
          : '';
        createToast((error?.message || 'Erro ao comunicar com o servidor.') + detalhes, 'error');
      }
      throw error;
    } finally {
      if (button) {
        button.disabled = false;
        button.classList.remove('btn-loading');
        const originalMarkup = button.dataset.originalMarkup || button.dataset.originalLabel || '';
        button.innerHTML = originalMarkup;
      }
      if (loadingToast) {
        loadingToast.dismiss();
      }
    }
  }

  window.showToast = (message, type = 'info', duration = 4000) => createToast(message, type, duration);
  window.dismissToast = dismissToastById;
  window.apiFetch = apiFetch;
  window.validateFields = validateFields;
  window.attachValidationListeners = attachValidationListeners;
  window.clearFieldError = clearFieldError;
  window.showDetailedError = showDetailedError;

  const originalAlert = window.alert;
  window.alert = (message) => {
    const texto = typeof message === 'string' ? message : String(message);
    const textoNormalizado = texto.toLowerCase();
    let tipo = 'info';
    if (textoNormalizado.includes('erro') || textoNormalizado.includes('falha') || textoNormalizado.includes('não foi possível')) {
      tipo = 'error';
    } else if (textoNormalizado.includes('sucesso') || textoNormalizado.includes('concluído') || textoNormalizado.includes('✅')) {
      tipo = 'success';
    }
    window.showToast(texto, tipo);
    if (originalAlert && typeof originalAlert === 'function') {
      console.warn('alert substituído por toast:', texto);
    }
  };
})();

