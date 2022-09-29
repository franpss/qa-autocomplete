var questionData;

/*
Async functions to load json data
*/

async function loadQuestionsData() {
    let result = $.getJSON(questionsJson, function (data) {
        questionsData = data;
    });
    await result;
}
async function loadMessagesData() {
    let result = $.getJSON(messagesJson, function (data) {
        messagesData = data;
    });
    await result;
}


/*
General auxiliary functions
*/
function getQuestionIndex(questionsData, questionId){
    let index = questionsData.findIndex(function(question) {
        return question.id == questionId
      });
    return index
}

function getQuestionData(questionId){
    let index = getQuestionIndex(questionsData, questionId);
    let questionData = questionsData[index];
    return questionData;
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
        }
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
    .then(getTemplateFromUrl)
}