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

function loadResults(results, query){
    $("#results").removeClass('hidden');
    $("#wikidata-query-link").empty();
    let parsedResults = parser(results);
    $("#wikidata-query-link").append("<a href='https://query.wikidata.org/#" + query + "' target='_blank'>Wikidata</a>");
    $("#answer").append(parsedResults);
}

function loadError(lang){
    $("#results").removeClass('hidden');
    $("#answer").append(messagesData["wikidata-error"][lang]);
    }

function loadTemplateForm(questionId, lang){
    hideMainInputBox();
    questionData = getQuestionData(questionId);
    generateTemplateForm(questionData, lang);
    autocompleteTemplateForm();
    showTemplateForm();
    showGoBack();
}

function getTemplateFromUrl() {
    let lang =  $("#lang-select").val();
    let url = window.location.pathname.split('/');
    let questionIdRegex = /[qQ][0-9]+/
    if (url.length == 3 && questionIdRegex.test(url[2])){
        loadTemplateForm(url[2].toUpperCase(), lang)
    }
}