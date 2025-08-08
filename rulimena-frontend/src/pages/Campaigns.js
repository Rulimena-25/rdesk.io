import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCampaigns, clearCampaignsError, createCampaign, updateCampaign, deleteCampaign, startCampaign, stopCampaign } from '../redux/campaignsSlice';
import websocketService from '../services/websocket';
import './Campaigns.css';

const Campaigns = () => {
  const dispatch = useDispatch();
  const { campaigns, loading, error, pagination } = useSelector((state) => state.campaigns);
  const { user } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'details', 'form'
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dialingStrategy: 'manual',
    productInfo: {
      productId: '',
      productName: '',
      productDescription: ''
    },
    startDate: '',
    endDate: ''
  });
  
  useEffect(() => {
    dispatch(fetchCampaigns({ page: currentPage, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);
  
  // Initialize WebSocket listeners
  useEffect(() => {
    // Join campaigns room
    websocketService.joinRoom('campaigns-room');
    
    // Listen for campaign updates
    const handleCampaignUpdate = (data) => {
      // Refresh campaigns when there's an update
      dispatch(fetchCampaigns({ page: currentPage, search: searchTerm }));
    };
    
    // Add event listeners
    websocketService.on('campaign-update', handleCampaignUpdate);
    
    // Clean up event listeners
    return () => {
      websocketService.off('campaign-update', handleCampaignUpdate);
      websocketService.leaveRoom('campaigns-room');
    };
  }, [dispatch, currentPage, searchTerm]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(fetchCampaigns({ page: 1, search: searchTerm }));
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-badge active';
      case 'paused':
        return 'status-badge paused';
      case 'completed':
        return 'status-badge completed';
      case 'scheduled':
        return 'status-badge scheduled';
      default:
        return 'status-badge draft';
    }
  };
  
  const handleAddCampaign = () => {
    setFormData({
      name: '',
      description: '',
      dialingStrategy: 'manual',
      productInfo: {
        productId: '',
        productName: '',
        productDescription: ''
      },
      startDate: '',
      endDate: ''
    });
    setViewMode('form');
  };
  
  const handleViewCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setViewMode('details');
  };
  
  const handleEditCampaign = (campaign) => {
    setFormData({
      ...campaign,
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : ''
    });
    setSelectedCampaign(campaign);
    setViewMode('form');
  };
  
  const handleDeleteCampaign = (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      dispatch(deleteCampaign(campaignId));
    }
  };
  
  const handleStartCampaign = (campaignId) => {
    if (window.confirm('Are you sure you want to start this campaign?')) {
      dispatch(startCampaign(campaignId));
    }
  };
  
  const handleStopCampaign = (campaignId) => {
    if (window.confirm('Are you sure you want to stop this campaign?')) {
      dispatch(stopCampaign(campaignId));
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNestedInputChange = (e, section) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add createdBy field
    const campaignData = {
      ...formData,
      createdBy: user?.id
    };
    
    if (selectedCampaign) {
      // Update existing campaign
      dispatch(updateCampaign({ id: selectedCampaign._id, campaignData }));
    } else {
      // Create new campaign
      dispatch(createCampaign(campaignData));
    }
    
    setViewMode('list');
  };
  
  const handleCancel = () => {
    setViewMode('list');
    setSelectedCampaign(null);
  };
  
  // Render campaign list view
  const renderCampaignList = () => (
    <>
      <div className="campaigns-toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => dispatch(clearCampaignsError())}>Clear</button>
        </div>
      )}
      
      {loading ? (
        <div className="loading">Loading campaigns...</div>
      ) : (
        <>
          <div className="campaigns-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Strategy</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length > 0 ? (
                  campaigns.map((campaign) => (
                    <tr key={campaign._id}>
                      <td>{campaign.name}</td>
                      <td>
                        <span className={getStatusBadgeClass(campaign.status)}>
                          {campaign.status}
                        </span>
                      </td>
                      <td>{campaign.dialingStrategy}</td>
                      <td>{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button
                          className="action-button view"
                          onClick={() => handleViewCampaign(campaign)}
                        >
                          View
                        </button>
                        <button
                          className="action-button edit"
                          onClick={() => handleEditCampaign(campaign)}
                        >
                          Edit
                        </button>
                        {campaign.status === 'draft' && (
                          <button
                            className="action-button start"
                            onClick={() => handleStartCampaign(campaign._id)}
                          >
                            Start
                          </button>
                        )}
                        {(campaign.status === 'active' || campaign.status === 'scheduled') && (
                          <button
                            className="action-button stop"
                            onClick={() => handleStopCampaign(campaign._id)}
                          >
                            Stop
                          </button>
                        )}
                        <button
                          className="action-button delete"
                          onClick={() => handleDeleteCampaign(campaign._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-campaigns">
                      No campaigns found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
  
  // Render campaign details view
  const renderCampaignDetails = () => (
    <div className="campaign-details">
      <h2>Campaign Details</h2>
      <div className="detail-row">
        <div className="detail-label">Name:</div>
        <div className="detail-value">{selectedCampaign?.name}</div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Description:</div>
        <div className="detail-value">{selectedCampaign?.description || 'N/A'}</div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Status:</div>
        <div className="detail-value">
          <span className={getStatusBadgeClass(selectedCampaign?.status)}>
            {selectedCampaign?.status}
          </span>
        </div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Dialing Strategy:</div>
        <div className="detail-value">{selectedCampaign?.dialingStrategy}</div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Start Date:</div>
        <div className="detail-value">
          {selectedCampaign?.startDate ? new Date(selectedCampaign.startDate).toLocaleDateString() : 'N/A'}
        </div>
      </div>
      <div className="detail-row">
        <div className="detail-label">End Date:</div>
        <div className="detail-value">
          {selectedCampaign?.endDate ? new Date(selectedCampaign.endDate).toLocaleDateString() : 'N/A'}
        </div>
      </div>
      
      {selectedCampaign?.productInfo && (
        <div className="product-info">
          <h3>Product Information</h3>
          <div className="detail-row">
            <div className="detail-label">Product ID:</div>
            <div className="detail-value">{selectedCampaign.productInfo.productId || 'N/A'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Product Name:</div>
            <div className="detail-value">{selectedCampaign.productInfo.productName || 'N/A'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Product Description:</div>
            <div className="detail-value">{selectedCampaign.productInfo.productDescription || 'N/A'}</div>
          </div>
        </div>
      )}
      
      <div className="form-actions">
        <button
          className="save-button"
          onClick={() => handleEditCampaign(selectedCampaign)}
        >
          Edit Campaign
        </button>
        {selectedCampaign?.status === 'draft' && (
          <button
            className="action-button start"
            onClick={() => handleStartCampaign(selectedCampaign._id)}
          >
            Start Campaign
          </button>
        )}
        {(selectedCampaign?.status === 'active' || selectedCampaign?.status === 'scheduled') && (
          <button
            className="action-button stop"
            onClick={() => handleStopCampaign(selectedCampaign._id)}
          >
            Stop Campaign
          </button>
        )}
        <button
          className="cancel-button"
          onClick={handleCancel}
        >
          Back to List
        </button>
      </div>
    </div>
  );
  
  // Render campaign form
  const renderCampaignForm = () => (
    <form className="campaign-form" onSubmit={handleSubmit}>
      <h2>{selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Campaign Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dialingStrategy">Dialing Strategy</label>
          <select
            id="dialingStrategy"
            name="dialingStrategy"
            value={formData.dialingStrategy}
            onChange={handleInputChange}
          >
            <option value="manual">Manual</option>
            <option value="turbo">Turbo</option>
            <option value="predictive">Predictive</option>
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <h3>Product Information</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="productId">Product ID</label>
          <input
            type="text"
            id="productId"
            name="productId"
            value={formData.productInfo.productId || ''}
            onChange={(e) => handleNestedInputChange(e, 'productInfo')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="productName">Product Name</label>
          <input
            type="text"
            id="productName"
            name="productName"
            value={formData.productInfo.productName || ''}
            onChange={(e) => handleNestedInputChange(e, 'productInfo')}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="productDescription">Product Description</label>
          <textarea
            id="productDescription"
            name="productDescription"
            value={formData.productInfo.productDescription || ''}
            onChange={(e) => handleNestedInputChange(e, 'productInfo')}
            rows="2"
          />
        </div>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="save-button">
          {selectedCampaign ? 'Update Campaign' : 'Create Campaign'}
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
  
  return (
    <div className="campaigns-container">
      <header className="campaigns-header">
        <h1>Campaign Management</h1>
        {viewMode === 'list' && (
          <button className="add-campaign-button" onClick={handleAddCampaign}>
            Create New Campaign
          </button>
        )}
      </header>
      
      <div className="campaigns-content">
        {viewMode === 'list' && renderCampaignList()}
        {viewMode === 'details' && renderCampaignDetails()}
        {viewMode === 'form' && renderCampaignForm()}
      </div>
    </div>
  );
};

export default Campaigns;