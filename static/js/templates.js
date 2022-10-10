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
