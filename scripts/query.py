import requests

def get_results(url, query, f="json"):
    r = requests.get(url, params = {'format': f, 'query': query})
    data = r.json()
    if "vars" in data["head"]:
        var_name = data["head"]["vars"][0]
        results = [item[var_name] for item in data["results"]["bindings"]]
        return results
    else:
        return data

def get_mentions(url, query, f="json"):
    r = requests.get(url, params = {'format': f, 'query': query})
    data = r.json()
    data_copy = data["results"]["bindings"].copy()
    for item in data_copy:
        item["propertyValue"] = item["propertyValue"]["value"]
        item["qualifierValue"] = item["qualifierValue"]["value"]
    return data_copy
    