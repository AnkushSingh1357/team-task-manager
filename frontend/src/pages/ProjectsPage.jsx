import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6' });

  useEffect(() => {
    projectsAPI.getAll()
      .then(res => setProjects(res.data.projects))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await projectsAPI.create(form);
      setProjects([res.data.project, ...projects]);
      setShowCreate(false);
      setForm({ name: '', description: '', color: '#3b82f6' });
      toast.success('Project created');
    } catch (err) {
      toast.error('Could not create project');
    }
  };

  if (loading) return <div className="text-gray-500 text-sm">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Project Directory</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>Create Project</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.id} className="card bg-white hover:border-gray-400 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {project._count?.tasks ?? 0} Tasks
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4 h-10 line-clamp-2">{project.description || 'No description.'}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-500">{project.members?.length} Members</span>
              <Link to={`/projects/${project.id}`} className="text-sm font-bold text-blue-600 hover:underline">Manage →</Link>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <Modal title="Create New Project" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Project Title</label>
              <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="label">Description (Optional)</label>
              <textarea className="input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">Create Project</button>
              <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
