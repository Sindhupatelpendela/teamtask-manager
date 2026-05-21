import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import { 
  LayoutDashboard, FolderPlus, LogOut, ChevronRight, Menu, X, 
  Layers, User as UserIcon, ShieldAlert, Sparkles 
} from 'lucide-react';

const WorkspaceLayout = () => {
  const { user, token, logout, showToast } = useAuth();
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'project'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Create Project quick state
  const [showQuickProject, setShowQuickProject] = useState(false);
  const [qpName, setQpName] = useState('');
  const [qpDesc, setQpDesc] = useState('');
  const [qpLoading, setQpLoading] = useState(false);

  const fetchSidebarProjects = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to load sidebar projects:', err);
    }
  };

  useEffect(() => {
    fetchSidebarProjects();
  }, [token, activeView]);

  const handleNavigateToProject = (projId) => {
    setSelectedProjectId(projId);
    setActiveView('project');
    setSidebarOpen(false);
  };

  const handleNavigateToDashboard = () => {
    setActiveView('dashboard');
    setSelectedProjectId(null);
    setSidebarOpen(false);
  };

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!qpName.trim()) return;

    try {
      setQpLoading(true);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: qpName, description: qpDesc })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Project created!', 'success');
        setQpName('');
        setQpDesc('');
        setShowQuickProject(false);
        // Refresh sidebar and open new project
        await fetchSidebarProjects();
        handleNavigateToProject(data.project.id);
      } else {
        showToast(data.error || 'Failed to create project.', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQpLoading(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US';
  };

  return (
    <div className="dashboard-layout">
      
      {/* Mobile Top Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 100
      }} className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={22} color="var(--accent-cyan)" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem' }}>TeamTask</span>
        </div>
        
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <style>{`
        @media (max-width: 991px) {
          .mobile-header { display: flex !important; }
          .sidebar-container { 
            transform: translateX(${sidebarOpen ? '0' : '-100%'}); 
            z-index: 99;
            box-shadow: 5px 0 25px rgba(0,0,0,0.5);
          }
        }
      `}</style>

      {/* Glass Sidebar */}
      <aside className="sidebar-container" style={{
        width: '650px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--glass-border)',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '36px 30px',
        justifyContent: 'space-between',
        transition: 'var(--transition-smooth)'
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '35px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          
          {/* Logo / Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '96px',
              height: '96px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
              boxShadow: '0 6px 20px rgba(0, 242, 254, 0.3)',
              flexShrink: 0
            }}>
              <Layers size={52} color="#070a13" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: '4.0rem', fontWeight: 950, fontFamily: 'var(--font-display)', lineHeight: '1.05', color: '#ffffff' }}>TeamTask</h1>
              <span style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 900 }}>COLLABORATION</span>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="glass-panel" style={{
            padding: '24px 30px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.04)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '2.2rem',
              flexShrink: 0
            }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: '#ffffff' }}>{user?.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <span className={`badge ${user?.role === 'Admin' ? 'badge-progress' : 'badge-todo'}`} style={{ fontSize: '1.4rem', padding: '6px 16px', fontWeight: 800 }}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleNavigateToDashboard}
              className={`btn ${activeView === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '24px 30px', fontSize: '2.2rem', fontWeight: 800 }}
            >
              <LayoutDashboard size={36} />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Projects Directory in Sidebar */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 8px',
              marginBottom: '16px'
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>My Workspaces</span>
              
              <button 
                onClick={() => setShowQuickProject(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px'
                }}
                title="Create project"
              >
                <FolderPlus size={32} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projects.length === 0 ? (
                <div style={{ padding: '12px 8px', fontSize: '1.5rem', color: 'var(--text-muted)' }}>
                  No workspaces joined.
                </div>
              ) : (
                projects.map(p => {
                  const isActive = activeView === 'project' && selectedProjectId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleNavigateToProject(p.id)}
                      className="glass-panel"
                      style={{
                        padding: '24px 30px',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '2.1rem',
                        fontWeight: isActive ? 900 : 700,
                        border: isActive ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                        background: isActive ? 'rgba(0, 242, 254, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'var(--transition-smooth)',
                        marginTop: '12px'
                      }}
                    >
                      <span style={{ 
                        textOverflow: 'ellipsis', 
                        overflow: 'hidden', 
                        whiteSpace: 'normal', 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                        lineHeight: '1.3',
                        flex: 1,
                        marginRight: '8px',
                        color: '#ffffff'
                      }}>
                        {p.name}
                      </span>
                      {isActive && <ChevronRight size={28} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Footer */}
        <button
          onClick={logout}
          className="btn btn-danger"
          style={{ width: '100%', justifyContent: 'flex-start', padding: '24px 30px', fontSize: '2.1rem', fontWeight: 800, border: '1px solid transparent' }}
        >
          <LogOut size={30} />
          <span>Exit Workspace</span>
        </button>

      </aside>

      {/* Main Workspace Frame */}
      <main className="main-content">
        {activeView === 'dashboard' ? (
          <Dashboard onNavigateToProject={handleNavigateToProject} />
        ) : (
          <ProjectDetails 
            projectId={selectedProjectId} 
            onNavigateToDashboard={handleNavigateToDashboard}
            onDeleteSuccess={() => {
              handleNavigateToDashboard();
              fetchSidebarProjects();
            }}
          />
        )}
      </main>

      {/* QUICK CREATE PROJECT SIDEBAR MODAL */}
      {showQuickProject && (
        <div className="modal-overlay" onClick={() => setShowQuickProject(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Provision New Project</h3>
            
            <form onSubmit={handleQuickCreate}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sales Redesign sprint"
                  value={qpName}
                  onChange={(e) => setQpName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-input"
                  placeholder="Goals and delivery specifications..."
                  value={qpDesc}
                  onChange={(e) => setQpDesc(e.target.value)}
                  style={{ minHeight: '80px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowQuickProject(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Discard
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }} disabled={qpLoading}>
                  {qpLoading ? 'Processing...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const AuthGate = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState('login'); // 'login' or 'register'

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#070a13'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.05)',
          borderTopColor: '#00f2fe',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <WorkspaceLayout />;
  }

  return authScreen === 'login' ? (
    <Login onNavigateToRegister={() => setAuthScreen('register')} />
  ) : (
    <Register onNavigateToLogin={() => setAuthScreen('login')} />
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
};

export default App;
