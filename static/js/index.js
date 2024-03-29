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

async function loadInputTokens() {
    let result = $.getJSON(inputTokensJson, function (data) {
        inputTokens = data;
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

$("body").click(function(){  
    $(".alert").alert("close");
});

async function getContQuestionResults(contQuery, contQuestion) {
    let questionData = window.questionData;
    let expectedValue = questionData["contingent_question"]["expected_value"]
    let lang =  $("#lang-select").val();
    hideContQuestionResults();
    loadQueryLink(contQuery);
    showQueryLink();
    $.ajax({
        url: "/wikibase_results",
        type: "GET",
        dataType: "json",
        data: {'query': contQuery},
                    
        success: async function (response) {
            
            if (response["answer"]["boolean"] && expectedValue ||
             (!response["answer"]["boolean"] && !expectedValue)){
                let query = generateQuery();
                $.ajax({
                    url: "/wikibase_results",
                    type: "GET",
                    dataType: "json",
                    data: {'query': query},
                                
                    success: async function (response) {
                        await loadResults(response, query);
                        hideLoadScreen();
                    },
                    error: function (response) {
                        hideLoadScreen();
                        loadError(lang)
                    }
                });
            }
            else {
                await loadContQuestionResults(response, contQuery, contQuestion);
                showResults();
                hideLoadScreen();
            }
        },
        error: function (response) {
            loadError(lang)
        }
    });
}

async function getResults() {
    let questionData = window.questionData;
    let cont_question_data = questionData["contingent_question"]
    let query = generateQuery();
    let lang =  $("#lang-select").val();
    hideResults();
    loadScreen();
    loadQueryLink(query);
    showQueryLink();
    if (cont_question_data != null) {
        let cont_question = generateContQuestionQuery()
        await getContQuestionResults(cont_question["query"], cont_question["question"])
    }
    else {
        hideContQuestionResults();
        $.ajax({
            url: "/wikibase_results",
            type: "GET",
            dataType: "json",
            data: {'query': query},
                        
            success: async function (response) {
                await loadResults(response, query);
                hideLoadScreen();
            },
            error: function (response) {
                hideLoadScreen()
                loadError(lang)
            }
        });
    }
    
    
    
};
        

/*
Initial setup
*/

$(document).ready(async function(){
    await initialSetup();
    $(window).keydown(function(event){
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
        else if( (event.keyCode == 13) && (checkform() == false) ) {
          event.preventDefault();
          return false;
        }
      });

    
});

async function initialSetup() {
    loadQuestionsData()
    .then(loadMessagesData)
    .then(loadInputTokens)
    .then(fillMainAutocomplete)
    .then(addMainPlaceholder)
    .then(initTemplateHelp)
    .then(getTemplateFromUrl)
}