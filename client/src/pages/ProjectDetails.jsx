import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Plus, Trash2, Calendar, ArrowRight, ArrowLeft,
  ChevronRight, Sparkles, AlertCircle, Info, Edit, CheckSquare
} from 'lucide-react';

const ProjectDetails = ({ projectId, onNavigateToDashboard, onDeleteSuccess }) => {
  const { token, user, showToast } = useAuth();
  
  const [project, setProject] = useState(null);
  const [userRole, setUserRole] = useState('Project Member'); // Default
  const [loading, setLoading] = useState(true);

  // Modals visibility state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // For viewing/editing

  // New Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskStatus, setTaskStatus] = useState('Todo');
  const [taskSubmitLoading, setTaskSubmitLoading] = useState(false);

  // New Member Form State
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Project Member');
  const [memberSubmitLoading, setMemberSubmitLoading] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setProject(data.project);
        setUserRole(data.userProjectRole);
      } else {
        showToast(data.error || 'Failed to load project details.', 'error');
        onNavigateToDashboard();
      }
    } catch (err) {
      console.error(err);
      showToast('Network error loading project.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, token]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      setTaskSubmitLoading(true);
      
      const payload = {
        projectId,
        title: taskTitle,
        description: taskDesc,
        assignedToId: taskAssignee ? parseInt(taskAssignee) : null,
        dueDate: taskDueDate || null,
        priority: taskPriority,
        status: taskStatus
      };

      let response, data;
      if (selectedTask) {
        // Edit Task
        response = await fetch(`/api/tasks/${selectedTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create Task
        response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Task saved successfully!', 'success');
        closeTaskModal();
        fetchProjectDetails();
      } else {
        showToast(data.error || 'Failed to save task.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error saving task.', 'error');
    } finally {
      setTaskSubmitLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Task deleted!', 'success');
        closeTaskModal();
        fetchProjectDetails();
      } else {
        showToast(data.error || 'Failed to delete task.', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Status updated!', 'success');
        // Instantly patch locally to feel ultra fast
        setProject(prev => {
          const updatedTasks = prev.Tasks.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
          );
          return { ...prev, Tasks: updatedTasks };
        });
      } else {
        showToast(data.error || 'Failed to update status.', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    try {
      setMemberSubmitLoading(true);
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: memberEmail, role: memberRole })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Member added!', 'success');
        setMemberEmail('');
        fetchProjectDetails();
      } else {
        showToast(data.error || 'Failed to invite user.', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMemberSubmitLoading(false);
    }
  };

  const handleUpdateMemberRole = async (userId, targetRole) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, role: targetRole })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Role updated!', 'success');
        fetchProjectDetails();
      } else {
        showToast(data.error || 'Failed to update role.', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member? This will clear their active task assignments in this project.')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Member removed!', 'success');
        fetchProjectDetails();
      } else {
        showToast(data.error || 'Failed to remove member.', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Project deleted!', 'success');
        onDeleteSuccess();
      } else {
        showToast(data.error || 'Failed to delete project.', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openTaskModal = (task = null) => {
    if (task) {
      setSelectedTask(task);
      setTaskTitle(task.title);
      setTaskDesc(task.description || '');
      setTaskAssignee(task.assignedToId ? task.assignedToId.toString() : '');
      setTaskDueDate(task.dueDate || '');
      setTaskPriority(task.priority);
      setTaskStatus(task.status);
    } else {
      setSelectedTask(null);
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignee('');
      setTaskDueDate('');
      setTaskPriority('Medium');
      setTaskStatus('Todo');
    }
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justify: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '3px solid var(--glass-border)',
          borderTopColor: 'var(--accent-purple)',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!project) return <div>Project not found.</div>;

  const isProjectAdmin = userRole === 'Project Admin' || user.role === 'Admin';
  
  // Separate tasks into columns
  const todoTasks = project.Tasks ? project.Tasks.filter(t => t.status === 'Todo') : [];
  const progressTasks = project.Tasks ? project.Tasks.filter(t => t.status === 'In Progress') : [];
  const completedTasks = project.Tasks ? project.Tasks.filter(t => t.status === 'Completed') : [];

  const getAvatarUrl = (name) => {
    const cleanName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${cleanName}&background=8a2be2&color=fff&size=64&bold=true`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Top Header Card */}
      <div className="glass-panel" style={{ padding: '30px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-progress" style={{ fontSize: '0.7rem' }}>PROJECT WORKSPACE</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{project.name}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '800px', fontSize: '0.95rem' }}>
              {project.description || 'No project description supplied.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowMemberModal(true)} className="btn btn-secondary">
              <Users size={16} />
              <span>Team ({project.Users?.length || 0})</span>
            </button>

            {isProjectAdmin && (
              <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger btn-icon" title="Delete Project">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Kanban Pipeline</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Update task statuses interactively</p>
        </div>
        
        <button onClick={() => openTaskModal()} className="btn btn-cyan">
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="kanban-container">
        
        {/* Column 1: TODO */}
        <div className="glass-panel kanban-column" style={{ borderTop: '4px solid var(--accent-orange)' }}>
          <div className="kanban-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-orange)' }}></span>
              <span>Backlog / Todo</span>
            </span>
            <span className="badge badge-todo">{todoTasks.length}</span>
          </div>

          <div className="kanban-card-list">
            {todoTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No pending backlog tasks.
              </div>
            ) : (
              todoTasks.map(t => (
                <div key={t.id} className="glass-panel animate-fade-in" style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer'
                }} onClick={() => openTaskModal(t)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span className={`badge badge-${t.priority.toLowerCase()}`} style={{ fontSize: '0.6rem' }}>
                      {t.priority}
                    </span>
                    
                    {/* Quick Move Right */}
                    <button onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateTaskStatus(t.id, 'In Progress');
                    }} className="btn btn-secondary btn-icon" style={{ width: '24px', height: '24px' }}>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>{t.title}</h4>
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '14px'
                  }}>{t.description || 'No description.'}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <Calendar size={12} />
                      <span style={{ fontSize: '0.75rem' }}>{t.dueDate || 'No Target'}</span>
                    </div>

                    {t.assignee ? (
                      <img
                        src={getAvatarUrl(t.assignee.name)}
                        alt={t.assignee.name}
                        title={`Assigned to: ${t.assignee.name}`}
                        style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unassigned</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="glass-panel kanban-column" style={{ borderTop: '4px solid var(--accent-cyan)' }}>
          <div className="kanban-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }}></span>
              <span>Active Sprint</span>
            </span>
            <span className="badge badge-progress">{progressTasks.length}</span>
          </div>

          <div className="kanban-card-list">
            {progressTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active task executions.
              </div>
            ) : (
              progressTasks.map(t => (
                <div key={t.id} className="glass-panel animate-fade-in" style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer'
                }} onClick={() => openTaskModal(t)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className={`badge badge-${t.priority.toLowerCase()}`} style={{ fontSize: '0.6rem' }}>
                      {t.priority}
                    </span>
                    
                    {/* Action toggles */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateTaskStatus(t.id, 'Todo');
                      }} className="btn btn-secondary btn-icon" style={{ width: '24px', height: '24px' }}>
                        <ArrowLeft size={12} />
                      </button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateTaskStatus(t.id, 'Completed');
                      }} className="btn btn-secondary btn-icon" style={{ width: '24px', height: '24px' }}>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>{t.title}</h4>
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '14px'
                  }}>{t.description || 'No description.'}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <Calendar size={12} />
                      <span style={{ fontSize: '0.75rem' }}>{t.dueDate || 'No Target'}</span>
                    </div>

                    {t.assignee ? (
                      <img
                        src={getAvatarUrl(t.assignee.name)}
                        alt={t.assignee.name}
                        title={`Assigned to: ${t.assignee.name}`}
                        style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unassigned</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: COMPLETED */}
        <div className="glass-panel kanban-column" style={{ borderTop: '4px solid var(--accent-green)' }}>
          <div className="kanban-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }}></span>
              <span>Released / Done</span>
            </span>
            <span className="badge badge-completed">{completedTasks.length}</span>
          </div>

          <div className="kanban-card-list">
            {completedTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No completed deliverables.
              </div>
            ) : (
              completedTasks.map(t => (
                <div key={t.id} className="glass-panel animate-fade-in" style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  opacity: 0.8
                }} onClick={() => openTaskModal(t)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="badge badge-completed" style={{ fontSize: '0.6rem' }}>
                      COMPLETED
                    </span>
                    
                    {/* Quick Move Left */}
                    <button onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateTaskStatus(t.id, 'In Progress');
                    }} className="btn btn-secondary btn-icon" style={{ width: '24px', height: '24px' }}>
                      <ArrowLeft size={12} />
                    </button>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                    {t.title}
                  </h4>
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '14px'
                  }}>{t.description || 'No description.'}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <CheckSquare size={12} color="var(--accent-green)" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>Completed</span>
                    </div>

                    {t.assignee ? (
                      <img
                        src={getAvatarUrl(t.assignee.name)}
                        alt={t.assignee.name}
                        title={`Assigned to: ${t.assignee.name}`}
                        style={{ width: '24px', height: '24px', borderRadius: '50%', filter: 'grayscale(40%)' }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unassigned</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MODAL: TASK CREATION/EDITING */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={closeTaskModal}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                {selectedTask ? 'Task Specifications' : 'Draft New Task'}
              </h3>
              
              {selectedTask && isProjectAdmin && (
                <button onClick={() => handleDeleteTask(selectedTask.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Summary</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Summarize the action item..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Task Details</label>
                <textarea
                  className="form-input"
                  placeholder="Provide explicit instructions or acceptance criteria..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-cols-3">
                <div className="form-group">
                  <label className="form-label">Task Assignee</label>
                  <select
                    className="form-input"
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                  >
                    <option value="">-- Unassigned --</option>
                    {project.Users?.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.ProjectMember?.role})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Milestone Deadline</label>
                  <input
                    type="date"
                    className="form-input"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-cols-3">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-input"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pipeline Status</label>
                  <select
                    className="form-input"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                  >
                    <option value="Todo">Backlog (Todo)</option>
                    <option value="In Progress">Active (In Progress)</option>
                    <option value="Completed">Released (Completed)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <button type="button" onClick={closeTaskModal} className="btn btn-secondary" style={{ flex: 1 }}>
                  Discard
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={taskSubmitLoading}>
                  {taskSubmitLoading ? 'Saving changes...' : selectedTask ? 'Update Specifications' : 'Commit Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TEAM MEMBERS MANAGEMENT */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users color="var(--accent-cyan)" />
              <span>Project Collaborators</span>
            </h3>

            {/* Invite Member Section (Project Admins Only) */}
            {isProjectAdmin && (
              <form onSubmit={handleAddMember} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '12px' }}>
                  Add Project Member
                </h4>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 2, marginBottom: 0, minWidth: '200px' }}>
                    <label className="form-label">User Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="teammate@company.com"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1, marginBottom: 0, minWidth: '130px' }}>
                    <label className="form-label">Project Role</label>
                    <select
                      className="form-input"
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                    >
                      <option value="Project Member">Member</option>
                      <option value="Project Admin">Admin</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-cyan" style={{ height: '45px' }} disabled={memberSubmitLoading}>
                    {memberSubmitLoading ? 'Adding...' : 'Invite'}
                  </button>
                </div>
              </form>
            )}

            {/* Members Directory */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              {project.Users?.map(u => {
                const selfId = user.id;
                const isSelf = u.id === selfId;
                const pRole = u.ProjectMember?.role;

                return (
                  <div key={u.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(7, 10, 19, 0.4)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={getAvatarUrl(u.name)} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt={u.name} />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          {u.name} {isSelf && <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>(You)</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Role control */}
                      {isProjectAdmin && !isSelf ? (
                        <select
                          className="form-input"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', width: '130px' }}
                          value={pRole}
                          onChange={(e) => handleUpdateMemberRole(u.id, e.target.value)}
                        >
                          <option value="Project Member">Project Member</option>
                          <option value="Project Admin">Project Admin</option>
                        </select>
                      ) : (
                        <span className={`badge ${pRole === 'Project Admin' ? 'badge-progress' : 'badge-todo'}`}>
                          {pRole}
                        </span>
                      )}

                      {/* Remove member button */}
                      {isProjectAdmin && !isSelf && (
                        <button
                          onClick={() => handleRemoveMember(u.id)}
                          className="btn btn-danger btn-icon"
                          style={{ width: '28px', height: '28px' }}
                          title="Remove from project"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" onClick={() => setShowMemberModal(false)} className="btn btn-secondary" style={{ width: '100%', marginTop: '20px' }}>
              Close Panel
            </button>
          </div>
        </div>
      )}

      {/* DOUBLE CONFIRM MODAL: PROJECT DELETION */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '450px', borderColor: 'rgba(239, 68, 68, 0.4)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--accent-red)',
                marginBottom: '14px'
              }}>
                <AlertCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Destructive Action Warning</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                You are about to delete <strong>{project.name}</strong>. This operation cannot be undone. All tasks, milestone structures, and member contexts will be wiped permanently.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                Abort
              </button>
              <button onClick={handleDeleteProject} className="btn btn-primary btn-danger" style={{ flex: 1.5 }}>
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectDetails;
