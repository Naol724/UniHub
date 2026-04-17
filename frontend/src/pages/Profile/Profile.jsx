// frontend/src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';

const Profile = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: 'Naol',
    lastName: 'Gonfa',
    email: 'naol.gonfa@university.edu',
    phone: '+251 91 234-5678',
    location: 'Addis Ababa, Ethiopia',
    bio: 'Computer Science student passionate about building great user experiences and solving complex problems through technology.',
    skills: ['React', 'TypeScript', 'Node.js', 'UI/UX Design', 'Python', 'Database Design', 'Agile', 'Git'],
    teams: [
      {
        id: 1,
        name: 'UI/UX Team',
        role: 'Leader',
        icon: 'UI',
        color: theme.colors.primary
      },
      {
        id: 2,
        name: 'Backend Team',
        role: 'Member',
        icon: 'BE',
        color: theme.colors.secondary
      },
      {
        id: 3,
        name: 'Research Team',
        role: 'Member',
        icon: 'RE',
        color: theme.colors.success
      }
    ],
    stats: {
      tasksCompleted: 18,
      totalTasks: 24,
      teamsJoined: 3,
      joinDate: 'January 2024'
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading profile data
    setTimeout(() => {
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

  const profileLayoutStyles = {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '30px'
  };

  const profileCardStyles = {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: `0 2px 8px ${theme.colors.shadow}`
  };

  const avatarStyles = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primaryLight,
    color: theme.colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: '700',
    margin: '0 auto 20px'
  };

  const profileNameStyles = {
    fontSize: '20px',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '4px'
  };

  const profileRoleStyles = {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    marginBottom: '24px'
  };

  const statsStyles = {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '20px 0',
    borderTop: `1px solid ${theme.colors.border}`,
    borderBottom: `1px solid ${theme.colors.border}`,
    marginBottom: '20px'
  };

  const statItemStyles = {
    textAlign: 'center'
  };

  const statValueStyles = {
    fontSize: '24px',
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: '4px'
  };

  const statLabelStyles = {
    fontSize: '12px',
    color: theme.colors.textSecondary
  };

  const contactItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: theme.colors.textSecondary,
    marginBottom: '8px',
    textAlign: 'left'
  };

  const contentSectionStyles = {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: `0 2px 8px ${theme.colors.shadow}`
  };

  const sectionTitleStyles = {
    fontSize: '18px',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '20px'
  };

  const formGridStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  };

  const inputStyles = {
    backgroundColor: theme.colors.background,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    color: theme.colors.text,
    outline: 'none'
  };

  const textareaStyles = {
    ...inputStyles,
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit'
  };

  const skillsContainerStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  };

  const skillStyles = {
    backgroundColor: theme.colors.background,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
    fontSize: '12px',
    padding: '6px 12px',
    borderRadius: '20px'
  };

  const teamItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: theme.colors.background,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    marginBottom: '8px'
  };

  const teamIconStyles = (color) => ({
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: color,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700'
  });

  const teamInfoStyles = {
    flex: 1
  };

  const teamNameStyles = {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '2px'
  };

  const teamRoleStyles = {
    fontSize: '12px',
    color: theme.colors.textSecondary
  };

  const actionButtonsStyles = {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  };

  const buttonStyles = (isPrimary) => ({
    backgroundColor: isPrimary ? theme.colors.primary : 'transparent',
    color: isPrimary ? '#fff' : theme.colors.text,
    border: isPrimary ? 'none' : `1px solid ${theme.colors.border}`,
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save profile logic here
    console.log('Saving profile:', profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setIsEditing(false);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div style={pageStyles}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div>Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Profile</h1>
        <p style={subtitleStyles}>Manage your personal information and preferences</p>
      </div>

      {/* Profile Layout */}
      <div style={profileLayoutStyles}>
        {/* Profile Card */}
        <div style={profileCardStyles}>
          {/* Avatar */}
          <div style={avatarStyles}>
            {getInitials(profileData.firstName, profileData.lastName)}
          </div>

          {/* Name and Role */}
          <h2 style={profileNameStyles}>
            {profileData.firstName} {profileData.lastName}
          </h2>
          <p style={profileRoleStyles}>Computer Science Student</p>

          {/* Stats */}
          <div style={statsStyles}>
            <div style={statItemStyles}>
              <div style={statValueStyles}>{profileData.stats.tasksCompleted}</div>
              <div style={statLabelStyles}>Tasks Done</div>
            </div>
            <div style={statItemStyles}>
              <div style={statValueStyles}>{profileData.stats.teamsJoined}</div>
              <div style={statLabelStyles}>Teams</div>
            </div>
            <div style={statItemStyles}>
              <div style={statValueStyles}>{profileData.stats.totalTasks}</div>
              <div style={statLabelStyles}>Total Tasks</div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <div style={contactItemStyles}>
              <span>email</span>
              <span>{profileData.email}</span>
            </div>
            <div style={contactItemStyles}>
              <span>phone</span>
              <span>{profileData.phone}</span>
            </div>
            <div style={contactItemStyles}>
              <span>location</span>
              <span>{profileData.location}</span>
            </div>
            <div style={contactItemStyles}>
              <span>calendar</span>
              <span>Joined {profileData.stats.joinDate}</span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div>
          {/* Edit Profile Section */}
          <div style={contentSectionStyles}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={sectionTitleStyles}>Edit Profile</h3>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  style={buttonStyles(false)}
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <div>
                <div style={formGridStyles}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      style={inputStyles}
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      style={inputStyles}
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    style={inputStyles}
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                    Bio
                  </label>
                  <textarea
                    style={textareaStyles}
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                </div>

                <div style={actionButtonsStyles}>
                  <Button
                    onClick={handleSave}
                    style={buttonStyles(true)}
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    style={buttonStyles(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div style={formGridStyles}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>First Name</div>
                    <div style={{ padding: '8px 12px', backgroundColor: theme.colors.background, borderRadius: '8px' }}>
                      {profileData.firstName}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Last Name</div>
                    <div style={{ padding: '8px 12px', backgroundColor: theme.colors.background, borderRadius: '8px' }}>
                      {profileData.lastName}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Email</div>
                  <div style={{ padding: '8px 12px', backgroundColor: theme.colors.background, borderRadius: '8px' }}>
                    {profileData.email}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Bio</div>
                  <div style={{ padding: '8px 12px', backgroundColor: theme.colors.background, borderRadius: '8px', lineHeight: '1.5' }}>
                    {profileData.bio}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div style={contentSectionStyles}>
            <h3 style={sectionTitleStyles}>Skills</h3>
            <div style={skillsContainerStyles}>
              {profileData.skills.map((skill, index) => (
                <span key={index} style={skillStyles}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Teams Section */}
          <div style={contentSectionStyles}>
            <h3 style={sectionTitleStyles}>Teams</h3>
            {profileData.teams.map((team) => (
              <div key={team.id} style={teamItemStyles}>
                <div style={teamIconStyles(team.color)}>
                  {team.icon}
                </div>
                <div style={teamInfoStyles}>
                  <div style={teamNameStyles}>{team.name}</div>
                  <div style={teamRoleStyles}>{team.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
