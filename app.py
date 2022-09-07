from flask import Flask, jsonify, make_response, render_template, request
import requests
import sys
import os
import re
sys.path.insert(0, './scripts')
from scripts.utils import *
from dotenv import load_dotenv
load_dotenv()

QAWIKI_ENDPOINT = os.environ.get("QAWIKI_ENDPOINT")
WIKIBASE_ENDPOINT = os.environ.get("WIKIBASE_ENDPOINT")
QAWIKI_ENTITY_SEARCH = os.environ.get("QAWIKI_ENTITY_SEARCH")
WIKIDATA_ENTITY_SEARCH = os.environ.get("WIKIDATA_ENTITY_SEARCH")
app = Flask(__name__)

@app.route("/wikidata_search", methods=["GET", "POST"])
def wikidata_search():
    data = str(request.form.get("data"))
    lang = request.form.get("lang")
    output = get_wikidata_entities(lang, data, WIKIDATA_ENTITY_SEARCH)
    return {"search": output}

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route('/merger', methods=["GET", "POST"])
def merger():
    data = str(request.form.get("data"))
    lang = request.form.get("lang")
    questions = get_qawiki_questions(lang, data, QAWIKI_ENTITY_SEARCH, QAWIKI_ENDPOINT)
    test = []
    for question in questions:
        raw_query =  get_qawiki_question_query(question["id"], QAWIKI_ENDPOINT)
        question["query"] = raw_query
        question["question_template"], question["query_template"] = generate_templates(lang, question["question"], question["id"], raw_query, QAWIKI_ENDPOINT)
        question["visible_question"] = re.sub(r"(\$[a-z]+_[0-9]+)", "(...)", question["question_template"])
        test.append(question)


    return {"results": test}

@app.route('/wikibase_results', methods=["GET", "POST"])
def wikibase_results():
    replaced_query= request.form.get("query")
    answer = get_results(WIKIBASE_ENDPOINT, replaced_query)
    return {"answer": answer}
  
@app.route('/setcookie', methods=['POST', 'GET'])
def setcookie():
    if request.method == 'POST':
        lang = request.form['lang']
    resp = make_response(render_template('index.html'))
    resp.set_cookie('lang', lang, secure=True, httponly=False)

    return resp
if __name__ == "__main__":
    app.run(host="0.0.0.0")