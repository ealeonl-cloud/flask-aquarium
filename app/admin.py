from flask import Blueprint, render_template, session, redirect, url_for, request

admin = Blueprint('admin', __name__)

mysql = None

def init_mysql(db):
    global mysql
    mysql = db


@admin.route('/admin')
def dashboard_admin():

    if 'id' not in session:
        return redirect(url_for('auth.login_page'))

    if session['rol'] != 'administrador':
        return redirect(url_for('dashboard'))

    return render_template("admin.html")

    


@admin.route('/admin/chats')
def ver_chats():

    if 'id' not in session:
        return redirect(url_for('auth.login_page'))

    if session['rol'] != 'administrador':
        return redirect(url_for('dashboard'))

    cursor = mysql.connection.cursor()

    cursor.execute("""
        SELECT c.id, u.nombre, c.convenio_id, c.estado, c.fecha
        FROM chats c
        JOIN usuarios u ON c.usuario_id = u.id
        ORDER BY c.fecha DESC
    """)

    chats = cursor.fetchall()

    cursor.close()

    return render_template("admin.html", chats=chats)

@admin.route('/admin/chat/<int:chat_id>')
def ver_chat(chat_id):

    if 'id' not in session:
        return redirect(url_for('auth.login_page'))

    cursor = mysql.connection.cursor()

    cursor.execute("""
        SELECT remitente, mensaje, fecha
        FROM mensajes
        WHERE chat_id = %s
        ORDER BY fecha ASC
    """, (chat_id,))

    mensajes = cursor.fetchall()

    cursor.close()

    return {"mensajes": mensajes}

@admin.route('/admin/mensaje', methods=['POST'])
def responder_mensaje():

    if 'id' not in session:
        return {"error": "No autorizado"}, 401

    chat_id = request.form['chat_id']
    mensaje = request.form['mensaje']

    cursor = mysql.connection.cursor()

    cursor.execute("""
        INSERT INTO mensajes (chat_id, remitente, mensaje)
        VALUES (%s,'convenio',%s)
    """, (chat_id, mensaje))

    mysql.connection.commit()

    cursor.close()

    return {"status": "ok"}