import { useState } from 'react';
import { tasksAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import { format } from 'date-fns';

export default function TaskModal({ task, projectId, members, isAdmin, onClose, onCreate, onUpdate, onDelete }) {
  const isEditing = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    assignedTo: task?.assignedTo || task?.assignee?.id || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate || null,
        assignedTo: form.assignedTo || null,
      };

      if (isEditing) {
        const res = await tasksAPI.update(task.id, payload);
        toast.success('Task updated');
        onUpdate(res.data.task);
      } else {
        const res = await tasksAPI.create(projectId, payload);
        toast.success('Task created');
        onCreate(res.data.task);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(task.id);
      toast.success('Task deleted');
      onDelete(task.id);
      onClose();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const canEditAll = isAdmin;

  return (
    <Modal title={isEditing ? 'Edit Task' : 'New Task'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input className="input" placeholder="Task title"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            required disabled={!canEditAll && isEditing} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="What needs to be done?"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            disabled={!canEditAll && isEditing} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority}
              onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              disabled={!canEditAll && isEditing}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input" value={form.dueDate}
              onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
              disabled={!canEditAll && isEditing} />
          </div>
          <div>
            <label className="label">Assignee</label>
            <select className="input" value={form.assignedTo}
              onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
              disabled={!canEditAll && isEditing}>
              <option value="">Unassigned</option>
              {members?.map(m => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {isEditing && isAdmin && (
            <button type="button" className="btn-danger" onClick={handleDelete}>Delete</button>
          )}
          <div className="flex gap-3 flex-1">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
