import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContacts, clearContactsError, createContact, updateContact, deleteContact } from '../redux/contactsSlice';
import api from '../services/api';
import websocketService from '../services/websocket';
import './Contacts.css';

const Contacts = () => {
  const dispatch = useDispatch();
  const { contacts, loading, error, pagination } = useSelector((state) => state.contacts);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'details', 'form'
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phoneNumbers: [{ type: 'mobile', number: '', primary: true }],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    demographics: {
      age: '',
      gender: '',
      income: '',
      occupation: ''
    },
    status: 'new'
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);
  
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(fetchContacts({ page: currentPage, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);
  
  // Initialize WebSocket listeners
  useEffect(() => {
    // Join contacts room
    websocketService.joinRoom('contacts-room');
    
    // Listen for contact updates
    const handleContactUpdate = (data) => {
      // Refresh contacts when there's an update
      dispatch(fetchContacts({ page: currentPage, search: searchTerm }));
    };
    
    // Add event listeners
    websocketService.on('contact-update', handleContactUpdate);
    
    // Clean up event listeners
    return () => {
      websocketService.off('contact-update', handleContactUpdate);
      websocketService.leaveRoom('contacts-room');
    };
  }, [dispatch, currentPage, searchTerm]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(fetchContacts({ page: 1, search: searchTerm }));
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleAddContact = () => {
    setFormData({
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phoneNumbers: [{ type: 'mobile', number: '', primary: true }],
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      demographics: {
        age: '',
        gender: '',
        income: '',
        occupation: ''
      },
      status: 'new'
    });
    setViewMode('form');
  };
  
  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setViewMode('details');
  };
  
  const handleEditContact = (contact) => {
    setFormData({
      ...contact,
      phoneNumbers: contact.phoneNumbers && contact.phoneNumbers.length > 0
        ? contact.phoneNumbers
        : [{ type: 'mobile', number: '', primary: true }]
    });
    setSelectedContact(contact);
    setViewMode('form');
  };
  
  const handleDeleteContact = (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      dispatch(deleteContact(contactId));
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
  
  const handlePhoneNumberChange = (index, field, value) => {
    setFormData(prev => {
      const updatedPhoneNumbers = [...prev.phoneNumbers];
      updatedPhoneNumbers[index] = {
        ...updatedPhoneNumbers[index],
        [field]: value
      };
      return {
        ...prev,
        phoneNumbers: updatedPhoneNumbers
      };
    });
  };
  
  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, { type: 'mobile', number: '', primary: false }]
    }));
  };
  
  const removePhoneNumber = (index) => {
    if (formData.phoneNumbers.length > 1) {
      setFormData(prev => {
        const updatedPhoneNumbers = [...prev.phoneNumbers];
        updatedPhoneNumbers.splice(index, 1);
        return {
          ...prev,
          phoneNumbers: updatedPhoneNumbers
        };
      });
    }
  };
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  
  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    try {
      const response = await api.post('/contacts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadResult(response.data);
      setUploading(false);
      
      // Refresh contacts list
      dispatch(fetchContacts({ page: currentPage, search: searchTerm }));
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    } catch (error) {
      setUploadResult({
        success: false,
        message: error.response?.data?.message || 'Upload failed'
      });
      setUploading(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add createdBy field
    const contactData = {
      ...formData,
      createdBy: user?.id
    };
    
    if (selectedContact) {
      // Update existing contact
      dispatch(updateContact({ id: selectedContact._id, contactData }));
    } else {
      // Create new contact
      dispatch(createContact(contactData));
    }
    
    setViewMode('list');
  };
  
  const handleCancel = () => {
    setViewMode('list');
    setSelectedContact(null);
  };
  
  // Render contact list view
  const renderContactList = () => (
    <>
      <div className="contacts-toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <button className="upload-button" onClick={() => fileInputRef.current?.click()}>
          <span>Upload CSV/XLSX</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
          />
        </button>
        {file && (
          <button
            className="upload-button"
            onClick={handleFileUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        )}
      </div>
      
      {uploadResult && (
        <div className={`error-message ${uploadResult.success ? '' : 'error'}`}>
          <p>{uploadResult.message}</p>
          <button onClick={() => setUploadResult(null)}>Clear</button>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => dispatch(clearContactsError())}>Clear</button>
        </div>
      )}
      
      {loading ? (
        <div className="loading">Loading contacts...</div>
      ) : (
        <>
          <div className="contacts-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <tr key={contact._id}>
                      <td>{contact.firstName} {contact.lastName}</td>
                      <td>{contact.email}</td>
                      <td>
                        {contact.phoneNumbers && contact.phoneNumbers.length > 0
                          ? contact.phoneNumbers[0].number
                          : 'N/A'}
                      </td>
                      <td>{contact.company || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${contact.status}`}>
                          {contact.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-button view"
                          onClick={() => handleViewContact(contact)}
                        >
                          View
                        </button>
                        <button
                          className="action-button edit"
                          onClick={() => handleEditContact(contact)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => handleDeleteContact(contact._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-contacts">
                      No contacts found
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
  
  // Render contact details view
  const renderContactDetails = () => (
    <div className="contact-details">
      <h2>Contact Details</h2>
      <div className="detail-row">
        <div className="detail-label">Name:</div>
        <div className="detail-value">{selectedContact?.firstName} {selectedContact?.lastName}</div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Company:</div>
        <div className="detail-value">{selectedContact?.company || 'N/A'}</div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Email:</div>
        <div className="detail-value">{selectedContact?.email || 'N/A'}</div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Phone Numbers:</div>
        <div className="detail-value">
          {selectedContact?.phoneNumbers && selectedContact.phoneNumbers.length > 0 ? (
            <ul>
              {selectedContact.phoneNumbers.map((phone, index) => (
                <li key={index}>
                  {phone.type}: {phone.number} {phone.primary ? '(Primary)' : ''}
                </li>
              ))}
            </ul>
          ) : (
            'N/A'
          )}
        </div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Status:</div>
        <div className="detail-value">
          <span className={`status-badge ${selectedContact?.status}`}>
            {selectedContact?.status}
          </span>
        </div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Address:</div>
        <div className="detail-value">
          {selectedContact?.address ? (
            <>
              {selectedContact.address.street && `${selectedContact.address.street}, `}
              {selectedContact.address.city && `${selectedContact.address.city}, `}
              {selectedContact.address.state && `${selectedContact.address.state} `}
              {selectedContact.address.zipCode && `${selectedContact.address.zipCode}, `}
              {selectedContact.address.country}
            </>
          ) : (
            'N/A'
          )}
        </div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Demographics:</div>
        <div className="detail-value">
          {selectedContact?.demographics ? (
            <>
              {selectedContact.demographics.age && `Age: ${selectedContact.demographics.age}, `}
              {selectedContact.demographics.gender && `Gender: ${selectedContact.demographics.gender}, `}
              {selectedContact.demographics.income && `Income: ${selectedContact.demographics.income}, `}
              {selectedContact.demographics.occupation && `Occupation: ${selectedContact.demographics.occupation}`}
            </>
          ) : (
            'N/A'
          )}
        </div>
      </div>
      <div className="form-actions">
        <button
          className="save-button"
          onClick={() => handleEditContact(selectedContact)}
        >
          Edit Contact
        </button>
        <button
          className="cancel-button"
          onClick={handleCancel}
        >
          Back to List
        </button>
      </div>
    </div>
  );
  
  // Render contact form
  const renderContactForm = () => (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h2>{selectedContact ? 'Edit Contact' : 'Add New Contact'}</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="company">Company</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Phone Numbers</label>
        <div className="phone-numbers">
          {formData.phoneNumbers.map((phone, index) => (
            <div key={index} className="phone-number-item">
              <select
                value={phone.type}
                onChange={(e) => handlePhoneNumberChange(index, 'type', e.target.value)}
              >
                <option value="mobile">Mobile</option>
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Phone number"
                value={phone.number}
                onChange={(e) => handlePhoneNumberChange(index, 'number', e.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  checked={phone.primary}
                  onChange={(e) => handlePhoneNumberChange(index, 'primary', e.target.checked)}
                />
                Primary
              </label>
              {formData.phoneNumbers.length > 1 && (
                <button
                  type="button"
                  className="remove-phone-button"
                  onClick={() => removePhoneNumber(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-phone-button"
            onClick={addPhoneNumber}
          >
            Add Phone Number
          </button>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="not-interested">Not Interested</option>
            <option value="do-not-call">Do Not Call</option>
          </select>
        </div>
      </div>
      
      <h3>Address</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="street">Street</label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.address.street || ''}
            onChange={(e) => handleNestedInputChange(e, 'address')}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.address.city || ''}
            onChange={(e) => handleNestedInputChange(e, 'address')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="state">State</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.address.state || ''}
            onChange={(e) => handleNestedInputChange(e, 'address')}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="zipCode">Zip Code</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.address.zipCode || ''}
            onChange={(e) => handleNestedInputChange(e, 'address')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.address.country || ''}
            onChange={(e) => handleNestedInputChange(e, 'address')}
          />
        </div>
      </div>
      
      <h3>Demographics</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.demographics.age || ''}
            onChange={(e) => handleNestedInputChange(e, 'demographics')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <input
            type="text"
            id="gender"
            name="gender"
            value={formData.demographics.gender || ''}
            onChange={(e) => handleNestedInputChange(e, 'demographics')}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="income">Income</label>
          <input
            type="number"
            id="income"
            name="income"
            value={formData.demographics.income || ''}
            onChange={(e) => handleNestedInputChange(e, 'demographics')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="occupation">Occupation</label>
          <input
            type="text"
            id="occupation"
            name="occupation"
            value={formData.demographics.occupation || ''}
            onChange={(e) => handleNestedInputChange(e, 'demographics')}
          />
        </div>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="save-button">
          {selectedContact ? 'Update Contact' : 'Create Contact'}
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
    <div className="contacts-container">
      <header className="contacts-header">
        <h1>Contact Management</h1>
        {viewMode === 'list' && (
          <button className="add-contact-button" onClick={handleAddContact}>
            Add New Contact
          </button>
        )}
      </header>
      
      <div className="contacts-content">
        {viewMode === 'list' && renderContactList()}
        {viewMode === 'details' && renderContactDetails()}
        {viewMode === 'form' && renderContactForm()}
      </div>
    </div>
  );
};

export default Contacts;