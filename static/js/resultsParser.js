function booleanAnswer(results, lang){
    let result = results.answer.boolean;
    if (result){
        return "<h4>" + messagesData["true"][lang] + "<h4>"
    }
    else {
        return "<h4>" + messagesData["false"][lang] + "<h4>"
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

function answerParser(answer) {
    if (answer.type == "uri"){
        return(uriAnswer(answer));
    }
    else if (answer.type == "literal"){
        return(literalAnswer(answer));
    }
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
        rows = "";
        for(var i = 0; i < answers.length; i++)
        {
            
            if (answers[i].length > 1){
                cols = "";
                for (var j = 0; j < answers[i].length; j++){
                    cols = cols + "<td>{}</td>".replace("{}", answerParser(answers[i][j]));
                }
                rows = rows + "<tr>{}</tr>".replace("{}", cols);
            } 
            else {
                output.push(answerParser(answers[i][0]))
            }
            
        }
        if (rows != ""){
            output.push("<table class='table table-bordered'>{}</table>".replace("{}", rows))
        }
        return output;
    }
    
}