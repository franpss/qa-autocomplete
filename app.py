from flask import Flask, jsonify, render_template, request
import requests
import sys
sys.path.insert(0, './scripts')
from scripts.wikibase_query import get_results
from scripts.utils import filter_questions
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
    response = requests.request("GET", url, headers=headers, data = payload)
    print(url)
    response_json = response.json()
    response_filtered = filter_questions(response_json)
    return response_filtered

@app.route('/wikibase_results/<string:question_id>', methods=["GET"])
def wikibase_results(question_id):
    qawiki_endpoint_url = "http://query.qawiki.dcc.uchile.cl/proxy/wdqs/bigdata/namespace/wdq/sparql"#"https://query.wikidata.org/sparql"
    question_query = """SELECT ?x WHERE {{VALUES ?q {{ wd:{} }} ?q wdt:P11 ?x}}"""
    query_f = question_query.format(question_id)
    qawiki_results =  get_results(qawiki_endpoint_url, query_f)
    qawiki_query = qawiki_results[0]["value"]
    wikibase_endpoint_url = "https://query.wikidata.org/sparql"
    wikibase_results = get_results(wikibase_endpoint_url, qawiki_query)
    return {"answer": wikibase_results}
    # try:
    #     qawiki_results =  get_results(qawiki_endpoint_url, query_f)
    #     qawiki_query = qawiki_results[0]
    #     wikibase_endpoint_url = "https://query.wikidata.org/sparql"
    #     wikibase_results = get_results(wikibase_endpoint_url, qawiki_query)
    #     return {"answer": wikibase_results}
    # except Exception as e:
    #     return {"error": str(e)}
    
# @app.route('/qawiki_query/<string:question_id>', methods=["GET"])
# def qawiki_query(question_id):
#     qawiki_endpoint_url = "http://query.qawiki.dcc.uchile.cl/proxy/wdqs/bigdata/namespace/wdq/sparql"#"https://query.wikidata.org/sparql"
#     question_query = """SELECT ?x WHERE {{VALUES ?q {{ wd:{} }} ?q wdt:P11 ?x}}"""
#     query_f = question_query.format(question_id)
#     try:
#         qawiki_results =  get_results(qawiki_endpoint_url, query_f)
#         qawiki_query = qawiki_results["results"]["bindings"][0]["x"]["value"]
#         return {"query": qawiki_query}
#     except:
#         return {"error": ""}


if __name__ == "__main__":
    app.run()