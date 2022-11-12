import json
import os
import sys
import time
sys.path.insert(0, '.')
from scripts.templates import get_templates
from dotenv import load_dotenv
load_dotenv()

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

def templates_update(qawiki_endpoint, qawiki_entity_prefix, boolean_values_dict="static/QAWikiBooleanValues.json"):
    """Calls needed functions to update templates.

    Parameters
    ----------
    qawiki_endpoint : str
        QAWiki endpoint url
    qawiki_entity_prefix : str
        QAWiki entity prefix url
    boolean_values_dict : str
        QAWiki endpoint url
    """
    print("Updating templates...")
    t0 = time.time()
    templates = get_templates(qawiki_endpoint, qawiki_entity_prefix, boolean_values_dict)
    save_json(templates)
    tf = time.time()
    print(f"Templates updated. Time elapsed: {tf - t0} seconds.")
 