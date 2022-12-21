import json
import os
import sys
import time
sys.path.insert(0, '.')
from scripts.templates import get_all_templates, get_templates
from dotenv import load_dotenv
import logging
load_dotenv()

BOOLEAN_VALUES_DICT_PATH = "static/QAWikiBooleanValues.json"
MESSAGES_JSON_PATH = "static/messages.json"
LANGS = json.loads(os.environ.get("LANGS"))
TEMPLATES_PATH = 'static/cached_questions'
TEMPLATES_FILENAME = 'templates.json'
LOG_PATH = 'logs'

def setup_logger(name, log_filename, log_dir, level="info"):
    """Loads or sets up a new log.

    Parameters
    ----------
    name : str
        Logger name.
    log_filename : str
        Log filename.
    log_dir : str
        Path to log file.
    level : str
        Base level of the logger.

    Returns
    -------
    logging.Logger
        The loaded or new log.
    """
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    handler = logging.FileHandler(os.path.join(log_dir, log_filename))
    logs_formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    handler.setFormatter(logs_formatter)
    logger = logging.getLogger(name)
    if level == "debug":
        logger.setLevel(logging.DEBUG)
    elif level == "info":
        logger.setLevel(logging.INFO)
    elif level == "warning":
        logger.setLevel(logging.WARNING)
    elif level == "error":
        logger.setLevel(logging.ERROR)
    elif level == "critical":
        logger.setLevel(logging.CRITICAL)
    logger.addHandler(handler)
    return logger

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

def templates_update(qawiki_endpoint, qawiki_entity_prefix, logger, boolean_values_dict=read_json(BOOLEAN_VALUES_DICT_PATH), langs=LANGS):
    """Calls needed functions to update templates.

    Parameters
    ----------
    qawiki_endpoint : str
        QAWiki endpoint url
    qawiki_entity_prefix : str
        QAWiki entity prefix url
    logger : logging.Logger
        Log object
    boolean_values_dict : str
        QAWiki endpoint url
    langs : list[] str
        list of languages
    """
    logger.info(f"Updating templates by scheduled task...")
    t0 = time.time()
    templates = get_all_templates(qawiki_endpoint, qawiki_entity_prefix, boolean_values_dict, langs, logger)
    if templates is not None and len(templates) > 0:
        save_json(templates)
        tf = time.time()
        logger.info(f"Templates updated. Time elapsed: {tf - t0} seconds.")
    else:
        tf = time.time()
        logger.error(f"Templates were not updated. An empty list or null value was returned. Time elapsed: {tf - t0} seconds.")
    

def template_update(question_id, qawiki_endpoint, qawiki_entity_prefix, logger, lang, messages_dict=read_json(MESSAGES_JSON_PATH), boolean_values_dict=read_json(BOOLEAN_VALUES_DICT_PATH), langs=LANGS):
    """Updates (or adds if it doesn't exist) a particular question template from QAWiki.

    Parameters
    ----------
    question_id : str
        QAWiki QID for question to add or update
    qawiki_endpoint : str
        QAWiki endpoint url
    qawiki_entity_prefix : str
        QAWiki entity prefix url
    logger : logging.Logger
        Log object
    lang : string
        Current language to return message
    messages_dict : dict{}
        Dictionary with messages in available languages
    boolean_values_dict : dict{}
        Dictionary with QAWiki boolean values
    langs : list[] str
        list of languages
    Returns
    -------
    message: str
        output message in selected language
    status_code: int
        1 if template generation was successful, 0 otherwise
    """
    logger.info(f"{question_id}: Requested template update")
    t0 = time.time()
    template = get_templates([question_id], qawiki_endpoint, qawiki_entity_prefix, boolean_values_dict, langs, logger)
    if template is not None and len(template) > 0:
        templates = read_json(os.path.join(TEMPLATES_PATH, TEMPLATES_FILENAME))
        old_template_idx = next((index for (index, d) in enumerate(templates) if d["id"] == question_id), None)
        if old_template_idx is not None:
            templates[old_template_idx] = template[0]
            save_json(templates)
            tf = time.time()
            logger.info(f"{question_id}: Template updated. Time elapsed: {tf - t0} seconds.")
            return messages_dict["updated-template"][lang].format(tf-t0), 1
        else:
            templates.append(template[0])
            save_json(template)
            tf = time.time()
            logger.info(f"{question_id}: Template added. Time elapsed: {tf - t0} seconds.")
            return messages_dict["added-template"][lang].format(tf-t0), 1
    else:
        logger.error(f"{question_id}: Template was not updated. An empty list or null value was returned.")
        return messages_dict["update-template-error"][lang], 0

logger = setup_logger(str(time.time()), "logs.log", LOG_PATH)
