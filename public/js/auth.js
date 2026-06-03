const API = '';

function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    const id = 'toast_' + Date.now();
    container.innerHTML += `
        <div id="${id}" class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0 show mb-2" role="alert">
            <div class="d-flex">
                <div class="toast-body">${msg}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="document.getElementById('${id}').remove()"></button>
            </div>
        </div>`;
    setTimeout(() => { const el = document.getElementById(id); if(el) el.remove(); }, 4000);
}

async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const role = form.role.value;
    const body = {
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
        role,
        company_name: role === 'company' ? form.company_name?.value : undefined
    };
    try {
        const res = await fetch(`${API}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok) {
            showToast(data.message);
            setTimeout(() => window.location.href = '/login', 1500);
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Network error. Please try again.', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    try {
        const res = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email.value, password: form.password.value })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('Login successful! Redirecting...');
            setTimeout(() => {
                const role = data.user.role;
                if (role === 'student') window.location.href = '/student/dashboard';
                else if (role === 'company') window.location.href = '/company/dashboard';
                else window.location.href = '/admin/dashboard';
            }, 1000);
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Network error. Please try again.', 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
}

function requireAuth(expectedRole) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || !localStorage.getItem('token')) {
        window.location.href = '/login';
        return null;
    }
    if (expectedRole && user.role !== expectedRole) {
        window.location.href = '/login';
        return null;
    }
    return user;
}
