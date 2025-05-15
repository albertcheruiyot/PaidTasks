// src/pages/wallet/components/WithdrawalHistory.js

import React from 'react';

const WithdrawalHistory = ({ history }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Processing';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="withdrawal-history">
      <h2>Withdrawal History</h2>
      
      {history.length === 0 ? (
        <div className="no-history">
          <p>No withdrawal history yet.</p>
        </div>
      ) : (
        <div className="history-list">
          <div className="history-header">
            <div className="history-date">Date</div>
            <div className="history-amount">Amount</div>
            <div className="history-method">M-Pesa</div>
            <div className="history-status">Status</div>
          </div>
          
          {history.map((withdrawal) => (
            <div key={withdrawal.id} className="history-item">
              <div className="history-date">
                {formatDate(withdrawal.createdAt)}
              </div>
              <div className="history-amount">KSh {withdrawal.amount}</div>
              <div className="history-method">{withdrawal.mpesaNumber}</div>
              <div className="history-status">
                <span className={`status-badge ${getStatusClass(withdrawal.status)}`}>
                  {withdrawal.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;