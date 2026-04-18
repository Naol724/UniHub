// frontend/src/pages/Teams/Teams.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';

const Teams = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    const mockTeams = [
      {
        id: 1,
        name: 'UI/UX Design Team',
        description: 'Designing beautiful user experiences',
        icon: 'UI',
        color: theme.colors.primary,
        members: [
          { id: 1, name: 'Naol Gonfa', initials: 'NG', avatar: null },
          { id: 2, name: 'Asefa Niguse', initials: 'AN', avatar: null },
          { id: 3, name: 'Ermiyas Abebe', initials: 'EA', avatar: null },
          { id: 4, name: 'Tola Fayisa', initials: 'TF', avatar: null }
        ],
        tasksCompleted: 8,
        totalTasks: 12,
        userRole: 'Leader'
      },
      {
        id: 2,
        name: 'Backend Development',
        description: 'Building robust APIs and databases',
        icon: 'BE',
        color: theme.colors.secondary,
        members: [
          { id: 5, name: 'Fikru Bekele', initials: 'FB', avatar: null },
          { id: 6, name: 'Yisiyaq Gezehany', initials: 'YG', avatar: null },
          { id: 7, name: 'Abebe Alemu', initials: 'AA', avatar: null }
        ],
        tasksCompleted: 14,
        totalTasks: 18,
        userRole: 'Member'
      },
      {
        id: 3,
        name: 'Research & Analysis',
        description: 'User research and data analysis',
        icon: 'RE',
        color: theme.colors.success,
        members: [
          { id: 8, name: 'Mekonnen Niguse', initials: 'MN', avatar: null },
          { id: 9, name: 'Mahlet Ibrahim', initials: 'MI', avatar: null }
        ],
        tasksCompleted: 4,
        totalTasks: 6,
        userRole: 'Member'
      },
      {
        id: 4,
        name: 'Mobile Development',
        description: 'Cross-platform mobile applications',
        icon: 'MD',
        color: theme.colors.warning,
        members: [
          { id: 10, name: 'Birhanu Endris', initials: 'BE', avatar: null },
          { id: 11, name: 'Rahel Seid', initials: 'RS', avatar: null },
          { id: 12, name: 'Bethelehem Mekonnen', initials: 'BM', avatar: null }
        ],
        tasksCompleted: 9,
        totalTasks: 15,
        userRole: 'Member'
      },
      {
        id: 5,
        name: 'DevOps & Infrastructure',
        description: 'Deployment pipelines and cloud',
        icon: 'DO',
        color: theme.colors.danger,
        members: [
          { id: 13, name: 'Alemayehu Niguse', initials: 'AN', avatar: null },
          { id: 14, name: 'Ermiyas Abebe', initials: 'EA', avatar: null }
        ],
        tasksCompleted: 7,
        totalTasks: 8,
        userRole: 'Member'
      }
    ];

    setTimeout(() => {
      setTeams(mockTeams);
      setLoading(false);
    }, 1000);
  }, []);

  const pageStyles = {
    padding: '20px',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    minHeight: '100vh'
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  };

  const titleStyles = {
    fontSize: '28px',
    fontWeight: '700',
    color: theme.colors.text,
    margin: '0 0 8px 0'
  };

  const subtitleStyles = {
    fontSize: '16px',
    color: theme.colors.textSecondary,
    margin: '0'
  };

  const teamsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  };

  const teamCardStyles = {
    position: 'relative',
    padding: '24px',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const teamIconStyles = (color) => ({
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: color,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px'
  });

  const teamNameStyles = {
    fontSize: '18px',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '8px'
  };

  const teamDescStyles = {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    marginBottom: '16px',
    lineHeight: '1.5'
  };

  const membersStyles = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px'
  };

  const avatarStyles = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primaryLight,
    color: theme.colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    border: `2px solid ${theme.colors.surface}`,
    marginLeft: '-8px'
  };

  const firstAvatarStyles = {
    ...avatarStyles,
    marginLeft: '0'
  };

  const progressStyles = {
    height: '6px',
    backgroundColor: theme.colors.border,
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px'
  };

  const progressFillStyles = (progress, color) => ({
    height: '100%',
    width: `${progress}%`,
    backgroundColor: color,
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  });

  const statsStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: theme.colors.textSecondary
  };

  const badgeStyles = {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600',
    backgroundColor: theme.colors.primaryLight,
    color: theme.colors.primary
  };

  if (loading) {
    return (
      <div style={pageStyles}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div>Loading teams...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div>
          <h1 style={titleStyles}>Teams</h1>
          <p style={subtitleStyles}>Manage and collaborate with your project teams</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: theme.colors.primary,
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          + Create Team
        </Button>
      </div>

      {/* Teams Grid */}
      <div style={teamsGridStyles}>
        {teams.map((team) => (
          <div
            key={team.id}
            style={teamCardStyles}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = `0 8px 24px ${theme.colors.shadow}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 2px 8px ${theme.colors.shadow}`;
            }}
          >
            {/* Team Icon */}
            <div style={teamIconStyles(team.color)}>
              {team.icon}
            </div>

            {/* Team Name */}
            <h3 style={teamNameStyles}>{team.name}</h3>

            {/* Team Description */}
            <p style={teamDescStyles}>{team.description}</p>

            {/* Members */}
            <div style={membersStyles}>
              {team.members.slice(0, 5).map((member, index) => (
                <div
                  key={member.id}
                  style={index === 0 ? firstAvatarStyles : avatarStyles}
                  title={member.name}
                >
                  {member.initials}
                </div>
              ))}
              {team.members.length > 5 && (
                <div style={avatarStyles}>
                  +{team.members.length - 5}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div style={progressStyles}>
              <div
                style={progressFillStyles(
                  (team.tasksCompleted / team.totalTasks) * 100,
                  team.color
                )}
              />
            </div>

            {/* Stats */}
            <div style={statsStyles}>
              <span>{team.tasksCompleted}/{team.totalTasks} tasks</span>
              <span style={badgeStyles}>{team.members.length} members</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Team Modal - Placeholder */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme.colors.surface,
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ margin: '0 0 20px 0' }}>Create New Team</h2>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '20px' }}>
              Team creation functionality will be implemented here.
            </p>
            <Button
              onClick={() => setShowCreateModal(false)}
              style={{
                backgroundColor: theme.colors.primary,
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
