import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, CheckCircle2, Clock, Flame, AlertCircle, Calendar, PlusCircle, ArrowRight } from 'lucide-react';

const Dashboard = ({ onNavigateToProject }) => {
  const { token, showToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (response.ok) {
        setData(resData);
      } else {
        showToast(resData.error || 'Failed to fetch summary data.', 'error');
      }
    } catch (error) {
      console.error('Fetch dashboard summary error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [token]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      setCreateLoading(true);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: projectName, description: projectDesc })
      });
      const resData = await response.json();
      if (response.ok) {
        showToast(resData.message || 'Project created!', 'success');
        setProjectName('');
        setProjectDesc('');
        // Refresh dashboard summary and open project
        fetchSummary();
        onNavigateToProject(resData.project.id);
      } else {
        showToast(resData.error || 'Failed to create project.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error creating project.', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '3px solid var(--glass-border)',
          borderTopColor: 'var(--accent-cyan)',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!data) return <div>Failed to load summary.</div>;

  const { projectCount, recentProjects, tasks } = data;
  const progressPercent = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0;

  // Custom SVG donut chart settings
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Welcome Title */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }} className="gradient-text-cyan">
          Dashboard Overview
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Real-time metrics, status breakdowns, and pending milestones
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        
        {/* Projects */}
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-10px',
            opacity: 0.05,
            color: 'var(--accent-cyan)'
          }}>
            <Briefcase size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: 'rgba(0, 242, 254, 0.1)',
              color: 'var(--accent-cyan)'
            }}>
              <Briefcase size={22} />
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Projects</span>
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{projectCount}</h3>
        </div>

        {/* Total Tasks */}
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-10px',
            opacity: 0.05,
            color: 'var(--accent-purple)'
          }}>
            <Clock size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: 'rgba(138, 43, 226, 0.1)',
              color: 'var(--accent-purple)'
            }}>
              <Clock size={22} />
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Assigned</span>
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{tasks.total}</h3>
        </div>

        {/* Completed Tasks */}
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-10px',
            opacity: 0.05,
            color: 'var(--accent-green)'
          }}>
            <CheckCircle2 size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--accent-green)'
            }}>
              <CheckCircle2 size={22} />
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Completed Tasks</span>
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-green)' }}>
            {tasks.completed}
          </h3>
        </div>

        {/* Overdue Count */}
        <div className="glass-panel" style={{
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          borderColor: tasks.overdueCount > 0 ? 'rgba(239, 68, 68, 0.25)' : 'var(--glass-border)'
        }}>
          <div style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-10px',
            opacity: 0.05,
            color: 'var(--accent-red)'
          }}>
            <Flame size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: tasks.overdueCount > 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              color: tasks.overdueCount > 0 ? '#ef4444' : 'var(--text-muted)'
            }}>
              <Flame size={22} />
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Overdue Tasks</span>
          </div>
          <h3 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: tasks.overdueCount > 0 ? '#ef4444' : 'var(--text-primary)'
          }}>
            {tasks.overdueCount}
          </h3>
        </div>

      </div>

      {/* Main Core Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }} className="grid-cols-3">
        
        {/* Left Side: Overdue & Upcoming Deliverables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Overdue Warning Block */}
          {tasks.overdueCount > 0 && (
            <div className="glass-panel" style={{
              padding: '20px',
              borderLeft: '4px solid var(--accent-red)',
              background: 'rgba(239, 68, 68, 0.04)'
            }}>
              <div style={{ display: 'flex', gap: '14px' }}>
                <AlertCircle color="#ef4444" size={24} style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: '#fca5a5', fontSize: '1rem', fontWeight: 600 }}>Action Required: Overdue Deliverables</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', marginBottom: '14px' }}>
                    You have {tasks.overdueCount} tasks past their scheduled completion milestones. Update their status or adjust their targets immediately.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tasks.overdueList.map(t => (
                      <div key={t.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(7, 10, 19, 0.5)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderRadius: '6px'
                      }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.Project?.name}</span>
                          <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>{t.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Milestones */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={20} color="var(--accent-cyan)" />
              <span>Upcoming Milestones</span>
            </h3>

            {tasks.upcomingList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                No active upcoming milestones scheduled.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {tasks.upcomingList.map(t => (
                  <div key={t.id} className="glass-panel" style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(255,255,255,0.01)'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.title}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.Project?.name}</span>
                        <span style={{
                          display: 'inline-block',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--glass-border-hover)'
                        }}></span>
                        <span className={`badge badge-${t.priority.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                          {t.priority}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Date</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{t.dueDate}</div>
                      </div>
                      <button
                        onClick={() => onNavigateToProject(t.projectId)}
                        className="btn btn-secondary btn-icon"
                        title="View Project"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Create Project */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PlusCircle size={20} color="var(--accent-purple)" />
              <span>Launch New Project</span>
            </h3>

            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mobile Application V2"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-input"
                  placeholder="Summarize the core objectives..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={createLoading}>
                {createLoading ? 'Provisioning Assets...' : 'Initialize Workspace'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Performance Gauges & Project Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Progress Donut */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', textAlign: 'left' }}>Work Completion Progress</h3>
            
            <div style={{ position: 'relative', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', margin: '15px 0' }}>
              <svg width="150" height="150" viewBox="0 0 150 150">
                {/* Background Ring */}
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="var(--glass-border)"
                  strokeWidth="10"
                />
                {/* Active Ring */}
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="url(#cyanPurpleGradient)"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 75 75)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
                {/* Define gradient colors */}
                <defs>
                  <linearGradient id="cyanPurpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" />
                    <stop offset="100%" stopColor="var(--accent-purple)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central Text */}
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  {progressPercent}%
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Finished
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Tasks</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{tasks.total}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-green)' }}>{tasks.completed}</div>
              </div>
            </div>
          </div>

          {/* Active Projects Directory */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>My Active Workspaces</h3>
            
            {recentProjects.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                You have not joined any workspaces yet. Launch one above!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentProjects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onNavigateToProject(p.id)}
                    className="glass-panel glass-panel-interactive"
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      background: 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-cyan)'
                      }}></span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{p.name}</span>
                    </div>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
