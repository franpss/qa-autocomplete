import re
from scripts.query import get_mentions, get_qawiki_question_query, get_results


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
        return None, [], None, None
    else:
        original_question = results_question_query[0]["value"]
        question_template = original_question
        query_template = qawiki_query
        matched_mentions = []
        mentions_text = []
        #print("entities", entities)
        #print("mentions", mentions)
        for e in entities:
            first_match = next((m for m in mentions if m['qualifierValue'] == e and m['propertyValue'] in original_question), None)
            if first_match is not None:
                matched_mentions.append(first_match)
        for idx in range(len(matched_mentions)):
            mentions_text.append(matched_mentions[idx]["propertyValue"])
            question_template = question_template.replace(matched_mentions[idx]["propertyValue"], f"$mention_{idx}")
            query_template = query_template.replace("wd:" + matched_mentions[idx]["qualifierValue"], f"$entity_{idx}")

        return original_question, mentions_text, question_template, query_template

def get_templates(qawiki_endpoint_url, langs=["en", "es"]):
    query = """SELECT * WHERE { ?q wdt:P1 wd:Q1 }"""
    questions =  get_results(qawiki_endpoint_url, query)
    questions_ids = [question["value"].removeprefix('http://qawiki.dcc.uchile.cl/entity/') for question in questions]
    questions_output = []
    for question_id in questions_ids:
        item = {"id": question_id}
        raw_query =  get_qawiki_question_query(item["id"], qawiki_endpoint_url)
        for lang in langs:
            item[f"question_{lang}"], item[f"mentions_{lang}"], item[f"question_template_{lang}"], item[f"query_template_{lang}"] = generate_templates(lang, item["id"], raw_query, qawiki_endpoint_url)
            item[f"visible_question_{lang}"] = None if item[f"question_template_{lang}"] is None else re.sub(r"(\$[a-z]+_[0-9]+)", "(...)", item[f"question_template_{lang}"])
        questions_output.append(item)
    return questions_output