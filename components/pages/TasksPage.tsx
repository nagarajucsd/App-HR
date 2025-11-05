import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, User, UserRole, Employee, Department } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '../common/Table';
import { taskService } from '../../services/taskService';
import { useToast } from '../../hooks/useToast';
import Icon from '../common/Icon';

interface TasksPageProps {
  user: User;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  employees: Employee[];
  departments: Department[];
  users: User[];
  onTaskNotification?: (notification: { userId?: string; userIds?: string[]; title: string; message: string; link?: string }) => Promise<void>;
}

const TasksPage: React.FC<TasksPageProps> = ({ user, tasks, setTasks, employees, departments, users, onTaskNotification }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  
  const { addToast } = useToast();
  
  const canManageTasks = user.role === UserRole.Admin || user.role === UserRole.HR || user.role === UserRole.Manager;
  
  // Filter employees by selected department
  const filteredEmployees = selectedDepartment
    ? employees.filter(e => e.departmentId === selectedDepartment)
    : employees;
  
  // Filter tasks based on filters
  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterDepartment !== 'all' && task.departmentId !== filterDepartment) return false;
    return true;
  });
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority(TaskPriority.Medium);
    setSelectedDepartment('');
    setAssignedTo('');
    setDueDate('');
    setIsCreating(false);
    setEditingTask(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !selectedDepartment || !assignedTo || !dueDate) {
      addToast({ type: 'error', message: 'Please fill all required fields' });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (editingTask) {
        // Update existing task
        const updated = await taskService.updateTask(editingTask.id, {
          title,
          description,
          priority,
          assignedTo,
          departmentId: selectedDepartment,
          dueDate
        });
        
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
        addToast({ type: 'success', message: 'Task updated successfully!' });
        
        // Send notification if task was reassigned to a different person
        if (onTaskNotification && editingTask.assignedTo !== assignedTo) {
          const assignedEmployee = employees.find(e => e.id === assignedTo);
          if (assignedEmployee) {
            await onTaskNotification({
              userId: assignedTo,
              title: 'Task Reassigned',
              message: `Task "${title}" has been reassigned to you`,
              link: 'Tasks'
            });
          }
        }
      } else {
        // Create new task
        const newTask = await taskService.createTask({
          title,
          description,
          priority,
          status: TaskStatus.ToDo,
          assignedTo,
          assignedBy: user.id,
          departmentId: selectedDepartment,
          dueDate
        });
        
        setTasks(prev => [newTask, ...prev]);
        addToast({ type: 'success', message: 'Task created successfully!' });
        
        // Send notification to assigned employee
        if (onTaskNotification) {
          const assignedEmployee = employees.find(e => e.id === assignedTo);
          if (assignedEmployee) {
            await onTaskNotification({
              userId: assignedTo,
              title: 'New Task Assigned',
              message: `You have been assigned a new task: "${title}"`,
              link: 'Tasks'
            });
          }
        }
      }
      
      resetForm();
    } catch (error: any) {
      console.error('Task operation error:', error);
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to save task' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setSelectedDepartment(task.departmentId);
    setAssignedTo(task.assignedTo);
    setDueDate(task.dueDate);
    setIsCreating(true);
  };
  
  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      setIsLoading(true);
      await taskService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      addToast({ type: 'success', message: 'Task deleted successfully!' });
    } catch (error: any) {
      console.error('Delete task error:', error);
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to delete task' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      setIsLoading(true);
      const task = tasks.find(t => t.id === taskId);
      const updated = await taskService.updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      addToast({ type: 'success', message: 'Task status updated!' });
      
      // Send notifications based on status change
      if (onTaskNotification && task) {
        // Get all HR, Manager, and Admin users (excluding current user)
        const managementUsers = users.filter(u => 
          (u.role === UserRole.HR || u.role === UserRole.Manager || u.role === UserRole.Admin) && 
          u.id !== user.id
        );
        
        console.log('🔍 Task status change:', {
          taskTitle: task.title,
          oldStatus: task.status,
          newStatus: newStatus,
          currentUser: user.name,
          managementUsers: managementUsers.map(u => ({ name: u.name, role: u.role, id: u.id }))
        });
        
        const managementUserIds = managementUsers.map(u => u.id);
        
        // Notify management when task is marked as done
        if (newStatus === TaskStatus.Done) {
          if (managementUserIds.length === 0) {
            console.warn('⚠️ No management users found to notify!');
          } else {
            const assignedEmployee = employees.find(e => e.id === task.assignedTo);
            const employeeName = assignedEmployee?.name || user.name || 'An employee';
            
            console.log('📤 Sending task completion notification to:', managementUserIds);
            console.log('   Employee name:', employeeName);
            console.log('   Task title:', task.title);
            
            await onTaskNotification({
              userIds: managementUserIds,
              title: 'Task Completed',
              message: `${employeeName} completed task: "${task.title}"`,
              link: 'Tasks'
            });
          }
        }
        
        // Notify management when task progress starts (To Do -> In Progress)
        if (task.status === TaskStatus.ToDo && newStatus === TaskStatus.InProgress) {
          if (managementUserIds.length === 0) {
            console.warn('⚠️ No management users found to notify!');
          } else {
            const assignedEmployee = employees.find(e => e.id === task.assignedTo);
            const employeeName = assignedEmployee?.name || user.name || 'An employee';
            
            console.log('📤 Sending task progress notification to:', managementUserIds);
            console.log('   Employee name:', employeeName);
            console.log('   Task title:', task.title);
            
            await onTaskNotification({
              userIds: managementUserIds,
              title: 'Task In Progress',
              message: `${employeeName} started working on: "${task.title}"`,
              link: 'Tasks'
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Update status error:', error);
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to update status' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.High: return 'text-red-600 bg-red-100';
      case TaskPriority.Medium: return 'text-yellow-600 bg-yellow-100';
      case TaskPriority.Low: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Done: return 'text-green-600 bg-green-100';
      case TaskStatus.InProgress: return 'text-blue-600 bg-blue-100';
      case TaskStatus.ToDo: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Unknown';
  };
  
  const getDepartmentName = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || 'Unknown';
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
        {canManageTasks && (
          <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
            <Icon name="plus" className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        )}
      </div>
      
      {isCreating && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority *</label>
                <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} required>
                  <option value={TaskPriority.Low}>Low</option>
                  <option value={TaskPriority.Medium}>Medium</option>
                  <option value={TaskPriority.High}>High</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Department *</label>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setAssignedTo(''); // Reset employee when department changes
                  }}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Assign To *</label>
                <Select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                  disabled={!selectedDepartment}
                >
                  <option value="">Select Employee</option>
                  {filteredEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </Select>
                {!selectedDepartment && (
                  <p className="text-xs text-muted-foreground mt-1">Select a department first</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Due Date *</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                required
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      <Card>
        <div className="mb-4 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Status</label>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value={TaskStatus.ToDo}>To Do</option>
              <option value={TaskStatus.InProgress}>In Progress</option>
              <option value={TaskStatus.Done}>Done</option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Priority</label>
            <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value={TaskPriority.Low}>Low</option>
              <option value={TaskPriority.Medium}>Medium</option>
              <option value={TaskPriority.High}>High</option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Department</label>
            <Select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{task.description}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.role === UserRole.Employee ? (
                        <Select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className="text-xs"
                        >
                          <option value={TaskStatus.ToDo}>To Do</option>
                          <option value={TaskStatus.InProgress}>In Progress</option>
                          <option value={TaskStatus.Done}>Done</option>
                        </Select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{getEmployeeName(task.assignedTo)}</TableCell>
                    <TableCell>{getDepartmentName(task.departmentId)}</TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {canManageTasks && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEdit(task)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(task.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default TasksPage;
