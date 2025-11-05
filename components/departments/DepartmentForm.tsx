import React, { useState } from 'react';
import { Department, Employee } from '../../types';
import Dialog from '../common/Dialog';
import Button from '../common/Button';
import Input from '../common/Input';
import Label from '../common/Label';
import Select from '../common/Select';
import Icon from '../common/Icon';

interface DepartmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: Department) => void;
  department: Department | null;
  employees: Employee[];
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ isOpen, onClose, onSave, department, employees }) => {
  const [name, setName] = useState(department?.name || '');
  const [managerId, setManagerId] = useState(department?.managerId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const departmentData: Department = {
      id: department?.id || '',
      name,
      managerId: managerId || undefined,
    };
    onSave(departmentData);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={department ? 'Edit Department' : 'Create Department'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center p-4 mb-2 bg-secondary/50 rounded-lg">
            <Icon name="briefcase" className="w-10 h-10 text-primary mr-4 flex-shrink-0" />
            <div>
                <h4 className="font-semibold text-foreground">Department Details</h4>
                <p className="text-sm text-muted-foreground">Provide a name and assign an optional manager.</p>
            </div>
        </div>
        <div>
          <Label htmlFor="name">Department Name</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="managerId">Manager</Label>
          <Select id="managerId" value={managerId} onChange={e => setManagerId(e.target.value)}>
            <option value="">Select a Manager (optional)</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </Select>
        </div>
        <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Department</Button>
        </div>
      </form>
    </Dialog>
  );
};

export default DepartmentForm;