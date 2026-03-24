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

        return redirect(url_for('dashboard'))

    return "Correo o contraseña incorrectos"


@auth.route('/logout')
def logout():

    session.clear()

    return redirect(url_for('home'))