from flask import Blueprint, render_template, request, redirect, url_for, session
from flask_mysqldb import MySQL

auth = Blueprint('auth', __name__)

mysql = None

def init_mysql(db):
    global mysql
    mysql = db


@auth.route('/login')
def login_page():
    return render_template("login.html")


from flask import jsonify

@auth.route('/login', methods=['POST'])
def login():

    email = request.form['email']
    password = request.form['password']

    cursor = mysql.connection.cursor()
    cursor.execute(
        "SELECT id, nombre, email, password, rol FROM usuarios WHERE email=%s",
        (email,)
    )

    usuario = cursor.fetchone()
    cursor.close()

    if usuario and usuario[3] == password:

        session['id'] = usuario[0]
        session['nombre'] = usuario[1]
        session['email'] = usuario[2]
        session['rol'] = usuario[4]

        return jsonify({"success": True})

    return jsonify({"error": "Correo o contraseña incorrectos"}), 401


@auth.route('/register', methods=['POST'])
def register():
    try:
        nombre = request.form['nombre']
        email = request.form['email']
        password = request.form['password']

        rol = "usuario"
        fecha_creacion = datetime.now()

        cursor = mysql.connection.cursor()

        # Validar si ya existe el email
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
        existe = cursor.fetchone()

        if existe:
            return jsonify({"error": "El correo ya está registrado"}), 400

        # Insertar usuario
        cursor.execute("""
            INSERT INTO usuarios (nombre, email, password, fecha_creacion, rol)
            VALUES (%s, %s, %s, %s, %s)
        """, (nombre, email, password, fecha_creacion, rol))

        mysql.connection.commit()
        cursor.close()

        return jsonify({"mensaje": "Usuario registrado correctamente"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth.route('/logout')
def logout():

    session.clear()

    return redirect(url_for('home'))
