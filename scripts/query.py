import re
import requests


def filter_questions(response, qawiki_endpoint_url):
    items = ["wd:" + item['id'] for item in response["search"]]
    filter_query = """SELECT * WHERE {{ ?s wdt:P1 wd:Q1 . VALUES ?s {{ {} }} }}"""
    qawiki_qs =  get_results(qawiki_endpoint_url, filter_query.format(" ".join(items)))
    qs_values = [item[0]["value"] for item in qawiki_qs]
    search_filtered = [{"id": item["id"], "question": item["match"]["text"]} for item in response["search"] if item["concepturi"] in qs_values]
    return search_filtered
    
def filter_entities(response, wikidata_endpoint_url, info_entity="wdt:P35"):
    items = ["wd:" + item['id'] for item in response["search"]]
    filter_query = """SELECT * WHERE {{ ?s wdt:P31|wdt:P279 {} . VALUES ?s {{ {} }} }}"""
    wikidata_entities =  get_results(wikidata_endpoint_url, filter_query.format(info_entity, " ".join(items)))
    qs_values = [item[0]["value"] for item in wikidata_entities]
    search_filtered = [item for item in response["search"] if item["concepturi"] in qs_values]
    response_filtered = response.copy()
    response_filtered["search"] = search_filtered
    return response_filtered


def get_results(url, query, f="json"):
    output = []
    r = requests.get(url, params = {'format': f, 'query': query})
    try:
        data = r.json()   
        if "vars" in data["head"]:
            vars_list = data["head"]["vars"]
            for item in data["results"]["bindings"]:
                row = []
                for var in vars_list:
                    if var in item:
                        row.append(item[var])
                    else: 
                        row.append({})
                output.append(row)
        if "boolean" in data:
            return data
        return output
    except:
        return []
    

def get_props_qualif(url, query, f="json"):
    r = requests.get(url, params = {'format': f, 'query': query})
    data = r.json()
    data_copy = data["results"]["bindings"].copy()
    for item in data_copy:
        item["mention"] = item["mention"]["value"]
        item["entity"] = item["entity"]["value"]
    return sorted(data_copy, key=lambda d: len(d['mention']), reverse=True) 

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



def get_qawiki_question_query(question_id, qawiki_endpoint):
    question_query = """SELECT ?x WHERE {{VALUES ?q {{ wd:{} }} ?q wdt:P11 ?x}}"""
    query_f = question_query.format(question_id)
    qawiki_results =  get_results(qawiki_endpoint, query_f)
    qawiki_query = qawiki_results[0][0]["value"] # catch possible error?
    return qawiki_query


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