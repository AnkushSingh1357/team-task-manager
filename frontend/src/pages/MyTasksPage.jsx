import { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import StatusBadge from '../components/tasks/StatusBadge';
import PriorityBadge from '../components/tasks/PriorityBadge';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    tasksAPI.myTasks()
      .then(res => setTasks(res.data.tasks))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <div className="text-sm text-gray-500">Loading your tasks...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Personal Tasks</h1>
        <div className="flex gap-2">
          {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-bold rounded border ${
                filter === f 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'ALL' ? 'Everything' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md shadow-sm divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm italic">No tasks found.</div>
        ) : (
          filtered.map(task => (
            <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-900">{task.title}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{task.project?.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
