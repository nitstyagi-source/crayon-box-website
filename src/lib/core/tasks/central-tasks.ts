/**
 * CENTRAL TASK & FOLLOW-UP ENGINE (Section 73)
 * Manages tasks and actions across all 60+ ERP modules.
 */

export interface CentralTask {
  id: string;
  campusId?: string;
  taskType: string; // e.g. 'ADMISSION_FOLLOWUP', 'FEE_REMINDER', 'DOCUMENT_VERIFICATION', 'COMPLIANCE'
  relatedModule: string;
  relatedRecordId?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completedAt?: string;
  createdAt: string;
}

class CentralTaskManager {
  private tasks: CentralTask[] = [];
  private counter = 0;

  public createTask(task: Omit<CentralTask, 'id' | 'createdAt'>): CentralTask {
    const newTask: CentralTask = {
      ...task,
      id: `TSK-${Date.now()}-${String(++this.counter).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    return newTask;
  }

  public getTasks(filter?: { campusId?: string; status?: string; assignedUserId?: string }): CentralTask[] {
    return this.tasks.filter((t) => {
      if (filter?.campusId && t.campusId !== filter.campusId) return false;
      if (filter?.status && filter.status !== 'ALL' && t.status !== filter.status) return false;
      if (filter?.assignedUserId && t.assignedUserId !== filter.assignedUserId) return false;
      return true;
    });
  }

  public updateStatus(taskId: string, status: CentralTask['status']): boolean {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return false;
    task.status = status;
    if (status === 'COMPLETED') task.completedAt = new Date().toISOString();
    return true;
  }
}

export const erpTasks = new CentralTaskManager();
