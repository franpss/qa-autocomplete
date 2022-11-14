from flask import Flask, abort, jsonify, make_response, render_template, request
import sys
import os
from scripts.utils import read_json, templates_update
sys.path.insert(0, './scripts')
from scripts.query import get_results, get_wikidata_entities
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
load_dotenv()


QAWIKI_ENDPOINT = os.environ.get("QAWIKI_ENDPOINT")
WIKIBASE_ENDPOINT = os.environ.get("WIKIBASE_ENDPOINT")
QAWIKI_ENTITY_SEARCH = os.environ.get("QAWIKI_ENTITY_SEARCH")
WIKIDATA_ENTITY_SEARCH = os.environ.get("WIKIDATA_ENTITY_SEARCH")
QAWIKI_ENTITY_PREFIX = os.environ.get("QAWIKI_ENTITY_PREFIX")
JOB_INTERVAL_MINUTES = int(os.environ.get("JOB_INTERVAL_MINUTES"))
TEMPLATES_PATH = 'static/cached_questions/templates.json'

sched = BackgroundScheduler(daemon=True)
boolean_values_dict = read_json("static/QAWikiBooleanValues.json")
sched.add_job(templates_update, 'interval', args=[QAWIKI_ENDPOINT, QAWIKI_ENTITY_PREFIX, boolean_values_dict], minutes=JOB_INTERVAL_MINUTES)
sched.start()

app = Flask(__name__)

@app.route("/wikidata_search", methods=["POST"])
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
  
@app.route('/setcookie', methods=['POST'])
def setcookie():
    if request.method == 'POST':
        lang = request.form['lang']
    resp = make_response(render_template('index.html'))
    resp.set_cookie('lang', lang, secure=True, httponly=False, samesite="Lax")

    return resp
if __name__ == "__main__":
    app.run(host="0.0.0.0")