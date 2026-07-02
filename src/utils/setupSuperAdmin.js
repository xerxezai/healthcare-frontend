// Emergency Super Admin Login Script
// Run this in browser console to log in and set up super admin access
import apiClient from '../services/api';

const emergencyLogin = async () => {
    try {
        console.log('🚀 Starting emergency super admin login...');

        const loginData = {
            email: 'mastermind@xerxez.in',
            password: 'password123'
        };

        console.log('📡 Attempting login with backend...');

        // Try to login with the backend
        const loginResponse = await apiClient.post('/api/auth/login/', loginData);

        const loginResult = loginResponse.data;
        console.log('✅ Login response:', loginResult);
        
        if (loginResult.success) {
            console.log('✅ Backend login successful!');
            
            // Store user data in localStorage
            const userData = loginResult.user || loginResult;
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('superAdminDetected', 'true');
            
            console.log('✅ User data stored in localStorage:', userData);
            console.log('🔄 Refreshing page...');
            
            // Refresh the page
            window.location.reload();
            
        } else {
            console.error('❌ Backend login failed:', loginResult.error);
            console.log('🔄 Attempting frontend-only setup as fallback...');
            
            // Fallback to frontend-only setup
            setupSuperAdminFrontendOnly();
        }
        
    } catch (error) {
        console.error('❌ Emergency login failed:', error);
        console.log('🔄 Attempting frontend-only setup as fallback...');
        
        // Fallback to frontend-only setup
        setupSuperAdminFrontendOnly();
    }
};

const setupSuperAdminFrontendOnly = () => {
    console.log('⚠️ Setting up frontend-only super admin access...');
    
    const superAdminUser = {
        id: 1,
        email: 'mastermind@xerxez.in',
        username: 'mastermind@xerxez.in', 
        full_name: 'Super Administrator',
        role: 'super_admin',
        is_super_admin: true,
        is_superuser: true,
        is_staff: true,
        is_active: true,
        is_verified: true,
        subscription_bypass: true,
        permissions: {
            can_manage_users: true,
            can_view_reports: true,
            can_manage_departments: true,
            can_access_billing: true,
            can_manage_inventory: true,
            can_access_emergency: true,
            can_create_admins: true,
            can_manage_system_settings: true,
            can_access_all_features: true
        }
    };

    // Generate tokens
    const token = 'super-admin-access-token-' + Date.now();

    // Clear any existing data
    localStorage.clear();
    sessionStorage.clear();

    // Set up all necessary storage items
    localStorage.setItem('user', JSON.stringify(superAdminUser));
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', 'super-admin-refresh-token-' + Date.now());
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('superAdminDetected', 'true');
    
    console.log('⚠️ Frontend-only super admin setup complete!');
    console.log('User data:', superAdminUser);
    console.log('Note: Backend authentication may still be required for some operations.');
    console.log('🔄 Refreshing page...');
    
    // Automatically refresh the page
    window.location.reload();
};

// Quick access functions
window.emergencyLogin = emergencyLogin;
window.setupSuperAdminFrontendOnly = setupSuperAdminFrontendOnly;

console.log('🔧 Emergency login functions loaded!');
console.log('Run: emergencyLogin() - for full backend + frontend login');
console.log('Run: setupSuperAdminFrontendOnly() - for frontend-only setup');

// Auto-run the emergency login
emergencyLogin();
