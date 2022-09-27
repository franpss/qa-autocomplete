var question_data;

/*
Async functions to load json data
*/

async function loadQuestionsData() {
    let result = $.getJSON(questions_json, function (data) {
        questions_data = data;
    });
    await result;
}
async function loadMessagesData() {
    let result = $.getJSON(messages_json, function (data) {
        messages_data = data;
    });
    await result;
}

/*
Navigation/displaying functions
*/
function hideMainInputBox(){
    $("#source").addClass('hidden');
}

function showMainInputBox(){
    $("#source").removeClass('hidden');
}

function goBack(){
    hideGoBack();
    hideTemplateForm();
    cleanForm();
    hideResults();
    showMainInputBox();
}

function showGoBack(){
    $("#home").removeClass('hidden');
}

function hideGoBack(){
    $("#home").addClass('hidden');
}

function showTemplateForm(){
    $("#template-form").removeClass('hidden');
}

function hideTemplateForm(){
    $("#template-form").addClass('hidden');
}

function hideResults(){
    $("#answer").empty();
    $("#results").addClass('hidden');
}

function loadScreen(){
    let loadingScreen = $("#loading");
    loadingScreen.removeClass('hidden');
}

function hideLoadScreen(){
    let loadingScreen = $("#loading");
    loadingScreen.addClass('hidden');
}

function cleanForm(){
    $('#template-form').find('*').not('.search-button').remove();
}

function loadResults(results){
    $("#results").removeClass('hidden');
    let parsedResults = parser(results);
    $("#answer").append(parsedResults);
}

function loadError(lang){
    $("#results").removeClass('hidden');
    $("#answer").append(messages_data["wikidata-error"][lang]);
    }


/*
Autocomplete functions (main and templates)
*/

function fillMainAutocomplete() {
    let lang =  $("#lang-select").val();
    console.log("lang", lang);
    
    var data_arr = $.map(questions_data, function(item) {
        return {
            label: item["visible_question_"+lang],
            value: item.id,
            };
        });
    $("#source").autocomplete({  
        source : data_arr,
        focus: function (event, ui) {
            event.preventDefault();
            $(event.target).val(ui.item.label);
        },
        select: function( event, ui ) { 
            event.preventDefault();
            hideMainInputBox();
            question_data = getQuestionData(ui.item.value);
            generateTemplateForm(question_data, lang);
            autocompleteTemplateForm();
            showTemplateForm();
            showGoBack();
        },                     
    })
}

function autocompleteTemplateForm() {
    let lang = $("#lang-select").val();

    $('form#template-form').find('*[id*=entity]').each(function() {
        $(this).on("input", function() {
            var input = this.value;
            if (this.value.length > 0) {
                $(this).autocomplete({
                    source: function(request, response) {
                        $.ajax({
                            type: "POST",
                            url: "/wikidata_search",
                            dataType: "json",
                            data: {
                                'data': input,
                                'lang': lang
                            },
                            success: function(data) {
                                response($.map(data.search, function(item, i) {
                                    //alert(item.value);
                                    return {
                                        label: item.label,
                                        value: item.value,
                                        desc: item.desc
                                    }
                                }));
                            },
                            error: function(data) {
                                return []; // todo
                            }
                        });
                    },
                    focus: function(event, ui) {
                        event.preventDefault()
                        $(event.target).val(ui.item.label);
                    },
                    select: function(event, ui) {
                        event.preventDefault()
                        $(event.target).val(ui.item.label);
                        hideError(this);

                    }
                }).autocomplete("instance")._renderItem = function(ul, item) {
                    return $("<li>")
                        .append("<div>" + item.label + "<br>" + item.desc + "</div>")
                        .appendTo(ul);
                };
            }
        });
    });
}

/*
Template form functions
*/

function generateTemplateForm(question_data, lang){
    let question_template = question_data["question_template_" + lang];
    let mentions = question_data["mentions_" + lang];
    let mention_regex = /\$mention_[0-9]+/
    let question_template_l = question_template.split(/(\$[a-z]+_[0-9]+)/);
    let html = ""
    question_template_l.forEach(function (item, index) {
        if (mention_regex.test(item)){
            let mention_id = item.split("_")[1];
            let mention_text = mentions[parseInt(mention_id)];
            html = html.concat('<input type="text" placeholder="' + mention_text + '" class="italic-placeholder form-control input-sm" id="entity-' + mention_id + '">')
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
    let question_data = window.question_data;
    let entities_values = [];
    $('form#template-form').find('*[id*=entity]').each(function() {
        let idx = this.id.split("-")[1];
        entities_values[idx] = $(this).data("uiAutocomplete").selectedItem.value;
    })
    let query_template = question_data["query_template_" + lang]
    let entity_regex = /(\$entity_[0-9]+)/;
    let query_template_l = query_template.split(/(\$[a-z]+_[0-9]+)/);
    query_template_l.forEach(function (item, index) {
        if (entity_regex.test(item)){
            let template_entity_idx = item.split("_")[1];
            query_template_l[index] = "wd:" + entities_values[template_entity_idx];
        }
    })
    return query_template_l.join("");
}

/*
General auxiliary functions
*/
function getQuestionIndex(questions_data, question_id){
    let index = questions_data.findIndex(function(question) {
        return question.id == question_id
      });
    return index
}

function getQuestionData(question_id){
    let index = getQuestionIndex(questions_data, question_id);
    let question_data = questions_data[index];
    return question_data;
}


/*
Events handling
*/

$("#lang-select").on("change", function(){
    fillMainAutocomplete()
});

function getResults() {
    let query = generateQuery();
    let lang =  $("#lang-select").val();
    hideResults();
    loadScreen();
    $.ajax({
        url: "/wikibase_results",
        type: "GET",
        dataType: "json",
        data: {'query': query},
                    
        success: function (response) {
            hideLoadScreen();
            loadResults(response);
        },
        error: function (response) {
            hideLoadScreen()
            loadError(lang)
        },
        timeout: 3000
    });
};
        

/*
Initial setup
*/

$(document).ready(async function(){
    await initialSetup();
    
});

async function initialSetup() {
    loadQuestionsData()
    .then(loadMessagesData)
    .then(fillMainAutocomplete)
}