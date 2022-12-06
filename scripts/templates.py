import re
from scripts.query import get_props_qualif, get_qawiki_question_query, get_results


def generate_templates_cont_question(cont_question_dict, matches, lang):
    cont_question_dict[f"question_template_{lang}"] = cont_question_dict[f"question_raw_{lang}"]
    cont_question_dict[f"query_template_{lang}"] = cont_question_dict[f"query_raw"]
    for idx in range(len(matches)):
        cont_question_dict[f"question_template_{lang}"] = re.sub(r'\b' + re.escape(matches[idx]["mention"]) + r'((?= )|(?=\?))', f"$mention_{idx}", cont_question_dict[f"question_template_{lang}"])
        cont_question_dict[f"query_template_{lang}"] = re.sub(r'\b' + re.escape("wd:" + matches[idx]["entity"]) + r'((?= )|(?=\?))',  f"$entity_{idx}", cont_question_dict[f"query_template_{lang}"])
    return cont_question_dict


def generate_templates(lang, question_id, qawiki_query, qawiki_endpoint):
    entities = set(re.findall(r"(?<=wd:)Q[0-9]+", qawiki_query))
    mentions_query = """
    SELECT ?mention ?entity
        {{ 
            VALUES (?item) {{(wd:{0})}}
            ?item ?prop ?statement . 
            ?statement ?ps ?mention . 
            wd:P38 wikibase:statementProperty ?ps . 
            ?statement ?pq ?entity . 
            wd:P17 wikibase:qualifier ?pq .
            FILTER (langMatches( lang(?mention), "{1}" ) )
        }}
    """
    
    mentions = get_props_qualif(qawiki_endpoint, mentions_query.format(question_id, lang))
    get_question_query = """SELECT ?label {{ VALUES (?item) {{(wd:{0})}} . ?item rdfs:label ?label . FILTER (langMatches( lang(?label), "{1}" ))}}"""
    results_question_query = get_results(qawiki_endpoint, get_question_query.format(question_id, lang))
    if len(results_question_query) == 0:
        return None, [], None, None, None
    else:
        original_question = results_question_query[0][0]["value"]
        question_template = original_question
        visible_question = original_question
        query_template = qawiki_query
        matched_mentions = []
        for e in entities:
            first_match = next((m for m in mentions if m['entity'] == e and m['mention'] in original_question), None)
            if first_match is not None:
                matched_mentions.append(first_match)
        
        for idx in range(len(matched_mentions)):
            
            visible_question = re.sub(r'\b' + re.escape(matched_mentions[idx]["mention"]) + r'((?= )|(?=\?))', "{" + matched_mentions[idx]["mention"] + "}", visible_question)
            question_template = re.sub(r'\b' + re.escape(matched_mentions[idx]["mention"]) + r'((?= )|(?=\?))', f"$mention_{idx}", question_template)
            query_template = re.sub(r'\b' + re.escape("wd:" + matched_mentions[idx]["entity"]) + r'((?= )|(?=\?))', f"$entity_{idx}", query_template)
        return original_question, matched_mentions, question_template, query_template, visible_question

# (para documentar luego) preguntas contingentes se hacen en esta itteración general debido a que 
# el resultado de estas (booleano) no depende del idioma. En la función generate_templates se generan
# las plantillas para cada idioma. De todos modos, luego es transportada la información
# de la pregunta contingente a generate_templates, pero para solo hacer el match entre entidades
# (que también deben estar en la pregunta original) y la query
def get_all_templates(qawiki_endpoint_url, entity_prefix, boolean_values_dict, langs):
    query = """SELECT * WHERE { ?q wdt:P1 wd:Q1 }"""
    questions =  get_results(qawiki_endpoint_url, query)
    questions_ids = [question[0]["value"].removeprefix(entity_prefix) for question in questions]
    return get_templates(questions_ids, qawiki_endpoint_url, entity_prefix, boolean_values_dict, langs)

def get_templates(questions_ids, qawiki_endpoint_url, entity_prefix, boolean_values_dict, langs):
    get_question_query = """
        SELECT ?label {{ 
        VALUES (?item) {{(wd:{0})}} . 
        ?item rdfs:label ?label . 
        FILTER (langMatches( lang(?label), "{1}" ))}}"""
    cont_question_query = """
    SELECT ?mention ?entity
        {{
         wd:{0} ?prop ?statement . 
         ?statement ?ps ?mention . 
         wd:P32 wikibase:statementProperty ?ps . 
         ?statement ?pq ?entity . 
         wd:P33 wikibase:qualifier ?pq 
        }} LIMIT 1 """
    questions_output = []
    for question_id in questions_ids:
        try:
            item = {"id": question_id}
            raw_query =  get_qawiki_question_query(item["id"], qawiki_endpoint_url)
            contingent_question = get_props_qualif(qawiki_endpoint_url, cont_question_query.format(question_id))
            if len(contingent_question) > 0:
                item["contingent_question"] = {}
                item["contingent_question"]["id"] = contingent_question[0]["mention"].removeprefix(entity_prefix) 
                item["contingent_question"]["query_raw"] =  get_qawiki_question_query(item["contingent_question"]["id"], qawiki_endpoint_url)
                expected_value = contingent_question[0]["entity"].removeprefix(entity_prefix) 
                item["contingent_question"]["expected_value"] = boolean_values_dict[expected_value]
                
            else:
                item["contingent_question"] = None
            for lang in langs:
                item[f"question_{lang}"], item[f"matches_{lang}"], item[f"question_template_{lang}"], item[f"query_template_{lang}"], item[f"visible_question_{lang}"] = generate_templates(lang, item["id"], raw_query, qawiki_endpoint_url)
                if item["contingent_question"] != None:
                    contingent_question_label = get_results(qawiki_endpoint_url, get_question_query.format(item["contingent_question"]["id"], lang))
                    if len(contingent_question_label) == 0:
                        item["contingent_question"][f"question_raw_{lang}"] = None
                    else:
                        item["contingent_question"][f"question_raw_{lang}"] = contingent_question_label[0][0]["value"]
                    item["contingent_question"] = generate_templates_cont_question(item["contingent_question"], item[f"matches_{lang}"], lang)
        
            questions_output.append(item)
        except:
            continue
    return questions_output