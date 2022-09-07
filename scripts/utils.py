import json
import requests
import re


def filter_questions(response, qawiki_endpoint_url):
    items = ["wd:" + item['id'] for item in response["search"]]
    filter_query = """SELECT * WHERE {{ ?s wdt:P1 wd:Q1 . VALUES ?s {{ {} }} }}"""
    qawiki_qs =  get_results(qawiki_endpoint_url, filter_query.format(" ".join(items)))
    qs_values = [item["value"] for item in qawiki_qs]
    search_filtered = [{"id": item["id"], "question": item["match"]["text"]} for item in response["search"] if item["concepturi"] in qs_values]
    return search_filtered
    
def filter_entities(response, wikidata_endpoint_url, info_entity="wdt:P35"):
    items = ["wd:" + item['id'] for item in response["search"]]
    filter_query = """SELECT * WHERE {{ ?s wdt:P31|wdt:P279 {} . VALUES ?s {{ {} }} }}"""
    wikidata_entities =  get_results(wikidata_endpoint_url, filter_query.format(info_entity, " ".join(items)))
    qs_values = [item["value"] for item in wikidata_entities]
    search_filtered = [item for item in response["search"] if item["concepturi"] in qs_values]
    response_filtered = response.copy()
    response_filtered["search"] = search_filtered
    return response_filtered

def generate_templates(lang, question_id, qawiki_query, qawiki_endpoint):
    entities = re.findall(r"(?<=wd:)Q[0-9]+", qawiki_query)
    mentions_query = """
    SELECT ?propertyValue ?qualifierValue
        {{ 
            VALUES (?item) {{(wd:{0})}}
            ?item ?prop ?statement . 
            ?statement ?ps ?propertyValue . 
            wd:P38 wikibase:statementProperty ?ps . 
            ?statement ?pq ?qualifierValue . 
            wd:P17 wikibase:qualifier ?pq .
            FILTER (langMatches( lang(?propertyValue), "{1}" ) )
        }}
    """
    mentions = get_mentions(qawiki_endpoint, mentions_query.format(question_id, lang))
    get_question_query = """SELECT ?label {{ VALUES (?item) {{(wd:{0})}} . ?item rdfs:label ?label . FILTER (langMatches( lang(?label), "{1}" ))}}"""
    results_question_query = get_results(qawiki_endpoint, get_question_query.format(question_id, lang))
    if len(results_question_query) == 0:
        return None, None
    else:
        question = results_question_query[0]["value"]
        question_template = question
        query_template = qawiki_query
        matched_mentions = []

        for e in entities:
            matched_mentions.extend([m for m in mentions if m['qualifierValue'] == e and m['propertyValue'] in question])

        for idx in range(len(matched_mentions)):
            question_template = question_template.replace(matched_mentions[idx]["propertyValue"], f"$mention_{idx}")
            query_template = query_template.replace("wd:" + matched_mentions[idx]["qualifierValue"], f"$entity_{idx}")

        return question_template, query_template

def get_results(url, query, f="json"):
    r = requests.get(url, params = {'format': f, 'query': query})
    data = r.json()
    if "vars" in data["head"]:
        var_name = data["head"]["vars"][0]
        results = [item[var_name] for item in data["results"]["bindings"]]
        return results
    else:
        return data

def get_mentions(url, query, f="json"):
    r = requests.get(url, params = {'format': f, 'query': query})
    data = r.json()
    data_copy = data["results"]["bindings"].copy()
    for item in data_copy:
        item["propertyValue"] = item["propertyValue"]["value"]
        item["qualifierValue"] = item["qualifierValue"]["value"]
    return data_copy

def get_wikidata_entities(lang, data, wikidata_search):
    url = wikidata_search.format(data, lang)
    items = []
    if len(data) > 0:
        response = requests.request("GET", url)
        response_json = response.json()
        #response_filtered = filter_entities(response_json, WIKIBASE_ENDPOINT)
        for item in response_json["search"]:
            item_data = {"value": item['id'], "label": item["match"]["text"], "desc": None}
            if "description" in item["display"].keys():
                item_data["desc"] = item["display"]["description"]["value"]
            items.append(item_data)

    return items

# solve "return {}", should return key with empty list
def get_qawiki_questions(lang, data, qawiki_search, qawiki_endpoint):
    url = qawiki_search.format(data, lang)
    if len(data) > 0:
        response = requests.request("GET", url)
        response_json = response.json()
        response_filtered = filter_questions(response_json, qawiki_endpoint)
        return response_filtered
    else:
        return {}

def get_qawiki_question_query(question_id, qawiki_endpoint):
    question_query = """SELECT ?x WHERE {{VALUES ?q {{ wd:{} }} ?q wdt:P11 ?x}}"""
    query_f = question_query.format(question_id)
    qawiki_results =  get_results(qawiki_endpoint, query_f)
    qawiki_query = qawiki_results[0]["value"]
    return qawiki_query

def get_templates(qawiki_endpoint_url, langs=["en", "es"]):
    query = """SELECT * WHERE { ?q wdt:P1 wd:Q1 }"""
    questions =  get_results(qawiki_endpoint_url, query)
    questions_ids = [question["value"].removeprefix('http://qawiki.dcc.uchile.cl/entity/') for question in questions]
    questions_output = []
    for question_id in questions_ids:
        item = {"id": question_id}
        raw_query =  get_qawiki_question_query(item["id"], qawiki_endpoint_url)
#        item["query"] = raw_query
        for lang in langs:
            item[f"question_template_{lang}"], item[f"query_template_{lang}"] = generate_templates(lang, item["id"], raw_query, qawiki_endpoint_url)
            item[f"visible_question_{lang}"] = None if item[f"question_template_{lang}"] is None else re.sub(r"(\$[a-z]+_[0-9]+)", "(...)", item[f"question_template_{lang}"])
        questions_output.append(item)
    return questions_output

def save_json(dic, path='static/cached_questions', filename='templates.json'):
        """Saves dictionary in json file.
        Parameters
        ----------
        dic : Dict[]
            dictionary to save
        path : str
            path where the json file will be saved
        filename : str
            name for the json file
        """
        if not os.path.exists(path):
            os.makedirs(path)
        with open(os.path.join(path, filename), 'w', encoding='utf8') as f:
            json.dump(dic, f, indent=2, ensure_ascii=False)   
import os
from dotenv import load_dotenv
load_dotenv()

#save_json(get_templates(os.environ.get("QAWIKI_ENDPOINT")))


# with open('static/cached_questions/templates.json') as json_file:
#     data = json.load(json_file)
#     for q in data:
#         if q["query_template_en"] != q["query_template_es"]:
#             print(q["id"], "not equal")
 