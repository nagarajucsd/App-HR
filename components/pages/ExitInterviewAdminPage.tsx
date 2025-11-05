import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Table } from '../common/Table';

interface ExitInterview {
  _id: string;
  employeeId: any;
  resignationDate: string;
  lastWorkingDay: string;
  reasonForLeaving: string;
  overallExperience: number;
  status: string;
  createdAt: string;
}

export const ExitInterviewAdminPage: React.FC = () => {
  const [interviews, setInterviews] = useState<ExitInterview[]>([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<ExitInterview | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchInterviews();
  }, [filter]);

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'All' 
        ? 'http://localhost:5000/api/exit-interviews'
        : `http://localhost:5000/api/exit-interviews?status=${filter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInterviews(data);
      }
    } catch (err) {
      console.error('Error fetching interviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/exit-interviews/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchInterviews();
        alert('Exit interview approved successfully');
      }
    } catch (err) {
      alert('Error approving interview');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/exit-interviews/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason }),
      });

      if (response.ok) {
        fetchInterviews();
        setSelectedInterview(null);
        setRejectionReason('');
        alert('Exit interview rejected');
      }
    } catch (err) {
      alert('Error rejecting interview');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exit Interviews Management</h1>
        <div className="flex gap-2">
          {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'outline'}
              onClick={() => setFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Resignation Date</th>
                <th>Last Working Day</th>
                <th>Reason</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map(interview => (
                <tr key={interview._id}>
                  <td>{interview.employeeId?.name || 'N/A'}</td>
                  <td>{new Date(interview.resignationDate).toLocaleDateString()}</td>
                  <td>{new Date(interview.lastWorkingDay).toLocaleDateString()}</td>
                  <td>{interview.reasonForLeaving}</td>
                  <td>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={`text-sm ${star <= interview.overallExperience ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{getStatusBadge(interview.status)}</td>
                  <td>{new Date(interview.createdAt).toLocaleDateString()}</td>
                  <td>
                    {interview.status === 'Pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(interview._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInterview(interview)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/exit-interviews/${interview._id}`}
                        >
                          View
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Reject Exit Interview</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this exit interview.
            </p>
            <textarea
              className="w-full border rounded-lg p-2 mb-4"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleReject(selectedInterview._id)}
              >
                Confirm Reject
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedInterview(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
