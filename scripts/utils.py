from query import get_results

def filter_questions(response):
    items = ["wd:" + item['id'] for item in response["search"]]
    qawiki_endpoint_url = "http://query.qawiki.dcc.uchile.cl/proxy/wdqs/bigdata/namespace/wdq/sparql"
    filter_qs_query = """SELECT * WHERE {{ ?s wdt:P1 wd:Q1 . VALUES ?s {{ {} }} }}"""
    qawiki_qs =  get_results(qawiki_endpoint_url, filter_qs_query.format(" ".join(items)))
    qs_values = [item["value"] for item in qawiki_qs]
    search_filtered = [item for item in response["search"] if item["concepturi"] in qs_values]
    response_filtered = response.copy()
    response_filtered["search"] = search_filtered
    return response_filtered
