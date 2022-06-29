from flask import Flask, jsonify, make_response, render_template, request
import requests
import sys
import os
sys.path.insert(0, './scripts')
from scripts.query import get_results
from scripts.utils import filter_questions
app = Flask(__name__)


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route('/pipe', methods=["GET", "POST"])
def pipe():
    lang = request.form.get("lang")
    data = str(request.form.get("data"))
    payload = {}
    headers= {}
    url = f"http://qawiki.dcc.uchile.cl/w/api.php?action=wbsearchentities&search={data}" + "&language=" + lang + "&format=json&origin=*"
    if len(data) > 0:
        response = requests.request("GET", url, headers=headers, data = payload)
        print(url)
        response_json = response.json()
        response_filtered = filter_questions(response_json)
        return response_filtered
    else:
        return {}

@app.route('/wikibase_results/<string:question_id>', methods=["GET"])
def wikibase_results(question_id):
    qawiki_endpoint_url = "http://query.qawiki.dcc.uchile.cl/proxy/wdqs/bigdata/namespace/wdq/sparql"
    question_query = """SELECT ?x WHERE {{VALUES ?q {{ wd:{} }} ?q wdt:P11 ?x}}"""
    query_f = question_query.format(question_id)
    qawiki_results =  get_results(qawiki_endpoint_url, query_f)
    qawiki_query = qawiki_results[0]["value"]
    wikibase_endpoint_url = "https://query.wikidata.org/sparql"
    wikibase_results = get_results(wikibase_endpoint_url, qawiki_query)
    return {"answer": wikibase_results}
  
@app.route('/setcookie', methods=['POST', 'GET'])
def setcookie():
    if request.method == 'POST':
        lang = request.form['lang']
    resp = make_response(render_template('index.html'))
    resp.set_cookie('lang', lang, secure=True, httponly=False)

    return resp
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host="0.0.0.0")