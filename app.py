from flask import Flask, jsonify, render_template, request
import requests

app = Flask(__name__)


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route('/pipe', methods=["GET", "POST"])
def pipe():

    data = request.form.get("data")

    payload = {}
    headers= {}

    url = f"http://qawiki.dcc.uchile.cl/w/api.php?action=wbsearchentities&search={str(data)}" + "&language=en&format=json&origin=*"
    print(url)
    response = requests.request("GET", url, headers=headers, data = payload)

    return response.json()


if __name__ == "__main__":
    app.run()