from flask import Flask, abort, jsonify, make_response, render_template, request
import requests
import sys
import os
import re

from scripts.utils import read_json
sys.path.insert(0, './scripts')
from scripts.query import get_results, get_wikidata_entities
from dotenv import load_dotenv
load_dotenv()

QAWIKI_ENDPOINT = os.environ.get("QAWIKI_ENDPOINT")
WIKIBASE_ENDPOINT = os.environ.get("WIKIBASE_ENDPOINT")
QAWIKI_ENTITY_SEARCH = os.environ.get("QAWIKI_ENTITY_SEARCH")
WIKIDATA_ENTITY_SEARCH = os.environ.get("WIKIDATA_ENTITY_SEARCH")
TEMPLATES_PATH = 'static/cached_questions/templates.json'
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

@app.route('/wikibase_results', methods=["GET"])
def wikibase_results():
    params = request.args.to_dict() 
    replaced_query= params["query"] 
    answer = get_results(WIKIBASE_ENDPOINT, replaced_query)
    return {"answer": answer}

@app.route('/question_template/<question_id>', methods=["GET"])
def question_template(question_id):
    templates = read_json(TEMPLATES_PATH)
    available_ids = [question['id'] for question in templates]
    if question_id.upper() in available_ids:
        return render_template("index.html")
    else:
        abort(404)
  
@app.route('/setcookie', methods=['POST', 'GET'])
def setcookie():
    if request.method == 'POST':
        lang = request.form['lang']
    resp = make_response(render_template('index.html'))
    resp.set_cookie('lang', lang, secure=True, httponly=False)

    return resp
if __name__ == "__main__":
    app.run(host="0.0.0.0")