import React, { useState, useEffect } from 'react';
import { businessAccountService } from '../../../services/businessAccountService';
import { toast } from 'react-toastify';
import styles from './TeamManagement.module.css';

function TeamManagement({ teamMembers: initialMembers, onUpdate }) {
  const [teamMembers, setTeamMembers] = useState(initialMembers || []);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const members = await businessAccountService.getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    const adminCount = teamMembers.filter(m => m.role === 'admin').length;
    const memberToRemove = teamMembers.find(m => m.id === memberId);
    
    if (memberToRemove?.role === 'admin' && adminCount === 1) {
      toast.error('Cannot remove the last admin');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      await businessAccountService.removeTeamMember(memberId);
      toast.success('Team member removed successfully');
      fetchTeamMembers();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return styles.adminBadge;
      case 'manager': return styles.managerBadge;
      case 'member': return styles.memberBadge;
      case 'viewer': return styles.viewerBadge;
      default: return '';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return styles.activeBadge;
      case 'pending': return styles.pendingBadge;
      case 'inactive': return styles.inactiveBadge;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Team Members</h2>
          <p className={styles.subtitle}>Manage your team and their permissions</p>
        </div>
        <button 
          className={styles.inviteButton}
          onClick={() => setShowInviteModal(true)}
        >
          + Invite Team Member
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading team members...</div>
      ) : teamMembers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No team members yet</p>
          <button 
            className={styles.inviteButton}
            onClick={() => setShowInviteModal(true)}
          >
            Invite Your First Team Member
          </button>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map(member => (
                <tr key={member.id}>
                  <td className={styles.nameCell}>
                    <div className={styles.avatar}>
                      {(member.name || member.email || 'U').substring(0, 2).toUpperCase()}
                    </div>
                    <span>{member.name || 'Unnamed'}</span>
                  </td>
                  <td>{member.email}</td>
                  <td>
                    <span className={`${styles.badge} ${getRoleBadgeClass(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadgeClass(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td>{formatDate(member.lastLogin)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEditMember(member)}
                        title="Edit member"
                      >
                        ✏️
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleRemoveMember(member.id)}
                        title="Remove member"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInviteModal && (
        <InviteModal 
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            fetchTeamMembers();
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {showEditModal && selectedMember && (
        <EditMemberModal
          member={selectedMember}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedMember(null);
            fetchTeamMembers();
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </div>
  );
}

function InviteModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'member',
    permissions: {
      canManageCampaigns: false,
      canViewAnalytics: true,
      canManageBilling: false,
      canManageTeam: false,
      canEditCompanyProfile: false,
      canManageCharityPortfolio: false,
      canViewFinancials: false,
      canExportData: false
    }
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await businessAccountService.inviteTeamMember(formData);
      toast.success('Invitation sent successfully');
      onSuccess();
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    let permissions = {};
    
    switch (role) {
      case 'admin':
        permissions = {
          canManageCampaigns: true,
          canViewAnalytics: true,
          canManageBilling: true,
          canManageTeam: true,
          canEditCompanyProfile: true,
          canManageCharityPortfolio: true,
          canViewFinancials: true,
          canExportData: true
        };
        break;
      case 'manager':
        permissions = {
          canManageCampaigns: true,
          canViewAnalytics: true,
          canManageBilling: false,
          canManageTeam: false,
          canEditCompanyProfile: false,
          canManageCharityPortfolio: true,
          canViewFinancials: true,
          canExportData: true
        };
        break;
      case 'member':
        permissions = {
          canManageCampaigns: false,
          canViewAnalytics: true,
          canManageBilling: false,
          canManageTeam: false,
          canEditCompanyProfile: false,
          canManageCharityPortfolio: false,
          canViewFinancials: false,
          canExportData: false
        };
        break;
      case 'viewer':
        permissions = {
          canManageCampaigns: false,
          canViewAnalytics: true,
          canManageBilling: false,
          canManageTeam: false,
          canEditCompanyProfile: false,
          canManageCharityPortfolio: false,
          canViewFinancials: false,
          canExportData: false
        };
        break;
      default:
        break;
    }
    
    setFormData(prev => ({ ...prev, role, permissions }));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Invite Team Member</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              placeholder="colleague@company.com"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Doe"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Role</label>
            <select 
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="admin">Admin - Full access</option>
              <option value="manager">Manager - Manage campaigns and view analytics</option>
              <option value="member">Member - Standard access</option>
              <option value="viewer">Viewer - Read-only access</option>
            </select>
          </div>
          
          <div className={styles.permissionsSection}>
            <h4>Permissions</h4>
            <div className={styles.permissionsGrid}>
              {Object.entries(formData.permissions).map(([key, value]) => (
                <label key={key} className={styles.permissionItem}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      permissions: {
                        ...prev.permissions,
                        [key]: e.target.checked
                      }
                    }))}
                  />
                  <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditMemberModal({ member, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    role: member.role,
    permissions: member.permissions || {}
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await businessAccountService.updateTeamMember(member.id, formData);
      toast.success('Team member updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error('Failed to update team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Edit Team Member</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.memberInfo}>
            <p><strong>Name:</strong> {member.name}</p>
            <p><strong>Email:</strong> {member.email}</p>
          </div>
          
          <div className={styles.formGroup}>
            <label>Role</label>
            <select 
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="admin">Admin - Full access</option>
              <option value="manager">Manager - Manage campaigns and view analytics</option>
              <option value="member">Member - Standard access</option>
              <option value="viewer">Viewer - Read-only access</option>
            </select>
          </div>
          
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeamManagement;