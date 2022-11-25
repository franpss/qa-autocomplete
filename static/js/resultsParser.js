
/*
Auxiliary functions to gather entities from the results and make a single request 
to Wikidata for additional information (label, description and image).
*/
function getEntitiesList(items) {
    let output = []
    for(var i = 0; i < items.length; i++)
    {
        for(var j = 0; j < items[i].length; j++)
        {
            if (items[i][j].value.includes(wikidataUrl) && output.indexOf(items[i][j] < 0)){
                output.push(items[i][j].value.replace(wikidataUrl, "wd:"))
            }
        }
    }
    return output
}

/*
Functions to fetch entities info from Wikidata.
*/
async function getInfoUriAnswers(entitiesList){
    let lang =  $("#lang-select").val();
    let filledPreviewQuery = previewEntityQuery.replace("{entitiesIds}", entitiesList.join(" ")).replaceAll("{lang}", lang);
    var previewInfo = await $.ajax({
        url: "/wikibase_results",
        type: "GET",
        dataType: "json",
        data: {'query': filledPreviewQuery}
    });
    return previewInfo
}

async function getInfoUriAnswersByBlocks(entitiesList, blockSize=200) {
    if (entitiesList.length <= blockSize) {
        let results = await getInfoUriAnswers(entitiesList);
        return results.answer;
    }
    else {
        output = []; 
        for (var i = 0; i < entitiesList.length; i+=blockSize) {
            let blockResults = await getInfoUriAnswers(entitiesList.slice(i, i + blockSize));
            output = output.concat(blockResults.answer)
        }
        return output
    }
}

/*
Parsing functions
*/
function booleanAnswer(results, lang){
    let result = results.answer.boolean;
    if (result){
        return "<h4>" + messagesData["true"][lang] + "<h4>"
    }
    else {
        return "<h4>" + messagesData["false"][lang] + "<h4>"
        }
    }

function literalAnswer(result){
    let answer = result.value.replace("T00:00:00Z", "");;
    return "<h4>{}</h4>".replace("{}", answer);
}

function answerParser(answer, infoUriAnswers) {
    if (answer.type == "uri"){
        let answerInfo = infoUriAnswers.find((item) => item[0].value === answer.value)
        if (answerInfo) {
            let url = answerInfo[0].value;
            let label = "value" in answerInfo[1]? answerInfo[1].value : null;
            let desc = "value" in answerInfo[2]? answerInfo[2].value : null;
            let img = "value" in answerInfo[3]? answerInfo[3].value : null;
            return `
            <div style="overflow: hidden;margin-bottom: 10px">
            <p>
            {img}
            {label}
            {desc}
            </p>
            </div>
            `
            .replace("{label}", label? "<h4><a href='{url}'>{label}</a></h4>"
                .replace("{url}", url).replace("{label}", label) : "<h4><a href='{url}'>{entityId}</a></h4>"
                    .replace("{url}", url)).replace("{entityId}", url.replace(wikidataUrl, ""))
            .replace("{desc}", desc? "<h5>{desc}</h5>".replace("{desc}", desc) : "")
            .replace("{img}", img? "<img src='{img}' alt='entity image' class='entity-img'>".replace("{img}", img.replace(/'/g, "%27")) : "");
        }
        else {
            return "<h4><a href='{url}'>{url}</a></h4>".replaceAll("{url}", answer.value)
        }
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
        let entitiesList = getEntitiesList(answers);
        let infoUriAnswers = await getInfoUriAnswersByBlocks(entitiesList)
        var output = [];
        rows = "";
        for(var i = 0; i < answers.length; i++)
        {
            if (answers[i].length > 1){
                cols = "";
                for (var j = 0; j < answers[i].length; j++){
                    cols = cols + "<td>{}</td>".replace("{}", answerParser(answers[i][j], infoUriAnswers));
                }
                rows = rows + "<tr>{}</tr>".replace("{}", cols);
            } 
            else {
                output.push(answerParser(answers[i][0], infoUriAnswers));
            }
            
        }
        if (rows != ""){
            output.push("<table style='table-layout:fixed;' class='table table-bordered'>{}</table>".replace("{}", rows))
        }
        return output;
    }   
}