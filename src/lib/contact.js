export const CONTACT_EMAIL = 'filipwillhed98@live.se';

/**
 * Bygg en mailto-länk med förifyllt ämne och meddelande.
 */
export function mailtoLink(subject = '', body = '') {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  // URLSearchParams kodar mellanslag som "+", vilket e-postklienter inte tolkar
  const query = params.toString().replace(/\+/g, '%20');
  return `mailto:${CONTACT_EMAIL}${query ? `?${query}` : ''}`;
}
