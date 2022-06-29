const $source = document.querySelector('#source');
const typeHandler = function(e) {
    let lang =  $("#lang-select").val()
    $.ajax({
        url: "/pipe",
        type : 'POST',
        cache: false,
        data:{'data': e.target.value, 'lang': lang},
        success: function(html)
        {
            
            var myList = [];
            for(var i = 0; i < html.search.length; i++)
            {
                if (lang == "en"){
                    myList.push({"label": html.search[i].label,
                    "value": html.search[i].id})
                }
                else {
                    myList.push({"label": html.search[i].aliases[0],
                    "value": html.search[i].id})
                }
            }
            $("#source").autocomplete({
                source: myList,
                "focus": function (event, ui) {
                    $(event.target).val(ui.item.label);
                    return false;
                },
                "select": function( event, ui ) { 
                    getResults(ui.item.value);
                    return false;
                }
            })
        }
     })
    }
    
    
$source.addEventListener('input',(e) => {
    if (e.target.value.length > 0) {
        typeHandler(e);
     }
     }) 

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

