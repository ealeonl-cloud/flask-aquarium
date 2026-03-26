from flask import Flask, render_template, session, redirect, url_for
from flask_mysqldb import MySQL
from admin import admin, init_mysql as init_mysql_admin
from config import Config

from auth import auth, init_mysql
from cliente import cliente
from admin import admin
from cliente import init_mysql as init_mysql_cliente

app = Flask(__name__)

app.config.from_object(Config)
app.secret_key = "super_secret_key"

mysql = MySQL(app)

init_mysql(mysql)
init_mysql_cliente(mysql)

app.register_blueprint(auth)
app.register_blueprint(cliente)
app.register_blueprint(admin)


@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response


@app.route('/')
def home():
    return render_template("index.html")


@app.route('/dashboard')
def dashboard():

    if 'id' in session:

        rol = session['rol']

        if rol == "administrador":
            return redirect(url_for('admin.dashboard_admin'))

        else:
            return redirect(url_for('cliente.dashboard_cliente'))

    return redirect(url_for('auth.login_page'))


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
