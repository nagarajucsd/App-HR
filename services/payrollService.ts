import api from './api';
import { PayrollRecord } from '../types';

export const payrollService = {
  // Get all payroll records
  async getAllPayrollRecords(): Promise<PayrollRecord[]> {
    const response = await api.get('/payroll');
    return response.data;
  },

  // Get payroll records by employee
  async getPayrollByEmployee(employeeId: string): Promise<PayrollRecord[]> {
    const response = await api.get(`/payroll/employee/${employeeId}`);
    return response.data;
  },

  // Get payroll by ID
  async getPayrollById(id: string): Promise<PayrollRecord> {
    const response = await api.get(`/payroll/${id}`);
    return response.data;
  },

  // Create payroll record
  async createPayrollRecord(record: Omit<PayrollRecord, 'id'>): Promise<PayrollRecord> {
    const response = await api.post('/payroll', record);
    return response.data;
  },

  // Update payroll record
  async updatePayrollRecord(id: string, record: Partial<PayrollRecord>): Promise<PayrollRecord> {
    const response = await api.put(`/payroll/${id}`, record);
    return response.data;
  },

  // Delete payroll record
  async deletePayrollRecord(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/payroll/${id}`);
    return response.data;
  },

  // Process payroll for month
  async processPayroll(month: string, year: number): Promise<{ message: string; recordsProcessed: number }> {
    const response = await api.post('/payroll/process', { month, year });
    return response.data;
  },
};
