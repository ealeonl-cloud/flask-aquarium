// ===== CONFIG =====
const AVATAR_URL = 'https://mgx-backend-cdn.metadl.com/generate/images/1072739/2026-03-30/c4786dd6-5a9f-427d-bcc8-577e20f64237.png';

let users = [];
let chats = [];


function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('pageTitle');

    const titles = {
        dashboard: 'Dashboard',
        users: 'Gestión de Usuarios',
        chats: 'Monitoreo de Chats'
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const section = item.dataset.section;

            // activar menú
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // cambiar sección
            document.querySelectorAll('.content-section').forEach(sec => {
                sec.classList.remove('active');
            });

            const target = document.getElementById(`section-${section}`);
            if (target) target.classList.add('active');

            // cambiar título
            if (pageTitle) pageTitle.textContent = titles[section];
        });
    });
}

// ===== API =====
async function fetchUsers() {
    try {
        const res = await fetch('/admin/api/usuarios');
        if (!res.ok) throw new Error(res.status);

        users = await res.json();
        console.log("USERS:", users);

    } catch (err) {
        console.error("Error usuarios:", err);
        users = [];
    }
}

async function fetchChats() {
    try {
        const res = await fetch('/admin/api/chats');
        if (!res.ok) throw new Error(res.status);

        chats = await res.json();
        console.log("CHATS:", chats);

    } catch (err) {
        console.error("Error chats:", err);
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
const dashboardChart = document.getElementById('dashboardChart');
const chatsRankingList = document.getElementById('chatsRankingList');

const modalCreateUser = document.getElementById('modalCreateUser');
const modalEditUser = document.getElementById('modalEditUser');
const modalDeleteUser = document.getElementById('modalDeleteUser');
const modalLogout = document.getElementById('modalLogout');

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {

    await fetchUsers();
    await fetchChats();

    renderAll();
    initModals();
});

// ===== RENDER GLOBAL =====
function renderAll() {
    updateStats();
    renderUsersTable();
    renderChatsChart(chatsBarChart);
    renderChatsChart(dashboardChart);
    renderChatsRanking();
}

// ===== STATS =====
function updateStats() {
    statTotalUsers.textContent = users.length;
    statTotalAdmins.textContent = users.filter(u => u.role === 'admin').length;
    statTotalChats.textContent = chats.length;
    statTodayInteractions.textContent = chats.reduce((sum, c) => sum + c.interactions, 0);
}

// ===== USERS =====
function renderUsersTable() {
    if (!users.length) {
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
            <td><span class="badge badge-admin">Admin</span></td>
            <td>${user.createdAt || '-'}</td>
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

    const name = inputUserName.value;
    const email = inputUserEmail.value;
    const password = inputUserPassword.value;

    await fetch('/admin/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });

    await reloadUsers();
    closeModal(modalCreateUser);
}

async function handleEditUser(e) {
    e.preventDefault();

    const id = editUserId.value;
    const name = inputEditName.value;

    await fetch(`/admin/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    await reloadUsers();
    closeModal(modalEditUser);
}

async function handleDeleteUser() {
    const id = deleteUserId.value;

    await fetch(`/admin/api/usuarios/${id}`, {
        method: 'DELETE'
    });

    await reloadUsers();
    closeModal(modalDeleteUser);
}

async function reloadUsers() {
    await fetchUsers();
    renderAll();
}

// ===== CHATS =====
function renderChatsChart(container) {
    if (!chats.length) return;

    const sorted = [...chats].sort((a, b) => b.interactions - a.interactions);
    const max = Math.max(...sorted.map(c => c.interactions));

    container.innerHTML = sorted.map(c => {
        const height = (c.interactions / max) * 200;

        return `
            <div style="display:inline-block;margin:8px;text-align:center;">
                <div style="background:#6366f1;height:${height}px;width:25px;border-radius:4px;"></div>
                <small>${c.name}</small>
            </div>
        `;
    }).join('');
}

function renderChatsRanking() {
    const sorted = [...chats].sort((a, b) => b.interactions - a.interactions);

    chatsRankingList.innerHTML = sorted.map(c => `
        <div>${c.name} - ${c.interactions}</div>
    `).join('');
}

// ===== MODALS =====
function initModals() {
    formCreateUser.addEventListener('submit', handleCreateUser);
    formEditUser.addEventListener('submit', handleEditUser);
    btnConfirmDelete.addEventListener('click', handleDeleteUser);

    btnLogout.addEventListener('click', () => openModal(modalLogout));
    btnConfirmLogout.addEventListener('click', () => {
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
    editUserId.value = id;
    openModal(modalEditUser);
};

window.openDeleteModal = function (id) {
    deleteUserId.value = id;
    openModal(modalDeleteUser);
};
