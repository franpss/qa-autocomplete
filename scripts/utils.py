import json
import os
import sys
import time
sys.path.insert(0, '.')
from scripts.templates import get_all_templates, get_templates
from dotenv import load_dotenv
load_dotenv()

BOOLEAN_VALUES_DICT_PATH = "static/QAWikiBooleanValues.json"
LANGS = ["en", "es"] 
TEMPLATES_PATH = 'static/cached_questions'
TEMPLATES_FILENAME = 'templates.json'

def save_json(dic, path=TEMPLATES_PATH, filename=TEMPLATES_FILENAME):
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

def read_json(path):
    """Reads a json file and returns it as a dict.

    Parameters
    ----------
    path : str
        path of json file

    Returns
    -------
    data: Dict[]
        parsed json file as a dict
    """
    with open(path, encoding="utf8") as json_file:
        data = json.load(json_file)
        return data

def templates_update(qawiki_endpoint, qawiki_entity_prefix, boolean_values_dict=read_json(BOOLEAN_VALUES_DICT_PATH), langs=LANGS):
    """Calls needed functions to update templates.

    Parameters
    ----------
    qawiki_endpoint : str
        QAWiki endpoint url
    qawiki_entity_prefix : str
        QAWiki entity prefix url
    boolean_values_dict : str
        QAWiki endpoint url
    langs : list[] str
        list of languages
    """
    print("Updating templates...")
    t0 = time.time()
    templates = get_all_templates(qawiki_endpoint, qawiki_entity_prefix, boolean_values_dict, langs)
    if templates is not None and len(templates) > 0:
        save_json(templates)
        tf = time.time()
        print(f"Templates updated. Time elapsed: {tf - t0} seconds.")
    else:
        tf = time.time()
        print(f"Templates were not updated. An empty list or null value was returned. Time elapsed: {tf - t0} seconds.")
    

def template_update(question_id, qawiki_endpoint, qawiki_entity_prefix, boolean_values_dict=read_json(BOOLEAN_VALUES_DICT_PATH), langs=LANGS):
    """Updates (or adds if it doesn't exist) a particular question template from QAWiki.

    Parameters
    ----------
    question_id : str
        QAWiki QID for question to add or update
    qawiki_endpoint : str
        QAWiki endpoint url
    qawiki_entity_prefix : str
        QAWiki entity prefix url
    boolean_values_dict : str
        QAWiki endpoint url
    langs : list[] str
        list of languages
    """
    t0 = time.time()
    template = get_templates([question_id], qawiki_endpoint, qawiki_entity_prefix, boolean_values_dict, langs)
    if template is not None and len(template) > 0:
        templates = read_json(os.path.join(TEMPLATES_PATH, TEMPLATES_FILENAME))
        old_template_idx = next((index for (index, d) in enumerate(templates) if d["id"] == question_id), None)
        if old_template_idx is not None:
            templates[old_template_idx] = template[0]
            save_json(templates)
            tf = time.time()
            return f"Template {question_id} updated. Time elapsed: {tf - t0} seconds.", 1
        else:
            templates.append(template[0])
            save_json(template)
            tf = time.time()
            return f"Template {question_id} added. Time elapsed: {tf - t0} seconds.", 1
    else:
        tf = time.time()
        return f"Templates were not updated. An empty list or null value was returned.", 0
