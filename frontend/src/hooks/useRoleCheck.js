// frontend/src/hooks/useRoleCheck.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../API/Axios';

export const useRoleCheck = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user' || !user?.role;
  
  return { isAdmin, isUser, role: user?.role };
};

export const useTeamRole = (teamId) => {
  const { isAuthenticated, user } = useAuth();
  const [teamRole, setTeamRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamRole = async () => {
      if (isAuthenticated && teamId && user?.id) {
        try {
          const response = await API.get(`/teams/${teamId}/check-role/${user.id}`);
          setTeamRole(response.data.role);
        } catch (error) {
          setTeamRole(null);
        }
      }
      setLoading(false);
    };
    fetchTeamRole();
  }, [teamId, isAuthenticated, user]);

  return {
    teamRole,
    loading,
    isOwner: teamRole === 'owner',
    isAdmin: teamRole === 'admin',
    isMember: teamRole === 'member',
    isTeamMember: !!teamRole
  };
};