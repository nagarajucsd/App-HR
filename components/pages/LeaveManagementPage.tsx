import React, { useState, useMemo } from 'react';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../types';
import Card from '../common/Card';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '../common/Table';
import Button from '../common/Button';
import Dialog from '../common/Dialog';
import { useToast } from '../../hooks/useToast';
import Textarea from '../common/Textarea';
import Label from '../common/Label';
import Input from '../common/Input';
import Icon from '../common/Icon';

const StatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
  const statusClasses: Record<LeaveStatus, string> = {
    [LeaveStatus.Approved]: 'bg-green-100 text-green-800',
    [LeaveStatus.Pending]: 'bg-yellow-100 text-yellow-800',
    [LeaveStatus.Rejected]: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
      {status}
    </span>
  );
};

interface LeaveManagementPageProps {
  leaveRequests: LeaveRequest[];
  onLeaveAction: (requestId: string, newStatus: LeaveStatus.Approved | LeaveStatus.Rejected, employeeId: string, leaveType: LeaveType, days: number) => void;
}

const LeaveManagementPage: React.FC<LeaveManagementPageProps> = ({ leaveRequests, onLeaveAction }) => {
  const [filter, setFilter] = useState<LeaveStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [searchName, setSearchName] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const { addToast } = useToast();

  const filteredRequests = useMemo(() => {
    let filtered = [...leaveRequests];
    
    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(req => req.status === filter);
    }
    
    // Filter by employee name
    if (searchName.trim()) {
      filtered = filtered.filter(req => 
        req.employeeName.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    // Filter by date range
    if (startDateFilter) {
      filtered = filtered.filter(req => 
        new Date(req.startDate) >= new Date(startDateFilter)
      );
    }
    
    if (endDateFilter) {
      filtered = filtered.filter(req => 
        new Date(req.endDate) <= new Date(endDateFilter)
      );
    }
    
    // Sort by start date (newest first)
    return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [leaveRequests, filter, searchName, startDateFilter, endDateFilter]);

  const openActionModal = (request: LeaveRequest, actionType: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setAction(actionType);
    setIsModalOpen(true);
    setComment('');
  };

  const handleAction = () => {
    if (!selectedRequest || !action) return;
    
    const newStatus = action === 'approve' ? LeaveStatus.Approved : LeaveStatus.Rejected;
    onLeaveAction(selectedRequest.id, newStatus, selectedRequest.employeeId, selectedRequest.leaveType, selectedRequest.days);

    setIsModalOpen(false);
    setSelectedRequest(null);
    setAction(null);
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-6">Leave Requests Management</h1>
        <Card>
          {/* Status Filter Tabs */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {(['all', ...Object.values(LeaveStatus)] as const).map(status => (
                <Button 
                  key={status}
                  variant={filter === status ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === 'all' ? 'All' : status} ({status === 'all' ? leaveRequests.length : leaveRequests.filter(r => r.status === status).length})
                </Button>
              ))}
            </div>
          </div>

          {/* Search and Date Filters */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Employee Name Search */}
              <div>
                <Label htmlFor="searchName" className="text-sm font-medium mb-2">
                  Search Employee
                </Label>
                <div className="relative">
                  <Icon name="user" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="searchName"
                    type="text"
                    placeholder="Enter employee name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Start Date Filter */}
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium mb-2">
                  From Date
                </Label>
                <div className="relative">
                  <Icon name="calendar" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* End Date Filter */}
              <div>
                <Label htmlFor="endDate" className="text-sm font-medium mb-2">
                  To Date
                </Label>
                <div className="relative">
                  <Icon name="calendar" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchName || startDateFilter || endDateFilter) && (
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchName('');
                    setStartDateFilter('');
                    setEndDateFilter('');
                  }}
                >
                  <Icon name="x" className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center">
                        <Icon name="calendar" className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-lg font-medium">No leave requests found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.employeeName}</TableCell>
                      <TableCell>{req.leaveType}</TableCell>
                      <TableCell>{`${req.startDate} to ${req.endDate}`}</TableCell>
                      <TableCell>{req.days}</TableCell>
                      <TableCell><StatusBadge status={req.status} /></TableCell>
                      <TableCell>
                        {req.status === LeaveStatus.Pending && (
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openActionModal(req, 'approve')}>Approve</Button>
                            <Button variant="destructive" size="sm" onClick={() => openActionModal(req, 'reject')}>Reject</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
      
      {isModalOpen && selectedRequest && (
         <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Confirm ${action}`}>
            <div className="text-sm mt-4 space-y-2">
                <p><strong className="text-foreground">Employee:</strong> {selectedRequest.employeeName}</p>
                <p><strong className="text-foreground">Dates:</strong> {selectedRequest.startDate} to {selectedRequest.endDate} ({selectedRequest.days} days)</p>
                <p><strong className="text-foreground">Reason:</strong> {selectedRequest.reason}</p>
            </div>
            <div className="mt-4">
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant={action === 'approve' ? 'default' : 'destructive'} onClick={handleAction}>
                    Confirm {action}
                </Button>
            </div>
         </Dialog>
      )}
    </>
  );
};

export default LeaveManagementPage;