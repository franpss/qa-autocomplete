import sys
from SPARQLWrapper import SPARQLWrapper, JSON
import requests

endpoint_url = "http://query.qawiki.dcc.uchile.cl/proxy/wdqs/bigdata/namespace/wdq/sparql"#"https://query.wikidata.org/sparql"

query = """
SELECT ?x WHERE {
  VALUES ?q {  wd:Q187 }
  ?q wdt:P11 ?x}"""


def get_results(endpoint_url, query):
    user_agent = "WDQS-example Python/%s.%s" % (sys.version_info[0], sys.version_info[1])
    # TODO adjust user agent; see https://w.wiki/CX6
    sparql = SPARQLWrapper(endpoint_url, agent=user_agent)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    return sparql.query().convert()


results = get_results(endpoint_url, query)
for result in results["results"]["bindings"]:
    print(result)

# url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
# data = requests.get(url, params={'query': query, 'format': 'json'}).json()
# print(data)