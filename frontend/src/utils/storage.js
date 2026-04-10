
export const setLocal = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { console.error(err); }
};
export const getLocal = (key) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : null; } catch (err) { console.error(err); return null; }
};
export const removeLocal = (key) => { try { localStorage.removeItem(key); } catch (err) { console.error(err); } };
export const clearLocal = () => { try { localStorage.clear(); } catch (err) { console.error(err); } };

// SESSION STORAGE
export const setSession = (key, value) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (err) { console.error(err); } };
export const getSession = (key) => { try { const value = sessionStorage.getItem(key); return value ? JSON.parse(value) : null; } catch (err) { console.error(err); return null; } };
export const removeSession = (key) => { try { sessionStorage.removeItem(key); } catch (err) { console.error(err); } };
export const clearSession = () => { try { sessionStorage.clear(); } catch (err) { console.error(err); } };