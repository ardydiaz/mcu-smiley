import { Eye } from 'lucide-react';
import { useState } from 'react';
import Button from '../common/Button.jsx';
import Modal from '../common/Modal.jsx';
import { formatDateTime } from '../../utils/helpers.js';

const messageIcon = String.fromCodePoint(0x1f4ac);

function EmptyText({ children }) {
  return <span className="muted-text">{children || 'N/A'}</span>;
}

function DetailItem({ label, children }) {
  return (
    <div className="feedback-modal-detail">
      <span>{label}</span>
      <strong>{children || 'N/A'}</strong>
    </div>
  );
}

export default function FeedbackTable({ items = [] }) {
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  return (
    <>
      <div className="table-wrap feedback-table-wrap">
        <table className="feedback-data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Rating</th>
              <th>User Type</th>
              <th>Department</th>
              <th>Location</th>
              <th>Tablet</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td className="date-cell">{formatDateTime(item.created_at)}</td>
                <td>
                  <span className="rating-table-pill">
                    <span aria-hidden="true">{item.rating_emoji || messageIcon}</span>
                    <strong>{item.rating}</strong>
                    <small>{item.score}</small>
                  </span>
                </td>
                <td><EmptyText>{item.user_type}</EmptyText></td>
                <td className="department-table-cell"><EmptyText>{item.department}</EmptyText></td>
                <td><EmptyText>{item.location}</EmptyText></td>
                <td>
                  <span className="terminal-cell">
                    <strong>{item.terminal_code || 'N/A'}</strong>
                    <span>{item.terminal || ''}</span>
                  </span>
                </td>
                <td>
                  <Button type="button" variant="secondary" icon={Eye} onClick={() => setSelectedFeedback(item)}>View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedFeedback ? (
        <Modal title="Feedback Details" onClose={() => setSelectedFeedback(null)}>
          <div className="feedback-modal-content">
            <div className="feedback-modal-header">
              <span className="feedback-modal-emoji" aria-hidden="true">{selectedFeedback.rating_emoji || messageIcon}</span>
              <div>
                <h3>{selectedFeedback.rating}</h3>
                <p>Score {selectedFeedback.score} - {formatDateTime(selectedFeedback.created_at)}</p>
              </div>
            </div>

            <div className="feedback-modal-message">
              {selectedFeedback.feedback || 'No feedback message'}
            </div>

            <div className="feedback-modal-grid">
              <DetailItem label="User Type">{selectedFeedback.user_type}</DetailItem>
              <DetailItem label="Department">{selectedFeedback.department}</DetailItem>
              <DetailItem label="Location">{selectedFeedback.location}</DetailItem>
              <DetailItem label="Tablet Code">{selectedFeedback.terminal_code}</DetailItem>
              <DetailItem label="Tablet Name">{selectedFeedback.terminal}</DetailItem>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
