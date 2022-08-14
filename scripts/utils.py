from query import get_results, get_mentions
import re

def filter_questions(response, qawiki_endpoint_url):
    items = ["wd:" + item['id'] for item in response["search"]]
    filter_qs_query = """SELECT * WHERE {{ ?s wdt:P1 wd:Q1 . VALUES ?s {{ {} }} }}"""
    qawiki_qs =  get_results(qawiki_endpoint_url, filter_qs_query.format(" ".join(items)))
    qs_values = [item["value"] for item in qawiki_qs]
    search_filtered = [item for item in response["search"] if item["concepturi"] in qs_values]
    response_filtered = response.copy()
    response_filtered["search"] = search_filtered
    return response_filtered

def generate_templates(lang, question, question_id, qawiki_query, qawiki_endpoint):
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
    question_template = question
    query_template = qawiki_query
    matched_mentions = []

    for e in entities:
        matched_mentions.extend([m for m in mentions if m['qualifierValue'] == e and m['propertyValue'] in question])

    for idx in range(len(matched_mentions)):
        question_template = question_template.replace(matched_mentions[idx]["propertyValue"], f"$mention_{idx}@{lang}")
        query_template = query_template.replace("wd:" + matched_mentions[idx]["qualifierValue"], f"$entity_{idx}")

    return question_template, query_template
