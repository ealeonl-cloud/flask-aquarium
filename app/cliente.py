from flask import Blueprint, render_template, session, redirect, url_for, request, jsonify
from flask_mysqldb import MySQL

cliente = Blueprint('cliente', __name__)

mysql = None

def init_mysql(db):
    global mysql
    mysql = db

# ==================== DASHBOARD ====================
@cliente.route('/cliente')
def dashboard_cliente():
    if 'id' not in session:
        return redirect(url_for('auth.login_page'))

    return render_template("cliente.html")

# ==================== OBTENER USUARIOS ====================
@cliente.route('/get_users')
def get_users():
    if 'id' not in session:
        return jsonify([])

    user_id = session['id']

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, nombre FROM usuarios WHERE rol ="usuario" and id != %s", (user_id,))
    usuarios = cursor.fetchall()
    cursor.close()

    data = []
    for u in usuarios:
        data.append({
            "id": u[0],
            "nombre": u[1]
        })

    return jsonify(data)

# ==================== ENVIAR MENSAJE ====================
@cliente.route('/send_message', methods=['POST'])
def send_message():
    if 'id' not in session:
        return jsonify({"error": "No autorizado"}), 401

    data = request.json

    sender_id = session['id']
    receiver_id = int(data.get('receiver_id'))
    message = data.get('message')

    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO mensajes (sender_id, receiver_id, mensaje)
        VALUES (%s, %s, %s)
    """, (sender_id, receiver_id, message))

    mysql.connection.commit()
    cursor.close()

    return jsonify({"success": True})

# ==================== OBTENER MENSAJES ====================
from flask import jsonify

@cliente.route('/get_messages')
def get_messages():
    if 'id' not in session:
        return jsonify([])  # 🔥 SIEMPRE retorna algo

    try:
        user_id = session['id']
        receiver_id = int(request.args.get('receiver_id'))

        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT sender_id, mensaje, created_at
            FROM mensajes
            WHERE (sender_id = %s AND receiver_id = %s)
               OR (sender_id = %s AND receiver_id = %s)
            ORDER BY created_at ASC
        """, (user_id, receiver_id, receiver_id, user_id))

        mensajes = cursor.fetchall()
        cursor.close()

        return jsonify([
            {
                "sender_id": m[0],
                "message": m[1],  # 🔥 IMPORTANTE
                "timestamp": m[2].strftime("%Y-%m-%d %H:%M:%S") if m[2] else ""
            }
            for m in mensajes
        ])

    except Exception as e:
        print("ERROR get_messages:", e)
        return jsonify([])  # 🔥 NUNCA dejar sin return
