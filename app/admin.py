from flask import Blueprint, request, jsonify, session
from flask import Flask, render_template, request, redirect, url_for, session

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
@app.route("/admin/api/usuarios")
def get_usuarios():
    cursor = mysql.connection.cursor()
    cursor.execute("""
        SELECT id, name, email, created_at
        FROM usuarios
    """)
    
    data = cursor.fetchall()

    users = []
    for row in data:
        users.append({
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "role": "admin",
            "createdAt": str(row[3])
        })

    return jsonify(usuarios)


# ==========================
# CREAR ADMIN
# ==========================
@app.route("/admin/api/usuarios", methods=["POST"])
def create_usuario():
    data = request.get_json()

    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO usuarios (name, email, password)
        VALUES (%s,%s,%s)
    """, (data["name"], data["email"], data["password"]))

    mysql.connection.commit()
    return {"status": "ok"}


# ==========================
# EDITAR NOMBRE
# ==========================
@app.route("/admin/api/usuarios/<int:id>", methods=["PUT"])
def update_usuario(id):
    data = request.get_json()

    cursor = mysql.connection.cursor()
    cursor.execute("""
        UPDATE usuarios
        SET name=%s
        WHERE id=%s
    """, (data["name"], id))

    mysql.connection.commit()
    return {"status": "ok"}


# ==========================
# ELIMINAR USUARIO
# ==========================
@admin.route('/api/usuarios/<id>', methods=['DELETE'])
@app.route("/admin/api/usuarios/<int:id>", methods=["DELETE"])
def delete_usuario(id):
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM usuarios WHERE id=%s", (id,))
    mysql.connection.commit()

    return {"status": "ok"}


# ==========================
# CHATS (TOP INTERACCIONES)
# ==========================
@admin.route('/api/chats')
def get_chats():
    if not admin_required():
        return jsonify([])

    cursor = mysql.connection.cursor()

    cursor.execute("""
        SELECT chat_id, COUNT(*) as total
        FROM mensajes
        GROUP BY chat_id
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
