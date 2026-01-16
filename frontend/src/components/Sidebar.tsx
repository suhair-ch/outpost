import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, LogOut, Map, Store, Users, BarChart3, TrendingUp } from 'lucide-react';
import { Role } from '../types';
import { useState } from 'react';
import ProfileModal from './ProfileModal';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user?.role;

    // Define all menu items
    interface MenuItem {
        path: string;
        label: string;
        icon: any;
        roles: Role[];
    }

    const allMenuItems: MenuItem[] = [
        { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: [Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN] },
        { path: '/shop-dashboard', label: 'Shop Home', icon: LayoutDashboard, roles: [Role.SHOP] },
        { path: '/driver-dashboard', label: 'My Tasks', icon: LayoutDashboard, roles: [Role.DRIVER] },

        { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: [Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN] },
        { path: '/areas', label: 'Areas', icon: Map, roles: [Role.SUPER_ADMIN, Role.DISTRICT_ADMIN] },
        { path: '/shops', label: 'Shops', icon: Store, roles: [Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN] },
        { path: '/drivers', label: 'Drivers', icon: Users, roles: [Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN] },
        { path: '/routes', label: 'Routes', icon: Map, roles: [Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN] },
        { path: '/parcels', label: 'Parcels', icon: Package, roles: [Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN, Role.SHOP] },
        { path: '/settlements', label: 'Settlements', icon: BarChart3, roles: [Role.SUPER_ADMIN, Role.DISTRICT_ADMIN, Role.ADMIN, Role.SHOP] },
        { path: '/franchise-reports', label: 'Franchise Reports', icon: TrendingUp, roles: [Role.SUPER_ADMIN] },
    ];

    const menuItems = allMenuItems.filter(item => item.roles.includes(role as Role));

    return (
        <div style={{
            width: '280px',
            background: 'rgba(15, 23, 42, 0.6)', // Semi-transparent Slate
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1.5rem',
            position: 'sticky',
            top: 0,
            height: '100vh',
            boxSizing: 'border-box'
        }}>
            <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '0.5rem' }}>
                <div style={{
                    width: '42px', height: '42px',
                    background: 'var(--primary-gradient)',
                    borderRadius: '12px',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ width: '20px', height: '20px', border: '2px solid white', borderRadius: '50%' }}></div>
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-0.03em', background: 'linear-gradient(to right, white, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OUT POST</h2>
                    <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Logistics</p>
                </div>
            </div>

            {/* Added scroll to nav */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', paddingLeft: '1rem' }}>Menu</div>
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.85rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                textDecoration: 'none',
                                color: active ? 'white' : 'var(--text-dim)',
                                background: active ? 'var(--primary-gradient)' : 'transparent',
                                border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                                boxShadow: active ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
                                transition: 'all 0.2s',
                                fontWeight: active ? 600 : 500,
                                position: 'relative'
                            }}
                        >
                            <item.icon size={20} style={{ opacity: active ? 1 : 0.7 }} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                <div
                    onClick={() => setShowProfile(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem',
                        background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                    <div style={{ width: '36px', height: '36px', background: 'var(--bg-elevated)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {user?.mobile?.slice(-2) || 'U'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{user?.role || 'User'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user?.mobile}</div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>

            <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
        </div>
    );
};

export default Sidebar;
