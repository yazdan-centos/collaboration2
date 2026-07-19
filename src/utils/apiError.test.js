import { getApiErrorMessage, getValidationMessage, normalizeApiError } from './apiError';

describe('normalizeApiError', () => {
  test('normalizes the standard backend error response', () => {
    const error = normalizeApiError({
      response: { status: 404, data: { status: 404, error: 'Resource Not Found', message: 'Ticket not found', path: '/api/tickets/12', timestamp: '2026-07-18T05:41:10.532' } },
      config: { url: '/api/tickets/12' },
    });

    expect(error).toMatchObject({ status: 404, code: 'Resource Not Found', message: 'Ticket not found', path: '/api/tickets/12', isNetworkError: false });
  });

  test('does not expose an HTML response as a user message', () => {
    const error = normalizeApiError({ response: { status: 502, data: '<html>Bad gateway</html>' }, message: 'Request failed with status code 502' });
    expect(error.status).toBe(502);
    expect(getApiErrorMessage(error)).toBe('سرویس موقتاً در دسترس نیست. دوباره تلاش کنید.');
  });

  test('marks failures without a response as network errors', () => {
    const error = normalizeApiError({ message: 'Network Error', config: { url: '/api/tickets' } });
    expect(error).toMatchObject({ status: null, code: 'Network Error', path: '/api/tickets', isNetworkError: true });
  });

  test('keeps validation messages as diagnostic fallback text', () => {
    const error = normalizeApiError({ response: { status: 400, data: { status: 400, error: 'Validation Failed', message: '{title=must not be blank}' } } });
    expect(getValidationMessage(error)).toBe('{title=must not be blank}');
  });

  test('preserves the Axios cancellation code', () => {
    expect(normalizeApiError({ code: 'ERR_CANCELED' }).code).toBe('ERR_CANCELED');
  });
});
