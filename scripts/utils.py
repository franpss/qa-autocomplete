import json
import os
import sys
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

        
# qawiki_endpoint = os.environ.get("QAWIKI_ENDPOINT")
# entity_prefix = os.environ.get("ENTITY_PREFIX")
# boolean_values_dict = read_json("scripts/QAWikiBooleanValues.json")
# save_json(get_templates(qawiki_endpoint, entity_prefix, boolean_values_dict))
 
# from linkpreview import link_preview

# preview = link_preview("https://www.wikidata.org/wiki/Q306")
# print("title:", preview.title)
# print("description:", preview.description)
# print("image:", preview.image)
# print("force_title:", preview.force_title)
# print("absolute_image:", preview.absolute_image)