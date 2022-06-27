import sys
from xml.dom.pulldom import END_DOCUMENT
from SPARQLWrapper import SPARQLWrapper, JSON
import requests


def get_results(endpoint_url, query, f=JSON):
    user_agent = "WDQS-example Python/%s.%s" % (sys.version_info[0], sys.version_info[1])
    # TODO adjust user agent; see https://w.wiki/CX6
    sparql = SPARQLWrapper(endpoint_url, agent=user_agent)
    sparql.setTimeout(1000)
    sparql.setQuery(query)
    sparql.setReturnFormat(f)
    output = sparql.query().convert()
    var_name = output["head"]["vars"][0]
    results = [item[var_name] for item in output["results"]["bindings"]]
    return results



# results = get_results(endpoint_url, query)
# for result in results["results"]["bindings"]:
#     print(result)

# url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
# data = requests.get(url, params={'query': query, 'format': 'json'}).json()
# print(data)