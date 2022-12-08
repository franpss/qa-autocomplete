import re
import requests


def get_results(url, query, logger, f="json"):
    output = []
    headers = {'User-Agent': 'Templet - Wikidata Autocomplete Search', 
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
        logger.info(f"Successfully obtained results of query: {query}")
        return output
    except:
        logger.error(f"Couldn't obtain results of query: {query}")
        return []
    

def get_props_qualif(url, query, logger, f="json"):
    logger.info(f"Getting mentions and entities from question in QAWiki")
    try:
        r = requests.get(url, params = {'format': f, 'query': query})
        data = r.json()
        data_copy = data["results"]["bindings"].copy()
        for item in data_copy:
            item["mention"] = item["mention"]["value"]
            item["entity"] = item["entity"]["value"]
        logger.info(f"Successfully obtained mentions and entities from question in QAWiki")
        return sorted(data_copy, key=lambda d: len(d['mention']), reverse=True) 
    except:
        logger.error(f"Couldn't obtain mentions and entities from question in QAWiki. Query: {query}")
        return []

def get_wikidata_entities(lang, data, wikidata_search, logger):
    url = wikidata_search.format(data, lang)
    items = []
    logger.info(f"Getting Wikidata entities from API...")
    try:
        if len(data) > 0:
            response = requests.request("GET", url)
            response_json = response.json()
            for item in response_json["search"]:
                item_data = {"value": item['id'], "label": item["match"]["text"], "desc": None}
                if "description" in item["display"].keys():
                    item_data["desc"] = item["display"]["description"]["value"]
                items.append(item_data)
        logger.info(f"Successfully fetched Wikidata entities from API")
        return items
    except:
        logger.error(f"Couldn't fetch Wikidata entities from API")
        return items
    



def get_qawiki_question_query(question_id, qawiki_endpoint, logger):
    try:
        question_query = """SELECT ?x WHERE {{VALUES ?q {{ wd:{} }} ?q wdt:P11 ?x}}"""
        query_f = question_query.format(question_id)
        qawiki_results =  get_results(qawiki_endpoint, query_f, logger)
        qawiki_query = qawiki_results[0][0]["value"] 
        logger.info(f"Successfully obtained original SPARQL query for question {question_id}")
        return qawiki_query
    except:
        logger.error(f"Couldn't obtain original SPARQL query for question {question_id}")
        return None
        
