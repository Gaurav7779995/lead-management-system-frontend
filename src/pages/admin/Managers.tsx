import React, { useState, useEffect } from 'react';
import { FaUserTie, FaBuilding, FaUsers, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { getManagers } from '../../services/dashboardService';

interface Manager {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  assignedAgents?: number;
  totalLeads?: number;
  createdAt?: string;
}

const Managers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoading(true);
        const response = await getManagers();
        setManagers(response.data || []);
      } catch (error) {
        console.error('Error fetching managers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, []);

  const filteredManagers = managers.filter(manager =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="managers-page">
      <div className="managers-header">
        <div className="header-left">
          <div className="header-icon">
            <FaUserTie />
          </div>
          <div className="header-text">
            <h1>Managers</h1>
            <p>Manage your team managers and their performance</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <FaPlus /> Add Manager
          </button>
        </div>
      </div>

      <div className="managers-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2196F3 0%, #00BCD4 100%)' }}>
            <FaUserTie />
          </div>
          <div className="stat-content">
            <div className="stat-value">{managers.length}</div>
            <div className="stat-label">Total Managers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #9C27B0 0%, #FFC107 100%)' }}>
            <FaUsers />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {managers.reduce((acc, m) => acc + (m.assignedAgents || 0), 0)}
            </div>
            <div className="stat-label">Total Agents</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)' }}>
            <FaBuilding />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {managers.reduce((acc, m) => acc + (m.totalLeads || 0), 0)}
            </div>
            <div className="stat-label">Total Leads</div>
          </div>
        </div>
      </div>

      <div className="managers-table-section">
        <div className="table-header">
          <h2>All Managers</h2>
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search managers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading managers...</div>
        ) : (
          <div className="professional-table-container">
            <table className="professional-table">
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>Contact</th>
                  <th>Department</th>
                  <th>Agents</th>
                  <th>Total Leads</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredManagers.map((manager) => (
                  <tr key={manager._id}>
                    <td>
                      <div className="manager-name-cell">
                        <div className="manager-avatar">
                          {getInitials(manager.name)}
                        </div>
                        <div className="manager-info">
                          <div className="manager-name">{manager.name}</div>
                          <div className="manager-role">{manager.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <div className="contact-row">📧 {manager.email}</div>
                        {manager.phone && <div className="contact-row">📞 {manager.phone}</div>}
                      </div>
                    </td>
                    <td>
                      <span className="department-cell">{manager.department || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="agents-count">{manager.assignedAgents || 0}</span>
                    </td>
                    <td>
                      <span className="leads-count">{manager.totalLeads || 0}</span>
                    </td>
                    <td>
                      <span className="date-cell">{formatDate(manager.createdAt)}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" title="Edit">
                          <FaEdit />
                        </button>
                        <button className="btn-delete" title="Delete">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredManagers.length === 0 && !loading && (
              <div className="empty-table-state">
                <p>No managers found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Managers;
