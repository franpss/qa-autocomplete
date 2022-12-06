import re
import requests


def get_results(url, query, f="json"):
    output = []
    headers = {'User-Agent': 'Flask App Wikidata Autocomplete Search', 
               'From': 'franpss@gmail.com'}
    r = requests.get(url, params = {'format': f, 'query': query}, headers=headers)
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

