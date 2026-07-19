const DEFAULT_MESSAGES = Object.freeze({
  400: 'اطلاعات ارسال‌شده معتبر نیست.',
  401: 'نشست کاربری منقضی شده است؛ دوباره وارد شوید.',
  403: 'اجازه انجام این عملیات را ندارید.',
  404: 'اطلاعات موردنظر پیدا نشد.',
  405: 'روش ارسال درخواست با سرویس سازگار نیست.',
  409: 'اطلاعات با یک رکورد موجود تداخل دارد.',
  413: 'حجم فایل انتخاب‌شده بیش از حد مجاز است.',
  500: 'خطایی در سرور رخ داد. دوباره تلاش کنید.',
  502: 'سرویس موقتاً در دسترس نیست. دوباره تلاش کنید.',
  503: 'سرویس موقتاً در دسترس نیست. دوباره تلاش کنید.',
  504: 'پاسخ سرویس بیش از حد طول کشید. دوباره تلاش کنید.',
});

function safeServerMessage(body) {
  if (!body || typeof body !== 'object' || typeof body.message !== 'string') return '';
  return /<\s*(?:html|body|script|!doctype)/i.test(body.message) ? '' : body.message.trim();
}

export function normalizeApiError(error) {
  if (error?.normalized === true) return error;
  if (error?.code === 'ERR_CANCELED') {
    return { normalized: true, status: null, code: 'ERR_CANCELED', message: 'Request canceled', path: error.config?.url || null, timestamp: null, isNetworkError: false };
  }

  const response = error?.response;
  const body = response?.data;
  const status = Number(body?.status || response?.status) || null;
  return {
    normalized: true,
    status,
    code: typeof body?.error === 'string' ? body.error : (!response ? 'Network Error' : 'Request Error'),
    message: safeServerMessage(body) || error?.message || 'Request failed',
    path: typeof body?.path === 'string' ? body.path : error?.config?.url || null,
    timestamp: typeof body?.timestamp === 'string' ? body.timestamp : null,
    isNetworkError: !response,
  };
}

export function getApiErrorMessage(error, fallback, messages = {}) {
  const normalized = normalizeApiError(error);
  if (normalized.code === 'ERR_CANCELED') return '';
  if (messages[normalized.status]) return messages[normalized.status];
  if (normalized.isNetworkError) return messages.network || 'ارتباط با سرور برقرار نشد. دوباره تلاش کنید.';
  return DEFAULT_MESSAGES[normalized.status] || fallback || 'عملیات انجام نشد. دوباره تلاش کنید.';
}

export function getValidationMessage(error, fallback = DEFAULT_MESSAGES[400]) {
  const normalized = normalizeApiError(error);
  return normalized.status === 400 && normalized.message ? normalized.message : getApiErrorMessage(normalized, fallback);
}

export function isCanceledRequest(error) {
  return normalizeApiError(error).code === 'ERR_CANCELED';
}
