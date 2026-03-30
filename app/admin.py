from flask import Blueprint, request, jsonify, session, render_template, redirect, url_for

admin = Blueprint('admin', __name__, url_prefix='/admin')

mysql = None

def init_mysql(db):
    global mysql
    mysql = db


def admin_required():
    return 'id' in session and session.get('rol') == 'administrador'


# ==========================
# DASHBOARD ADMIN
# ==========================
@admin.route('/dashboard')
def dashboard_admin():
    if not admin_required():
        return redirect(url_for('auth.login_page'))

    return render_template('admin.html')


# ==========================
# OBTENER USUARIOS
# ==========================
@admin.route('/api/usuarios')
def get_usuarios():
    if not admin_required():
        return jsonify({"error": "No autorizado"}), 403

    cursor = mysql.connection.cursor()
    cursor.execute("""
        SELECT id, nombre, usuario, rol, fecha_creacion
        FROM usuarios
    """)

    data = cursor.fetchall()
    cursor.close()

    usuarios = []
    for u in data:
        usuarios.append({
            "id": str(u[0]),
            "name": u[1],
            "email": u[2],
            "role": "admin" if u[3] == "administrador" else "usuario",
            "status": "active",
            "createdAt": u[4].strftime('%Y-%m-%d') if u[4] else None
        })

    return jsonify(usuarios)


# ==========================
# CREAR ADMIN
# ==========================
@admin.route('/api/usuarios', methods=['POST'])
def crear_usuario():
    if not admin_required():
        return jsonify({"error": "No autorizado"}), 403

    data = request.json

    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO usuarios (nombre, email, password, rol)
        VALUES (%s, %s, %s, %s)
    """, (data['name'], data['email'], data['password'], 'administrador'))

    mysql.connection.commit()
    cursor.close()

    return jsonify({"success": True})


# ==========================
# EDITAR NOMBRE
# ==========================
@admin.route('/api/usuarios/<id>', methods=['PUT'])
def editar_usuario(id):
    if not admin_required():
        return jsonify({"error": "No autorizado"}), 403

    data = request.json

    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE usuarios SET nombre = %s WHERE id = %s",
                   (data['name'], id))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"success": True})


# ==========================
# ELIMINAR USUARIO
# ==========================
@admin.route('/api/usuarios/<id>', methods=['DELETE'])
def eliminar_usuario(id):
    if not admin_required():
        return jsonify({"error": "No autorizado"}), 403

    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM usuarios WHERE id = %s", (id,))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"success": True})


# ==========================
# CHATS (TOP INTERACCIONES)
# ==========================
@admin.route('/api/chats')
def get_chats():
    if not admin_required():
        return jsonify([])

    cursor = mysql.connection.cursor()
    cursor.execute("""
       SELECT 
            LEAST(sender_id, receiver_id) as user1,
            GREATEST(sender_id, receiver_id) as user2,
            COUNT(*) as total
        FROM mensajes
        GROUP BY user1, user2
        ORDER BY total DESC
    """)

    data = cursor.fetchall()
    cursor.close()

    chats = []
    for c in data:
        chats.append({
            "id": str(c[0]),
            "name": f"Chat {c[0]}",
            "interactions": c[1],
            "lastActive": "2026-03-30"
        })

    return jsonify(chats)
