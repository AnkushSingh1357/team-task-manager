import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import StatusBadge from '../components/tasks/StatusBadge';
import PriorityBadge from '../components/tasks/PriorityBadge';
import TaskModal from '../components/tasks/TaskModal';
import Modal from '../components/ui/Modal';

const STATUS_COLS = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Completed' },
];

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');

  const membership = project?.members?.find(m => m.user.id === user?.id);
  const isAdmin = membership?.role === 'ADMIN';

  useEffect(() => {
    Promise.all([
      projectsAPI.get(projectId),
      tasksAPI.getProjectTasks(projectId),
    ]).then(([pRes, tRes]) => {
      setProject(pRes.data.project);
      setTasks(tRes.data.tasks);
    }).catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await projectsAPI.addMember(projectId, { email: memberEmail, role: 'MEMBER' });
      setProject({...project, members: [...project.members, res.data.member]});
      setShowAddMember(false);
      setMemberEmail('');
      toast.success('Member added');
    } catch (err) {
      toast.error('Could not add member');
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading project...</div>;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-500">{project.description}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button className="btn-secondary text-sm" onClick={() => setShowAddMember(true)}>Add Team Member</button>
              <button className="btn-primary text-sm" onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>New Task</button>
            </>
          )}
        </div>
      </div>

      {/* Basic Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUS_COLS.map(col => (
          <div key={col.key} className="bg-gray-100 rounded p-4 border border-gray-200">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">
              {col.label} ({tasks.filter(t => t.status === col.key).length})
            </h3>
            <div className="space-y-3">
              {tasks.filter(t => t.status === col.key).map(task => (
                <div 
                  key={task.id} 
                  className="bg-white p-3 border border-gray-200 shadow-sm rounded hover:border-blue-500 cursor-pointer"
                  onClick={() => { setEditingTask(task); setShowTaskModal(true); }}
                >
                  <p className="text-sm font-bold text-gray-900 mb-2">{task.title}</p>
                  <div className="flex justify-between items-center">
                    <PriorityBadge priority={task.priority} />
                    {task.assignee && (
                      <span className="text-[10px] font-bold text-gray-400">@{task.assignee.name.split(' ')[0]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAddMember && (
        <Modal title="Invite Member" onClose={() => setShowAddMember(false)}>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="label">User Email</label>
              <input type="email" className="input" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required placeholder="user@example.com" />
            </div>
            <button type="submit" className="btn-primary w-full">Add to Team</button>
          </form>
        </Modal>
      )}

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          projectId={projectId}
          members={project.members}
          isAdmin={isAdmin}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onCreate={t => setTasks([t, ...tasks])}
          onUpdate={t => setTasks(tasks.map(x => x.id === t.id ? t : x))}
          onDelete={id => setTasks(tasks.filter(x => x.id !== id))}
        />
      )}
    </div>
  );
}
