from flask import Flask, jsonify, make_response, render_template, request
import requests
import sys
import os
sys.path.insert(0, './scripts')
from scripts.query import get_results, get_mentions
from scripts.utils import filter_questions, generate_templates
from dotenv import load_dotenv
load_dotenv()

QAWIKI_ENDPOINT = os.environ.get("QAWIKI_ENDPOINT")
WIKIBASE_ENDPOINT = os.environ.get("WIKIBASE_ENDPOINT")
QAWIKI_ENTITY_SEARCH = os.environ.get("QAWIKI_ENTITY_SEARCH")

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
    url = QAWIKI_ENTITY_SEARCH.format(data, lang)
    if len(data) > 0:
        response = requests.request("GET", url, headers=headers, data = payload)
        print(url)
        response_json = response.json()
        response_filtered = filter_questions(response_json, QAWIKI_ENDPOINT)
        return response_filtered
    else:
        return {}

@app.route('/wikibase_results/<string:question_id>', methods=["GET", "POST"])
def wikibase_results(question_id):
    question_query = """SELECT ?x WHERE {{VALUES ?q {{ wd:{} }} ?q wdt:P11 ?x}}"""
    query_f = question_query.format(question_id)
    qawiki_results =  get_results(QAWIKI_ENDPOINT, query_f)
    qawiki_query = qawiki_results[0]["value"]
    lang = request.form.get("lang")
    question = request.form.get("question")
    
    # --- temporal (in the future they should be saved)
    question_template, query_template = generate_templates(lang, question, question_id, qawiki_query, QAWIKI_ENDPOINT)
    print("question_template", question_template)
    print("query_template", query_template)
    # ---
    wikibase_results = get_results(WIKIBASE_ENDPOINT, qawiki_query)
    return {"answer": wikibase_results}
  
@app.route('/setcookie', methods=['POST', 'GET'])
def setcookie():
    if request.method == 'POST':
        lang = request.form['lang']
    resp = make_response(render_template('index.html'))
    resp.set_cookie('lang', lang, secure=True, httponly=False)

    return resp
if __name__ == "__main__":
    app.run(host="0.0.0.0")