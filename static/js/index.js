var question_data;

function hideMainInputBox(){
    $("#source").addClass('hidden');
}

function showMainInputBox(){
    $("#source").removeClass('hidden');

}

function getQuestionIndex(questions_data, question_id){
    let index = questions_data.findIndex(function(question) {
        return question.id == question_id
      });
    return index
}

function goBack(){
    hideGoBack();
    hideTemplateForm();
    showMainInputBox();

}
function showGoBack(){
    $("#home").removeClass('hidden');
}
function hideGoBack(){
    $("#home").addClass('hidden');
}

function getQuestionData(question_id, data){
    let index = getQuestionIndex(data, question_id);
    let question_data = data[index];
    return question_data;
}

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
            console.log("item", item)
            let template_entity_idx = item.split("_")[1];
            query_template_l[index] = "wd:" + entities_values[template_entity_idx];
        }
    })
    console.log("query", query_template_l.join(""))
}
function generateTemplateForm(question_data, lang){
    let question_template = question_data["question_template_" + lang]
    let mention_regex = /\$mention_[0-9]+/
    let question_template_l = question_template.split(/(\$[a-z]+_[0-9]+)/);
    let html = ""
    question_template_l.forEach(function (item, index) {
        if (mention_regex.test(item)){
            let mention_id = item.split("_")[1];
            html = html.concat('<input type="text" class="form-control input-sm" id="entity-' + mention_id + '">')
        }
        else {
            html = html.concat('<span class="template-text">' + item + '</span>')

        }
      });
      $("#template-form").prepend($(html));

}

function autocompleteTemplateForm(){
    let lang =  $("#lang-select").val();

    $('form#template-form').find('*[id*=entity]').each(function() {
        $(this).on("input", function() {
            var input = this.value;
            console.log("value", this.value);
            if ( this.value.length > 0 ){
                $(this).autocomplete({  
                    source : function( request, response ) {
                        $.ajax({                
                          type: "POST",
                            url: "/wikidata_search",
                            dataType: "json",
                            data:{'data': input, 'lang': lang},
                          success: function (data) {                  
                              response($.map(data.search, function (item, i) {
                                //alert(item.value);
                                return {
                                    label: item.label,
                                    value: item.value,
                                    desc: item.desc
                                  }
                                })
                              );
                            
                          },
                          error: function (data) {
                            alert('error!');
                            console.log(data);
                          }
                        });
                      },
                    focus: function (event, ui) {
                        event.preventDefault()
                        $(event.target).val(ui.item.label);
                    },
                    select: function( event, ui ) { 
                        event.preventDefault()
                        $(event.target).val(ui.item.label);
                        
                    }
                }).autocomplete( "instance" )._renderItem = function( ul, item ) {
                    return $( "<li>" )
                      .append( "<div>" + item.label + "<br>" + item.desc + "</div>" )
                      .appendTo( ul );
                  };
            }
        }); 
    });
     
    
}


function showTemplateForm(){
    $("#template-form").removeClass('hidden');

}

function hideTemplateForm(){
    $("#template-form").addClass('hidden');
}

$(function () {
    let lang =  $("#lang-select").val();

    $.ajax({
        url: "./static/cached_questions/templates.json",
        dataType: "json",
        success: function(data) {
            var data_arr = $.map(data, function(item) {
                return {
                    label: item["visible_question_"+lang],
                    value: item.id,
                    //desc: item.desc
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
                    question_data = getQuestionData(ui.item.value, data);
                    generateTemplateForm(question_data, lang);
                    autocompleteTemplateForm();
                    showTemplateForm();
                    showGoBack();

                },
                             
            })
        }
    });
});





function getResults(query){
    let lang =  $("#lang-select").val();

    hideResults();
    loadScreen();
   
    $.ajax({
        url: "/wikibase_results",
        type: "POST",
        cache: true,
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

