import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminApplicantsPaymentDetails.css';

const AdminApplicantsPaymentDetails = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');

  useEffect(() => {
    fetchApplicantsPaymentDetails();
  }, []);

  const fetchApplicantsPaymentDetails = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getContracts();
      const contracts = response?.data || [];

      // Extract freelancer payment details from contracts
      const applicantDetails = contracts.map(contract => ({
        contractId: contract._id,
        jobTitle: contract.jobId?.title || 'N/A',
        freelancerName: contract.freelancerId?.name || 'Unknown',
        freelancerEmail: contract.freelancerId?.email || 'N/A',
        totalAmount: contract.totalAmount || 0,
        contractStatus: contract.status,
        paymentStatus: contract.paymentWorkflow?.clientPaymentStatus,
        appliedAt: contract.freelancerApplication?.appliedAt || contract.createdAt,
        // Payment Details - Get from freelancerApplication (which now stores complete application details)
        upiId: contract.freelancerApplication?.upiId || 'Not provided',
        bankName: contract.freelancerApplication?.bankName || 'Not provided',
        accountHolderName: contract.freelancerApplication?.accountHolderName || 'Not provided',
        accountNumber: contract.freelancerApplication?.accountNumber || 'N/A',
        ifscCode: contract.freelancerApplication?.ifscCode || 'N/A',
        workReceivingEmail: contract.freelancerApplication?.workReceivingEmail || 'Not provided',
        paymentMethod: contract.freelancerApplication?.paymentMethod || 'not_provided',
      }));

      setApplicants(applicantDetails);
      setFilteredApplicants(applicantDetails);
      console.log('✅ Loaded', applicantDetails.length, 'applicant payment details');
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast.error('Failed to load applicants payment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = applicants;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.freelancerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.freelancerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Payment method filter
    if (filterPaymentMethod !== 'all') {
      filtered = filtered.filter(app => app.paymentMethod === filterPaymentMethod);
    }

    setFilteredApplicants(filtered);
  }, [searchTerm, filterPaymentMethod, applicants]);

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'upi':
        return '📱';
      case 'bank_transfer':
        return '🏦';
      case 'not_provided':
        return '❌';
      default:
        return '❓';
    }
  };

  const maskAccountNumber = (accNum) => {
    if (!accNum || accNum === 'N/A') return 'N/A';
    return `****${accNum.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="applicants-payment-container">
        <div className="loading">Loading applicants payment details...</div>
      </div>
    );
  }

  return (
    <div className="applicants-payment-container">
      {/* Header */}
      <div className="payment-header">
        <h1>💳 Applicants Payment Details</h1>
        <p>View all freelancer applicants' payment information and contact details</p>
      </div>

      {/* Filters */}
      <div className="payment-filters">
        <input
          type="text"
          placeholder="Search by name, email, or job title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterPaymentMethod}
          onChange={(e) => setFilterPaymentMethod(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Payment Methods</option>
          <option value="upi">UPI</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="not_provided">Not Provided</option>
        </select>
        <button onClick={fetchApplicantsPaymentDetails} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="payment-stats">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div className="stat-content">
            <p className="stat-label">Total Applicants</p>
            <p className="stat-value">{applicants.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📱</span>
          <div className="stat-content">
            <p className="stat-label">UPI Provided</p>
            <p className="stat-value">{applicants.filter(a => a.upiId !== 'Not provided').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏦</span>
          <div className="stat-content">
            <p className="stat-label">Bank Transfer</p>
            <p className="stat-value">{applicants.filter(a => a.bankName !== 'Not provided').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📧</span>
          <div className="stat-content">
            <p className="stat-label">Work Email Provided</p>
            <p className="stat-value">{applicants.filter(a => a.workReceivingEmail !== 'Not provided').length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="payment-table-wrapper">
        {filteredApplicants.length === 0 ? (
          <div className="no-data">
            <p>No applicants found matching your criteria</p>
          </div>
        ) : (
          <table className="payment-table">
            <thead>
              <tr>
                <th>Freelancer Name</th>
                <th>Email</th>
                <th>Job Title</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>UPI ID / Bank</th>
                <th>Work Email</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((app, idx) => (
                <tr key={idx} className={`payment-row payment-method-${app.paymentMethod}`}>
                  <td className="td-name">
                    <div className="freelancer-info">
                      <span className="freelancer-name">{app.freelancerName}</span>
                    </div>
                  </td>
                  <td className="td-email">{app.freelancerEmail}</td>
                  <td className="td-job">{app.jobTitle}</td>
                  <td className="td-amount">₹{app.totalAmount.toLocaleString()}</td>
                  <td className="td-method">
                    <span className="method-badge">
                      {getPaymentMethodIcon(app.paymentMethod)}
                      {app.paymentMethod === 'upi' && ' UPI'}
                      {app.paymentMethod === 'bank_transfer' && ' Bank Transfer'}
                      {app.paymentMethod === 'not_provided' && ' Not Provided'}
                    </span>
                  </td>
                  <td className="td-payment-details">
                    {app.paymentMethod === 'upi' && (
                      <div className="payment-detail">
                        <p className="detail-label">UPI ID:</p>
                        <p className="detail-value">{app.upiId}</p>
                      </div>
                    )}
                    {app.paymentMethod === 'bank_transfer' && (
                      <div className="payment-detail">
                        <p className="detail-label">{app.bankName}</p>
                        <p className="detail-value">{app.accountHolderName}</p>
                        <p className="detail-value">{maskAccountNumber(app.accountNumber)}</p>
                        <p className="detail-value">{app.ifscCode}</p>
                      </div>
                    )}
                    {app.paymentMethod === 'not_provided' && (
                      <span className="not-provided">Not provided</span>
                    )}
                  </td>
                  <td className="td-work-email">
                    {app.workReceivingEmail !== 'Not provided' ? (
                      <a href={`mailto:${app.workReceivingEmail}`} className="email-link">
                        {app.workReceivingEmail}
                      </a>
                    ) : (
                      <span className="not-provided">Not provided</span>
                    )}
                  </td>
                  <td className="td-date">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="td-status">
                    <span className={`status-badge status-${app.contractStatus}`}>
                      {app.contractStatus || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="payment-footer">
        <p>Showing {filteredApplicants.length} of {applicants.length} applicants</p>
      </div>
    </div>
  );
};

export default AdminApplicantsPaymentDetails;
