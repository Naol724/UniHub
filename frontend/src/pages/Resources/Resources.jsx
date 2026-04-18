// frontend/src/pages/Resources/Resources.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';

const Resources = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Mock resources data - replace with API call
  useEffect(() => {
    const mockResources = [
      {
        id: 1,
        name: 'Project Proposal.pdf',
        type: 'pdf',
        size: '2.4 MB',
        uploadDate: '2024-04-05',
        team: 'UI/UX Team',
        teamColor: theme.colors.primary,
        uploadedBy: 'Naol Gonfa',
        description: 'Initial project proposal document',
        icon: 'PDF'
      },
      {
        id: 2,
        name: 'Database Schema.sql',
        type: 'sql',
        size: '156 KB',
        uploadDate: '2024-04-04',
        team: 'Backend Team',
        teamColor: theme.colors.secondary,
        uploadedBy: 'Fikru Bekele',
        description: 'Database schema and relationships',
        icon: 'SQL'
      },
      {
        id: 3,
        name: 'User Research.xlsx',
        type: 'excel',
        size: '1.8 MB',
        uploadDate: '2024-04-03',
        team: 'Research Team',
        teamColor: theme.colors.success,
        uploadedBy: 'Mekonnen Niguse',
        description: 'User research data and analysis',
        icon: 'XLS'
      },
      {
        id: 4,
        name: 'Dashboard Mockups.fig',
        type: 'design',
        size: '45.2 MB',
        uploadDate: '2024-04-02',
        team: 'UI/UX Team',
        teamColor: theme.colors.primary,
        uploadedBy: 'Ermiyas Abebe',
        description: 'Figma design mockups for dashboard',
        icon: 'FIG'
      },
      {
        id: 5,
        name: 'API Documentation.md',
        type: 'markdown',
        size: '89 KB',
        uploadDate: '2024-04-01',
        team: 'Backend Team',
        teamColor: theme.colors.secondary,
        uploadedBy: 'Yisiyaq Gezehany',
        description: 'REST API documentation',
        icon: 'MD'
      },
      {
        id: 6,
        name: 'Meeting Notes.docx',
        type: 'word',
        size: '234 KB',
        uploadDate: '2024-03-30',
        team: 'Research Team',
        teamColor: theme.colors.success,
        uploadedBy: 'Mahlet Ibrahim',
        description: 'Team meeting notes and action items',
        icon: 'DOC'
      },
      {
        id: 7,
        name: 'Brand Guidelines.pdf',
        type: 'pdf',
        size: '12.5 MB',
        uploadDate: '2024-03-28',
        team: 'UI/UX Team',
        teamColor: theme.colors.primary,
        uploadedBy: 'Tola Fayisa',
        description: 'Brand identity and design guidelines',
        icon: 'PDF'
      },
      {
        id: 8,
        name: 'Sprint Backlog.csv',
        type: 'csv',
        size: '67 KB',
        uploadDate: '2024-03-25',
        team: 'Backend Team',
        teamColor: theme.colors.secondary,
        uploadedBy: 'Asefa Niguse',
        description: 'Current sprint backlog and tasks',
        icon: 'CSV'
      }
    ];

    setTimeout(() => {
      setResources(mockResources);
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

  const filtersStyles = {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  };

  const searchInputStyles = {
    flex: 1,
    minWidth: '200px',
    padding: '10px 16px',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    color: theme.colors.text,
    outline: 'none'
  };

  const filterSelectStyles = {
    padding: '10px 16px',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    color: theme.colors.text,
    outline: 'none'
  };

  const resourcesGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  };

  const resourceCardStyles = {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const fileIconStyles = (type) => {
    const iconColors = {
      pdf: { bg: '#fef2f2', color: '#ef4444', icon: 'PDF' },
      doc: { bg: '#fef2f2', color: '#ef4444', icon: 'DOC' },
      excel: { bg: '#ecfdf5', color: '#10b981', icon: 'XLS' },
      csv: { bg: '#ecfdf5', color: '#10b981', icon: 'CSV' },
      sql: { bg: '#eff6ff', color: '#3b82f6', icon: 'SQL' },
      markdown: { bg: '#f5f3ff', color: '#8b5cf6', icon: 'MD' },
      design: { bg: '#fffbeb', color: '#f59e0b', icon: 'FIG' }
    };
    
    const config = iconColors[type] || iconColors.pdf;
    
    return {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      backgroundColor: config.bg,
      color: config.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '700',
      marginBottom: '16px'
    };
  };

  const resourceNameStyles = {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const resourceMetaStyles = {
    fontSize: '12px',
    color: theme.colors.textSecondary,
    marginBottom: '12px'
  };

  const resourceDescStyles = {
    fontSize: '13px',
    color: theme.colors.textSecondary,
    marginBottom: '16px',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const teamBadgeStyles = (color) => ({
    backgroundColor: `${color}20`,
    color: color,
    fontSize: '10px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase'
  });

  const uploadModalStyles = {
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
  };

  const modalContentStyles = {
    backgroundColor: theme.colors.surface,
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%'
  };

  // Filter resources based on search and team
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || resource.team === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  // Get unique teams for filter
  const teams = ['all', ...new Set(resources.map(r => r.team))];

  if (loading) {
    return (
      <div style={pageStyles}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div>Loading resources...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div>
          <h1 style={titleStyles}>Resources</h1>
          <p style={subtitleStyles}>Shared files and documents for your projects</p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
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
          Upload File
        </Button>
      </div>

      {/* Filters */}
      <div style={filtersStyles}>
        <input
          type="text"
          style={searchInputStyles}
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          style={filterSelectStyles}
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          {teams.map(team => (
            <option key={team} value={team}>
              {team === 'all' ? 'All Teams' : team}
            </option>
          ))}
        </select>
      </div>

      {/* Resources Grid */}
      <div style={resourcesGridStyles}>
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            style={resourceCardStyles}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = `0 8px 24px ${theme.colors.shadow}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 2px 8px ${theme.colors.shadow}`;
            }}
          >
            {/* File Icon */}
            <div style={fileIconStyles(resource.type)}>
              {resource.icon}
            </div>

            {/* File Name */}
            <h3 style={resourceNameStyles} title={resource.name}>
              {resource.name}
            </h3>

            {/* File Meta */}
            <div style={resourceMetaStyles}>
              {resource.size} · {resource.uploadDate}
            </div>

            {/* Description */}
            <p style={resourceDescStyles}>
              {resource.description}
            </p>

            {/* Team Badge */}
            <div style={teamBadgeStyles(resource.teamColor)}>
              {resource.team}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={uploadModalStyles}>
          <div style={modalContentStyles}>
            <h2 style={{ margin: '0 0 20px 0' }}>Upload File</h2>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '20px' }}>
              File upload functionality will be implemented here. This will support drag-and-drop and file selection.
            </p>
            <div style={{
              border: `2px dashed ${theme.colors.border}`,
              borderRadius: '8px',
              padding: '40px 20px',
              textAlign: 'center',
              marginBottom: '20px',
              backgroundColor: theme.colors.background
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>Upload File</div>
              <p style={{ color: theme.colors.textSecondary, marginBottom: '16px' }}>
                Drag and drop files here or click to browse
              </p>
              <Button
                style={{
                  backgroundColor: 'transparent',
                  color: theme.colors.primary,
                  border: `1px solid ${theme.colors.primary}`,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Choose Files
              </Button>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setShowUploadModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </Button>
              <Button
                style={{
                  backgroundColor: theme.colors.primary,
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
