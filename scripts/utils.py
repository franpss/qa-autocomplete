import json
import os
import sys
sys.path.insert(0, '.')
from scripts.templates import get_templates


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

        
# from dotenv import load_dotenv
# load_dotenv()

# save_json(get_templates(os.environ.get("QAWIKI_ENDPOINT")))
 