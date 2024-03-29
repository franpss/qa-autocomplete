import re
from scripts.query import get_props_qualif, get_qawiki_question_query, get_results


def generate_templates_cont_question(cont_question_dict, matches, lang):
    """Generates template for contingent question

    Parameters
    ----------
    cont_question_dict : dict{}
        dictionary containing data from the contingent question
    matches : list[] str
        mentions/entities matched in main question
    qawiki_entity_prefix : str
        QAWiki entity prefix url
    logger : logging.Logger
        Log object
    lang : string
        selected language
    Returns
    -------
    cont_question_dict : dict{}
        dictionary containing data from the contingent question
    """
    cont_question_dict[f"question_template_{lang}"] = cont_question_dict[f"question_raw_{lang}"]
    cont_question_dict[f"query_template_{lang}"] = cont_question_dict[f"query_raw"]
    for idx in range(len(matches)):
        cont_question_dict[f"question_template_{lang}"] = re.sub(r'\b' + re.escape(matches[idx]["mention"]) + r'((?= )|(?=\?))', f"$mention_{idx}", cont_question_dict[f"question_template_{lang}"])
        cont_question_dict[f"query_template_{lang}"] = re.sub(r'\b' + re.escape("wd:" + matches[idx]["entity"]) + r'((?= )|(?=\?)|(?=\))|(?=\}))',  f"$entity_{idx}", cont_question_dict[f"query_template_{lang}"])
    return cont_question_dict


def generate_templates(lang, question_id, qawiki_query, qawiki_endpoint, logger):
    """Generates templates for a question_id

    Parameters
    ----------
    lang : string
        selected language
    question_id : str
        QID of question in QAWiki
    qawiki_query : str
        original SPARQL query of question
    qawiki_endpoint : str
        QAWiki Query Service endpoint
    logger : logging.Logger
        Log object 
    Returns
    -------
    original_question : str
        original QAWiki question in natural language
    matched_mentions : list[] str
        mentions/entities matched in question/query
    question_template: str 
        natural language question template
    query_template : str
        SPARQL query template
    visible_question : str
        visible (in web app) natural language question
    
    """
    entities = set(re.findall(r"(?<=wd:)Q[0-9]+", qawiki_query))
    mentions_query = """
    SELECT ?mention ?entity WHERE {{
    {{
        wd:{0} wdt:P47 ?item . 
        ?item ?prop ?statement . 
        ?statement ?ps ?mention . 
        wd:P38 wikibase:statementProperty ?ps . 
        ?statement ?pq ?entity . 
        wd:P17 wikibase:qualifier ?pq .
    }}
    UNION {{
        wd:{0} ?prop ?statement . 
        ?statement ?ps ?mention . 
        wd:P38 wikibase:statementProperty ?ps . 
        ?statement ?pq ?entity . 
        wd:P17 wikibase:qualifier ?pq .
    }}
    FILTER (langMatches( lang(?mention), "{1}" ) )
    }}
    GROUP BY ?mention ?entity
    """
    
    mentions = get_props_qualif(qawiki_endpoint, mentions_query.format(question_id, lang), logger)
    get_question_query = """SELECT ?label {{ VALUES (?item) {{(wd:{0})}} . ?item rdfs:label ?label . FILTER (langMatches( lang(?label), "{1}" ))}}"""
    results_question_query = get_results(qawiki_endpoint, get_question_query.format(question_id, lang), logger)
    if len(results_question_query) == 0:
        logger.warning(f"{question_id}, {lang}: No natural language question label found")
        return None, [], None, None, None
    else:
        logger.info(f"{question_id}, {lang}: Matching mentions to entities...")
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
            query_template = re.sub(r'\b' + re.escape("wd:" + matched_mentions[idx]["entity"]) + r'((?= )|(?=\?)|(?=\))|(?=\}))', f"$entity_{idx}", query_template)
        return original_question, matched_mentions, question_template, query_template, visible_question


def get_all_templates(qawiki_endpoint_url, entity_prefix, boolean_values_dict, langs, logger):
    """Generates templates for all questions in QAWiki

    Parameters
    ----------
    qawiki_endpoint_url : str
        QAWiki Query Service endpoint
    entity_prefix : str
        QAWiki entity prefix url
    boolean_values_dict : dict{}
        Dictionary with QAWiki boolean values
    langs : list[] str
        list of languages
    logger : logging.Logger
        Log object
    Returns
    -------
    questions_output : dict{}
        output containing questions and its templates
    
    """
    query = """SELECT * WHERE { ?q wdt:P1 wd:Q1 }"""
    questions =  get_results(qawiki_endpoint_url, query, logger)
    questions_ids = [question[0]["value"].removeprefix(entity_prefix) for question in questions]
    return get_templates(questions_ids, qawiki_endpoint_url, entity_prefix, boolean_values_dict, langs, logger)

def get_templates(questions_ids, qawiki_endpoint_url, entity_prefix, boolean_values_dict, langs, logger):
    """Generates templates for a list of QIDs from QAWiki

    Parameters
    ----------
    questions_ids : list[] str
        QAWiki questions QIDs
    qawiki_endpoint_url : str
        QAWiki Query Service endpoint
    entity_prefix : str
        QAWiki entity prefix url
    boolean_values_dict : dict{}
        Dictionary with QAWiki boolean values
    langs : list[] str
        list of languages
    logger : logging.Logger
        Log object
    Returns
    -------
    questions_output : dict{}
        output containing questions and its templates
    
    """
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
        logger.info(f"{question_id}: Generating template...")
        try:
            item = {"id": question_id}
            raw_query =  get_qawiki_question_query(item["id"], qawiki_endpoint_url, logger)
            contingent_question = get_props_qualif(qawiki_endpoint_url, cont_question_query.format(question_id), logger)
            if len(contingent_question) > 0:
                logger.info(f"{question_id}: Obtaining contingent question data...")
                item["contingent_question"] = {}
                item["contingent_question"]["id"] = contingent_question[0]["mention"].removeprefix(entity_prefix) 
                item["contingent_question"]["query_raw"] =  get_qawiki_question_query(item["contingent_question"]["id"], qawiki_endpoint_url, logger)
                expected_value = contingent_question[0]["entity"].removeprefix(entity_prefix) 
                item["contingent_question"]["expected_value"] = boolean_values_dict[expected_value]
                logger.info(f"{question_id}: Successfully obtained contingent question data")
                
            else:
                item["contingent_question"] = None
            for lang in langs:
                item[f"question_{lang}"], item[f"matches_{lang}"], item[f"question_template_{lang}"], item[f"query_template_{lang}"], item[f"visible_question_{lang}"] = generate_templates(lang, item["id"], raw_query, qawiki_endpoint_url, logger)
                if item["contingent_question"] != None:
                    contingent_question_label = get_results(qawiki_endpoint_url, get_question_query.format(item["contingent_question"]["id"], lang), logger)
                    if len(contingent_question_label) == 0:
                        item["contingent_question"][f"question_raw_{lang}"] = None
                    else:
                        item["contingent_question"][f"question_raw_{lang}"] = contingent_question_label[0][0]["value"]
                    item["contingent_question"] = generate_templates_cont_question(item["contingent_question"], item[f"matches_{lang}"], lang)
            logger.info(f"{question_id}: Template created successfully")
            questions_output.append(item)
        except Exception as e:
            logger.error(f"{question_id}: Couldn't generate template \n {e}")
            continue
    return questions_output