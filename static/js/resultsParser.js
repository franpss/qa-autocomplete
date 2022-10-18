var previewEntityQuery = `
SELECT ?label ?desc ?thumb
WHERE {
  VALUES ?sbj { wd:{entityId} }
  OPTIONAL { ?sbj rdfs:label ?label . FILTER(lang(?label)="{lang}") }
  OPTIONAL { ?sbj wdt:P18 ?image . }
  OPTIONAL { ?sbj schema:description ?desc . FILTER(lang(?desc)="{lang}") }
  BIND(REPLACE(wikibase:decodeUri(STR(?image)), "http://commons.wikimedia.org/wiki/Special:FilePath/", "") as ?fileName) .
  BIND(REPLACE(?fileName, " ", "_") as ?safeFileName)
  BIND(MD5(?safeFileName) as ?fileNameMD5) .
  BIND(CONCAT("https://upload.wikimedia.org/wikipedia/commons/thumb/", 
              SUBSTR(?fileNameMD5, 1, 1), "/", 
              SUBSTR(?fileNameMD5, 1, 2), "/", 
              ?safeFileName, "/100px-", ?safeFileName) as ?thumb)
}
`
function booleanAnswer(results, lang){
    let result = results.answer.boolean;
    if (result){
        return "<h4>" + messagesData["true"][lang] + "<h4>"
    }
    else {
        return "<h4>" + messagesData["false"][lang] + "<h4>"
        }
    }

async function uriAnswer(result){
    let url = result.value;
    let wikidataUrl = "http://www.wikidata.org/entity/";
    let lang =  $("#lang-select").val();
    if (url.includes(wikidataUrl)) {
        let entityId = url.replace("http://www.wikidata.org/entity/", "");
        let filledPreviewQuery = previewEntityQuery.replace("{entityId}", entityId).replaceAll("{lang}", lang);
        var previewInfo = await $.ajax({
            url: "/wikibase_results",
            type: "GET",
            dataType: "json",
            data: {'query': filledPreviewQuery}
        });
        if (previewInfo.answer.length > 0) {
            let label = "value" in previewInfo.answer[0][0]? previewInfo.answer[0][0].value : null;
            let desc = "value" in previewInfo.answer[0][1]? previewInfo.answer[0][1].value : null;
            let img = "value" in previewInfo.answer[0][2]? previewInfo.answer[0][2].value : null;
            return `
            <div style="overflow: hidden;">
            <p>
            {img}
            {label}
            {desc}
            </p>
            </div>
            `
            .replace("{label}", label? "<h4><a href='{url}'>{label}</a></h4>".replace("{url}", url).replace("{label}", label) : "<h4><a href='{url}'>{url}</a></h4>".replaceAll("{url}", url))
            .replace("{desc}", desc? "<h5>{desc}</h5>".replace("{desc}", desc) : "")
            .replace("{img}", img? "<img src='{img}' alt='entity image'>".replace("{img}", img) : "");
        }
        else {
            return "<h4><a href='{url}'>{url}</a></h4>".replaceAll("{url}", url)
        }
        
    }
    else {
        return "<h4><a href='{url}'>{url}</a></h4>".replaceAll("{url}", url)
    }
    
        
    
}

function literalAnswer(result){
    let answer = result.value;
    return "<h4>{}</h4>".replace("{}", answer);
}

async function answerParser(answer) {
    if (answer.type == "uri"){
        return await uriAnswer(answer);
    }
    else if (answer.type == "literal"){
        return(literalAnswer(answer));
    }
}

async function parser(results){
    let lang =  $("#lang-select").val();
    let answers = results.answer;
    if (answers.length == 0) {
        return messagesData["no-results"][lang]
    }
    if ("boolean" in answers){
        return booleanAnswer(results, lang);
    }
    else {
        var output = [];
        rows = "";
        for(var i = 0; i < answers.length; i++)
        {
            
            if (answers[i].length > 1){
                cols = "";
                for (var j = 0; j < answers[i].length; j++){
                    cols = cols + "<td>{}</td>".replace("{}", await answerParser(answers[i][j]));
                }
                rows = rows + "<tr>{}</tr>".replace("{}", cols);
            } 
            else {
                output.push(await answerParser(answers[i][0]));
            }
            
        }
        if (rows != ""){
            output.push("<table class='table table-bordered'>{}</table>".replace("{}", rows))
        }
        return output;
    }
    
}