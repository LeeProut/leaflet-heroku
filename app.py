from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from os import environ

app = Flask(__name__)
# app.config('SQLALCHEMY_DATABASE_URI') = environ.get('DATABASE_URL', 'sqlite:///leaflet.sqlite')

db = SQLAlchemy(app)
class Quakes(db.Model):
    __tablename__ = 'quakes'



@app.route('/')
def index(): 
    return render_template('index.html')

# @app.route('/api/quakes')    

if __name__ == '__main__':   
    app.run(debug=True)

