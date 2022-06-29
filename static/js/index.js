function getQuestions(input) {
    let lang =  $("#lang-select").val()
    var output = [];
    $.ajax({
        url: "/pipe",
        type : 'POST',
        cache: false,
        data:{'data': input, 'lang': lang},
        success: function(html)
        {   
            for(var i = 0; i < html.search.length; i++)
            {
                if (lang == "en"){
                    output.push({"label": html.search[i].label,
                    "value": html.search[i].id})
                }
                else {
                    if ("aliases" in html.search[i]){
                        output.push({"label": html.search[i].aliases[0],
                        "value": html.search[i].id})
                    }
                }
            }
        }
     })
     return output;
    }
    
$("#source").on("input", function() {
    if ( this.value.length > 0 ){
        var questions = getQuestions(this.value);
        $("#source").autocomplete({  
            source : questions,
            focus: function (event, ui) {
                event.preventDefault()
                $(event.target).val(ui.item.label);
            },
            select: function( event, ui ) { 
                event.preventDefault()
                getResults(ui.item.value);
            }
        })
    }
});  


function getResults(id){
    hideResults();
    loadScreen();
    let lang =  $("#lang-select").val()
    $.ajax({
        url: "/wikibase_results/" + id,
        type: "GET",
        cache: true,
        dataType: "json",
            
        success: function (response) {
            hideLoadScreen();
            loadResults(response);
        },
        error: function (response) {
            hideLoadScreen()
            loadError(lang)
        }
        });
    }

function loadResults(results){
    $("#results").removeClass('hidden');
    let parsedResults = parser(results);
    $("#answer").append(parsedResults);
}

function loadError(lang){
    $("#results").removeClass('hidden');
    if (lang == "es"){
        $("#answer").append("Ha sucedido un error desde Wikidata");
    }
    else {
        $("#answer").append("An error has occurred from Wikidata")
    }
    
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

//$source.addEventListener('propertychange', typeHandler) // for IE8

