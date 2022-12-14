/*
Navigation/displaying functions
*/
function hideQueryLink(){
    $("#query-link").attr("style", "display: none !important");;
}

function showQueryLink(){
    $("#query-link").fadeIn('slow');
}

function hideMainInputBox(){
    $("#source").attr("style", "display: none !important");;
}

function showMainInputBox(){
    $("#source").fadeIn('slow');
}

function showQAWikiLink(questionId){
    $("#qawiki-link").attr("href", qaWikiItemUrl + questionId)
    $("#qawiki-link").fadeIn('slow');
}

function hideQAWikiLink(){
    $("#qawiki-link").attr("style", "display: none !important");;
}

function showUpdateLink(questionId){
    $("#update-link").attr("href", "/update_template/" + questionId)
    $("#update-link").fadeIn('slow');
}

function hideUpdateLink(){
    $("#update-link").attr("style", "display: none !important");;
}

function addMainPlaceholder() {
    let lang =  $("#lang-select").val();
    var dataArr = $.map(questionsData, function(item) {
        if (item["question_"+lang] != null){
            return item["question_"+lang]
        }
    });
    $("#source").attr("placeholder", dataArr[Math.floor(Math.random()*dataArr.length)]);
}

function showLangHelp(lang){
    $("#lang-select").popover({
        content: "<div class='check-lang'>" + messagesData["no-results-check-lang"][lang] + "</div>", 
        html: true,
        placement: "bottom",
    }).popover('show');
}

function hideLangHelp() {
    $("#lang-select").popover('destroy');
}

function initTemplateHelp(){
    $("#source").popover({
        content: "",
        html: true,
        placement: "top",
    });
}

function updateTemplateHelp(lang){
    let forcedContent = "<div class='bolded'> ⚠️" + messagesData["template-help"][lang] + "</div>"
    let content = "<div>" + messagesData["template-help"][lang] + "</div>"
    $('#source').data('bs.popover').options.content = forcedResults? forcedContent : content
    $("#source").popover('show');
}   
function hideTemplateHelp() {
    $("#source").popover('hide');
}

function showAbout() {
    hideMainInputBox();
    clearUrl();
    cleanMainForm();
    hideLoadScreen();
    hideQueryLink();
    showGoBack();
    hideTemplateForm();
    hideQAWikiLink();
    hideUpdateLink();
    cleanTemplateForm();
    hideResults();
    showAboutText();
}
function showUpdateTemplateModal(){
    $('#my-modal').modal();
}

function showAboutText() {
    $("#about-container").fadeIn('slow');
}

function hideAboutText() {
    $("#about-container").attr("style", "display: none !important");;
}

function goBack(){
    clearUrl();
    cleanMainForm();
    hideLoadScreen();
    hideQueryLink();
    hideGoBack();
    hideAboutText();
    hideTemplateForm();
    hideQAWikiLink();
    hideUpdateLink();
    cleanTemplateForm();
    hideResults();
    showMainInputBox();
}


function showGoBack(){
    $("#home").fadeIn('slow');
}

function clearUrl() {
    window.history.replaceState({}, document.title, "/");
}
function hideGoBack(){
    $("#home").attr("style", "display: none !important");;
}

function showTemplateForm(){
    $("#template-form").fadeIn('slow');
}

function hideTemplateForm(){
    $("#template-form").attr("style", "display: none !important");;
}

function hideResults(){
    $("#answer").empty();
    $("#results").attr("style", "display: none !important");;
}

function hideContQuestionResults(){
    $("#cont-question-data").empty();
    $("#cont-question").attr("style", "display: none !important");;
}

function loadScreen(){
    let loadingScreen = $("#loading");
    $("#query").prop('disabled', true);
    loadingScreen.fadeIn('slow');
}

function hideLoadScreen(){
    let loadingScreen = $("#loading");
    $("#query").prop('disabled', false);
    loadingScreen.attr("style", "display: none !important");;
}

function cleanMainForm(){
    $('#source').val('');
}

function cleanTemplateForm(){
    $("#template-form").find("*").not(".search-button").remove();
}

async function loadResults(results, query){
    let parsedResults = await parser(results);
    $("#results").fadeIn('slow');
    loadQueryLink(query);
    $("#answer").append(parsedResults);
}
function showResults() {
    $("#results").fadeIn('slow');
}

function loadQueryLink(query) {
    $("#wikidata-query-link").attr("href", wikidataQueryLink + query)
}
async function loadContQuestionResults(results, query, question){
    let parsedResults = await parser(results);
    $("#cont-question").fadeIn('slow');
    $("#cont-question-data").append("<h5>{}</h5>".replace("{}", question));
    $("#cont-question-data").append(parsedResults);
}

function loadError(lang){
    $("#results").fadeIn('slow');
    $("#answer").append(messagesData["wikidata-error"][lang]);
    }

function loadTemplateForm(questionId, lang){
    hideMainInputBox();
    questionData = getQuestionData(questionId);
    showQAWikiLink(questionId);
    showUpdateLink(questionId);
    generateTemplateForm(questionData, lang);
    autocompleteTemplateForm();
    showTemplateForm();
    showGoBack();
}

function getTemplateFromUrl() {
    let lang =  $("#lang-select").val();
    let url = window.location.pathname.split("/");
    let questionIdRegex = /[qQ][0-9]+/
    if (url.length == 3 && questionIdRegex.test(url[2])){
        loadTemplateForm(url[2].toUpperCase(), lang)
    }
}
