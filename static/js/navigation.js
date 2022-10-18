/*
Navigation/displaying functions
*/
function hideMainInputBox(){
    $("#source").addClass('hidden');
}

function showMainInputBox(){
    $("#source").removeClass('hidden');
}

function showQAWikiLink(questionId){
    $("#qawiki-link").attr("href", "http://qawiki.dcc.uchile.cl/wiki/Item:" + questionId)
    $("#qawiki-link").removeClass('hidden');
}

function hideQAWikiLink(){
    $("#qawiki-link").addClass('hidden');
}

function goBack(){
    window.history.replaceState({}, document.title, "/");
    hideGoBack();
    hideTemplateForm();
    hideQAWikiLink();
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

function hideContQuestionResults(){
    $("#cont-question-data").empty();
    $("#cont-question").addClass('hidden');
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

async function loadResults(results, query){
    let parsedResults = await parser(results);
    $("#results").removeClass('hidden');
    $("#wikidata-query-link").attr("href", "https://query.wikidata.org/#" + query)
    $("#answer").append(parsedResults);
}
function showResults() {
    $("#results").removeClass('hidden');
}
async function loadContQuestionResults(results, query, question){
    let parsedResults = await parser(results);
    $("#cont-question").removeClass('hidden');
    $("#wikidata-query-link").attr("href", "https://query.wikidata.org/#" + query)
    $("#cont-question-data").append("<h5>{}</h5>".replace("{}", question));
    $("#cont-question-data").append(parsedResults);
}

function loadError(lang){
    $("#results").removeClass('hidden');
    $("#answer").append(messagesData["wikidata-error"][lang]);
    }

function loadTemplateForm(questionId, lang){
    hideMainInputBox();
    questionData = getQuestionData(questionId);
    showQAWikiLink(questionId);
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
