/*
Template form functions
*/

function generateTemplateForm(questionData, lang){
    let questionTemplate = questionData["question_template_" + lang];
    let matches = questionData["matches_" + lang];
    let mentions = matches.map(item => item["mention"])
    let mentionRegex = /\$mention_[0-9]+/
    let questionTemplateList = questionTemplate.split(/(\$[a-z]+_[0-9]+)/);
    let html = ""
    questionTemplateList.forEach(function (item, index) {
        if (mentionRegex.test(item)){
            let mentionId = item.split("_")[1];
            let mentionText = mentions[parseInt(mentionId)];
            html = html.concat('<input type="text" placeholder="' + mentionText + '" class="italic-placeholder form-control input-sm" id="entity-' + mentionId + '">')
        }
        else {
            html = html.concat('<span class="template-text">' + item + '</span>')
        }
      });
      $("#template-form").prepend($(html));
}

/*
Functions for query generation in SPARQL from templates
*/

function generateQuery(){
    let lang =  $("#lang-select").val();
    let questionData = window.questionData;
    let entitiesValues = [];
    $('form#template-form').find('*[id*=entity]').each(function() {
        let idx = this.id.split("-")[1];
        entitiesValues[idx] = $(this).data("uiAutocomplete").selectedItem.value;
    })
    let queryTemplate = questionData["query_template_" + lang]
    let entityRegex = /(\$entity_[0-9]+)/;
    let queryTemplateList = queryTemplate.split(/(\$[a-z]+_[0-9]+)/);
    queryTemplateList.forEach(function (item, index) {
        if (entityRegex.test(item)){
            let templateEntityIdx = item.split("_")[1];
            queryTemplateList[index] = "wd:" + entitiesValues[templateEntityIdx];
        }
    })
    return queryTemplateList.join("");
}

function generateContQuestionQuery() {
    let lang =  $("#lang-select").val();
    let questionData = window.questionData;
    let entitiesValues = [];
    let mentionsValues = [];
    $('form#template-form').find('*[id*=entity]').each(function() {
        let idx = this.id.split("-")[1];
        entitiesValues[idx] = $(this).data("uiAutocomplete").selectedItem.value;
        mentionsValues[idx] = $(this).data("uiAutocomplete").selectedItem.label;
    })

    let queryTemplate = questionData["contingent_question"]["query_template_" + lang]
    let questionTemplate = questionData["contingent_question"]["question_template_" + lang]
    let templateRegex = /(\$[a-z]+_[0-9]+)/;
    let queryTemplateList = queryTemplate.split(templateRegex);
    let questionTemplateList = questionTemplate.split(templateRegex);
    queryTemplateList.forEach(function (item, index) {
        if (templateRegex.test(item)){
            let templateEntityIdx = item.split("_")[1];
            queryTemplateList[index] = "wd:" + entitiesValues[templateEntityIdx];
        }
    })
    questionTemplateList.forEach(function (item, index) {
        if (templateRegex.test(item)){
            let templateMentionIdx = item.split("_")[1];
            questionTemplateList[index] = mentionsValues[templateMentionIdx];
        }
    })
    return {"question": questionTemplateList.join(""), "query": queryTemplateList.join("")};
}

