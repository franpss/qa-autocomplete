function booleanAnswer(results, lang){
    let result = results.answer.boolean;
    if (result){
        return "<h4>" + messagesData["boolean-true"][lang] + "<h4>"
    }
    else {
        return "<h4>" + messagesData["boolean-false"][lang] + "<h4>"
        }
    }

function uriAnswer(result){
    let url = result.value;
    return "<h4><a href='{}'>{}</a></h4>".replaceAll("{}", url);
}

function literalAnswer(result){
    let answer = result.value;
    return "<h4>{}</h4>".replace("{}", answer);
}

function parser(results){
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
        for(var i = 0; i < answers.length; i++)
        {
            if (answers[i].type == "uri"){
                output.push(uriAnswer(answers[i]));
            }
            else if (answers[i].type == "literal"){
                output.push(literalAnswer(answers[i]));
            }
        }
        return output;
    }
    
}