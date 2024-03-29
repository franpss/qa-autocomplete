/*
Global variables
*/
var previewEntityQuery = `
SELECT ?sbj ?label ?desc ?thumb
WHERE {
  VALUES ?sbj { {entitiesIds} }
  OPTIONAL { ?sbj rdfs:label ?labelLang . FILTER(lang(?labelLang)="{lang}") }
  OPTIONAL { ?sbj rdfs:label ?labelEn . FILTER(lang(?labelEn)="en") }
  OPTIONAL { ?sbj wdt:P18 ?image . }
  OPTIONAL { ?sbj schema:description ?desc . FILTER(lang(?desc)="{lang}") }
  BIND(REPLACE(wikibase:decodeUri(STR(?image)), "http://commons.wikimedia.org/wiki/Special:FilePath/", "") as ?fileName) .
  BIND(REPLACE(?fileName, " ", "_") as ?safeFileName)
  BIND(MD5(?safeFileName) as ?fileNameMD5) .
  BIND(CONCAT("https://upload.wikimedia.org/wikipedia/commons/thumb/", 
              SUBSTR(?fileNameMD5, 1, 1), "/", 
              SUBSTR(?fileNameMD5, 1, 2), "/", 
              ?safeFileName, "/100px-", ?safeFileName, IF(regex(?safeFileName, ".svg"), ".png", "")) as ?thumb)
  BIND(COALESCE(?labelLang,?labelEn) AS ?label)
}


`
var qaWikiUrl = "http://qawiki.org/"
var wikidataUrl = "http://www.wikidata.org/entity/";
var qaWikiHomeUrl = qaWikiUrl + "wiki/Main_Page"
var wikidataQueryLink = "https://query.wikidata.org/#"
var qaWikiItemUrl = qaWikiUrl + "wiki/Item:"
var repoUrl = "https://github.com/franpss/qa-autocomplete"
var accentMap = {
    "á": "a",
    "é": "e",
    "í": "i",
    "ó": "o",
    "ú": "u"
  };
var forcedResults = false;
