// frontend/src/hooks/useAuthGate.jsx
// Usage:
//   const { gate, AuthGate } = useAuthGate();
//   <button onClick={() => gate('create a team', () => doSomething())}>Create Team</button>
//   <AuthGate />   ← render once in the component tree
import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

const useAuthGate = () => {
  const { isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLabel, setActionLabel] = useState('continue');

  // If authenticated → run action immediately.
  // If not → show auth modal, then run action after successful login/register.
  const gate = useCallback((label, action) => {
    if (isAuthenticated) {
      action?.();
    } else {
      setActionLabel(label);
      setPendingAction(() => action);
      setModalOpen(true);
    }
  }, [isAuthenticated]);

  const handleSuccess = useCallback(() => {
    setModalOpen(false);
    pendingAction?.();
    setPendingAction(null);
  }, [pendingAction]);

  const AuthGate = () => (
    <AuthModal
      isOpen={modalOpen}
      onClose={() => { setModalOpen(false); setPendingAction(null); }}
      onSuccess={handleSuccess}
      actionLabel={actionLabel}
    />
  );

  return { gate, AuthGate, isAuthenticated };
};

export default useAuthGate;
