// ===== CONFIG =====
const AVATAR_URL = 'https://mgx-backend-cdn.metadl.com/generate/images/1072739/2026-03-30/c4786dd6-5a9f-427d-bcc8-577e20f64237.png';

let users = [];
let chats = [];

// ===== API =====
async function fetchUsers() {
    try {
        const res = await fetch('/admin/api/usuarios');

        if (!res.ok) {
            console.error('Error backend usuarios:', res.status);
            users = [];
            return;
        }

        const data = await res.json();
        console.log('USUARIOS:', data);

        users = data;

    } catch (error) {
        console.error('Error cargando usuarios:', error);
        users = [];
    }
}

async function fetchChats() {
    try {
        const res = await fetch('/admin/api/chats');

        if (!res.ok) {
            console.error('Error backend chats:', res.status);
            chats = [];
            return;
        }

        const data = await res.json();
        console.log('CHATS:', data);

        chats = data;

    } catch (error) {
        console.error('Error cargando chats:', error);
        chats = [];
    }
}

// ===== DOM =====
const statTotalUsers = document.getElementById('statTotalUsers');
const statTotalAdmins = document.getElementById('statTotalAdmins');
const statTotalChats = document.getElementById('statTotalChats');
const statTodayInteractions = document.getElementById('statTodayInteractions');

const usersTableBody = document.getElementById('usersTableBody');
const usersEmptyState = document.getElementById('usersEmptyState');
const usersTable = document.getElementById('usersTable');

const chatsBarChart = document.getElementById('chatsBarChart');
const chatsRankingList = document.getElementById('chatsRankingList');

const modalCreateUser = document.getElementById('modalCreateUser');
const modalEditUser = document.getElementById('modalEditUser');
const modalDeleteUser = document.getElementById('modalDeleteUser');
const modalLogout = document.getElementById('modalLogout');

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function () {

    await fetchUsers();
    await fetchChats();

    updateStats();
    renderUsersTable();
    renderChatsChart();
    renderChatsRanking();
    initModals();
});

// ===== STATS =====
function updateStats() {
    const totalUsers = users.length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const totalChats = chats.length;
    const todayInteractions = chats.reduce((sum, c) => sum + c.interactions, 0);

    statTotalUsers.textContent = totalUsers;
    statTotalAdmins.textContent = totalAdmins;
    statTotalChats.textContent = totalChats;
    statTodayInteractions.textContent = todayInteractions;
}

// ===== USERS =====
function renderUsersTable() {
    if (!users || users.length === 0) {
        usersTable.style.display = 'none';
        usersEmptyState.style.display = 'flex';
        return;
    }

    usersTable.style.display = 'table';
    usersEmptyState.style.display = 'none';

    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td><img src="${AVATAR_URL}" class="user-avatar-sm"></td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">
                    ${user.role === 'admin' ? 'Admin' : 'Usuario'}
                </span>
            </td>
            <td>${user.createdAt || '—'}</td>
            <td><span class="badge badge-active">Activo</span></td>
            <td>
                <button onclick="openEditModal('${user.id}')">Editar</button>
                <button onclick="openDeleteModal('${user.id}')">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// ===== CRUD =====
async function handleCreateUser(e) {
    e.preventDefault();

    const name = document.getElementById('inputUserName').value;
    const email = document.getElementById('inputUserEmail').value;
    const password = document.getElementById('inputUserPassword').value;

    await fetch('/admin/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });

    await fetchUsers();
    refreshAll();
    closeModal(modalCreateUser);
}

async function handleEditUser(e) {
    e.preventDefault();

    const id = document.getElementById('editUserId').value;
    const name = document.getElementById('inputEditName').value;

    await fetch(`/admin/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    await fetchUsers();
    refreshAll();
    closeModal(modalEditUser);
}

async function handleDeleteUser() {
    const id = document.getElementById('deleteUserId').value;

    await fetch(`/admin/api/usuarios/${id}`, {
        method: 'DELETE'
    });

    await fetchUsers();
    refreshAll();
    closeModal(modalDeleteUser);
}

// ===== CHATS =====
function renderChatsChart() {
    if (!chats || chats.length === 0) return;

    chatsBarChart.innerHTML = chats.map(c => `
        <div style="margin:5px">
            <div style="background:#6366f1;height:${c.interactions}px;width:20px"></div>
            <small>${c.name}</small>
        </div>
    `).join('');
}

function renderChatsRanking() {
    chatsRankingList.innerHTML = chats.map(c => `
        <div>${c.name} - ${c.interactions}</div>
    `).join('');
}

// ===== MODALS =====
function initModals() {
    document.getElementById('formCreateUser').addEventListener('submit', handleCreateUser);
    document.getElementById('formEditUser').addEventListener('submit', handleEditUser);
    document.getElementById('btnConfirmDelete').addEventListener('click', handleDeleteUser);

    document.getElementById('btnLogout').addEventListener('click', () => openModal(modalLogout));
    document.getElementById('btnConfirmLogout').addEventListener('click', () => {
        window.location.href = "/logout";
    });
}

function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

window.openEditModal = function (id) {
    document.getElementById('editUserId').value = id;
    openModal(modalEditUser);
};

window.openDeleteModal = function (id) {
    document.getElementById('deleteUserId').value = id;
    openModal(modalDeleteUser);
};

// ===== UTILS =====
function refreshAll() {
    updateStats();
    renderUsersTable();
    renderChatsChart();
    renderChatsRanking();
}
