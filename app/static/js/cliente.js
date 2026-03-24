// ==================== STATE ====================
let currentChatUser = null;
let pollingInterval = null;
let lastMessageCount = 0;
let isLoadingMessages = false;

// ==================== UTILIDADES ====================

/**
 * Obtiene las iniciales de un nombre (maximo 2 caracteres).
 */
function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
}

/**
 * Genera un color de fondo consistente basado en el nombre del usuario.
 */
function getAvatarColor(name) {
    const colors = [
        "linear-gradient(135deg, #00AEEF, #0090C9)",
        "linear-gradient(135deg, #6366F1, #4F46E5)",
        "linear-gradient(135deg, #10B981, #059669)",
        "linear-gradient(135deg, #F59E0B, #D97706)",
        "linear-gradient(135deg, #EF4444, #DC2626)",
        "linear-gradient(135deg, #8B5CF6, #7C3AED)",
        "linear-gradient(135deg, #EC4899, #DB2777)",
        "linear-gradient(135deg, #14B8A6, #0D9488)"
    ];
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

/**
 * Formatea la hora de un timestamp de forma legible.
 */
function formatTime(timestamp) {
    try {
        var date = new Date(timestamp);
        if (isNaN(date.getTime())) return "";

        var now = new Date();
        var isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        var yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        var isYesterday =
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();

        var timeStr = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        if (isToday) return timeStr;
        if (isYesterday) return "Ayer " + timeStr;
        return date.toLocaleDateString([], {
            day: "2-digit",
            month: "short"
        }) + " " + timeStr;
    } catch (e) {
        return "";
    }
}

/**
 * Formatea la fecha para el separador de dias.
 */
function formatDateDivider(timestamp) {
    try {
        var date = new Date(timestamp);
        if (isNaN(date.getTime())) return null;

        var now = new Date();
        var isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (isToday) return "Hoy";

        var yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        var isYesterday =
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();

        if (isYesterday) return "Ayer";

        return date.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });
    } catch (e) {
        return null;
    }
}

/**
 * Escapa caracteres HTML para prevenir XSS.
 */
function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Muestra un estado vacio dentro de un contenedor.
 */
function showEmptyState(container, icon, title, subtitle) {
    container.innerHTML =
        '<div class="empty-state">' +
            '<div class="empty-state-icon">' + icon + '</div>' +
            '<h3>' + title + '</h3>' +
            '<p>' + subtitle + '</p>' +
        '</div>';
}

/**
 * Realiza un fetch con manejo de errores.
 */
async function safeFetch(url, options) {
    try {
        var res = await fetch(url, options);
        if (!res.ok) {
            console.error("Error en " + url + ": " + res.status + " " + res.statusText);
            return null;
        }
        return await res.json();
    } catch (err) {
        console.error("Error de red en " + url + ":", err);
        return null;
    }
}

// ==================== CARGAR USUARIOS (TARJETAS) ====================
async function cargarUsuarios() {
    var lista = document.getElementById("lista-usuarios");

    // Mostrar skeleton cards mientras carga
    lista.innerHTML = "";
    for (var s = 0; s < 4; s++) {
        var skel = document.createElement("div");
        skel.className = "skeleton-card";
        skel.innerHTML =
            '<div class="skeleton" style="width:72px;height:72px;border-radius:50%;margin:0 auto 16px;"></div>' +
            '<div class="skeleton" style="width:60%;height:16px;margin:0 auto 8px;"></div>' +
            '<div class="skeleton" style="width:40%;height:12px;margin:0 auto 18px;"></div>' +
            '<div class="skeleton" style="width:50%;height:36px;border-radius:9999px;margin:0 auto;"></div>';
        lista.appendChild(skel);
    }

    var data = await safeFetch("/get_users");

    if (!data || data.length === 0) {
        showEmptyState(
            lista,
            '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5">' +
                '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>' +
                '<circle cx="9" cy="7" r="4"/>' +
                '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>' +
                '<path d="M16 3.13a4 4 0 0 1 0 7.75"/>' +
            '</svg>',
            "No hay usuarios disponibles",
            "Los usuarios apareceran aqui cuando esten conectados"
        );
        return;
    }

    lista.innerHTML = "";

    data.forEach(function(user, index) {
        var card = document.createElement("div");
        card.className = "usuario-card";
        card.style.animationDelay = (index * 0.08) + "s";

        var initials = getInitials(user.nombre);
        var avatarColor = getAvatarColor(user.nombre);

        card.innerHTML =
            '<div class="card-avatar" style="background:' + avatarColor + ';">' +
                initials +
            '</div>' +
            '<div class="card-name">' + escapeHtml(user.nombre) + '</div>' +
            '<button class="card-btn">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
                '</svg>' +
                'Iniciar Chat' +
            '</button>';

        card.onclick = function() {
            abrirChat(user);
        };

        lista.appendChild(card);
    });
}

// ==================== ABRIR CHAT ====================
function abrirChat(user) {
    currentChatUser = user;
    lastMessageCount = 0;

    document.getElementById("chat-title").textContent = user.nombre;

    var container = document.getElementById("chat-messages");
    container.innerHTML =
        '<div class="loading-messages">' +
            '<div class="typing-indicator">' +
                '<span></span><span></span><span></span>' +
            '</div>' +
            '<p style="color:#94A3B8;font-size:0.85rem;margin-top:8px;">Cargando mensajes...</p>' +
        '</div>';

    document.getElementById("app-convenios").classList.remove("active");
    document.getElementById("app-chat").classList.add("active");

    cargarMensajes();
    startPolling();

    setTimeout(function() {
        document.getElementById("chat-input").focus();
    }, 300);
}

// ==================== CERRAR CHAT ====================
function closeChat() {
    currentChatUser = null;
    lastMessageCount = 0;
    stopPolling();

    document.getElementById("app-chat").classList.remove("active");
    document.getElementById("app-convenios").classList.add("active");

    cargarUsuarios();
}

// ==================== ENVIAR MENSAJE ====================
async function sendMessage() {
    var input = document.getElementById("chat-input");
    var text = input.value.trim();

    if (!text || !currentChatUser) return;

    input.value = "";
    input.focus();

    // Mensaje optimista
    appendOptimisticMessage(text);

    var result = await safeFetch("/send_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            receiver_id: currentChatUser.id,
            message: text
        })
    });

    if (result === null) {
        markLastMessageAsError();
    }

    await cargarMensajes();
}

/**
 * Agrega un mensaje optimista al chat.
 */
function appendOptimisticMessage(text) {
    var container = document.getElementById("chat-messages");

    var emptyState = container.querySelector(".empty-state");
    if (emptyState) emptyState.remove();

    var loading = container.querySelector(".loading-messages");
    if (loading) loading.remove();

    var div = document.createElement("div");
    div.className = "message sent optimistic";
    div.innerHTML = escapeHtml(text) +
        '<span class="message-time">Enviando...</span>';

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

/**
 * Marca el ultimo mensaje como error si el envio falla.
 */
function markLastMessageAsError() {
    var container = document.getElementById("chat-messages");
    var lastMsg = container.querySelector(".message.optimistic:last-child");
    if (lastMsg) {
        lastMsg.classList.add("error");
        var timeSpan = lastMsg.querySelector(".message-time");
        if (timeSpan) {
            timeSpan.textContent = "Error al enviar";
            timeSpan.style.color = "#FCA5A5";
        }
    }
}

// ==================== CARGAR MENSAJES ====================
async function cargarMensajes() {
    if (!currentChatUser || isLoadingMessages) return;

    isLoadingMessages = true;

    var data = await safeFetch("/get_messages?receiver_id=" + currentChatUser.id);

    isLoadingMessages = false;

    if (!data) return;

    var container = document.getElementById("chat-messages");

    // ✅ evitar render si no hay cambios
    if (data.length === lastMessageCount) return;

    lastMessageCount = data.length;

    var wasAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 60;

    // ✅ SOLO aquí limpiamos
    container.innerHTML = "";

    if (data.length === 0) {
        showEmptyState(
            container,
            '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5">' +
                '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
            '</svg>',
            "Inicia la conversacion",
            "Envia un mensaje para comenzar a chatear"
        );
        return;
    }

    data.forEach(function(msg) {
        var isSent = msg.sender_id == parseInt(CURRENT_USER_ID);

        var div = document.createElement("div");
        div.className = "message " + (isSent ? "sent" : "received");
        div.innerHTML =
            escapeHtml(msg.message) +
            '<span class="message-time">' + formatTime(msg.timestamp) + '</span>';

        container.appendChild(div);
    });

    if (wasAtBottom) {
        container.scrollTop = container.scrollHeight;
    }
}

function cargarConversaciones() {
    fetch("/get_conversations")
    .then(res => res.json())
    .then(ids => {
        if (ids.length > 0) {
            fetch("/get_users")
            .then(res => res.json())
            .then(users => {
                const user = users.find(u => u.id == ids[0]);
                if (user) abrirChat(user);
            });
        }
    });
}

// ==================== POLLING OPTIMIZADO ====================
function startPolling() {
    stopPolling();
    pollingInterval = setInterval(function() {
        if (currentChatUser && document.visibilityState === "visible") {
            cargarMensajes();
        }
    }, 6500000);
}

function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible" && currentChatUser) {
        cargarMensajes();
        startPolling();
    } else {
        stopPolling();
    }
});

// ==================== CERRAR SESION ====================
function cerrarSesion() {
    stopPolling();
    window.location.href = "/logout";
}

// ==================== EVENTOS ====================
document.addEventListener("DOMContentLoaded", function() {
    cargarUsuarios();

    var chatInput = document.getElementById("chat-input");
    chatInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});