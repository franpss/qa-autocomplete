/*
Autocomplete functions (main and templates)
*/

function fillMainAutocomplete() {
    let lang =  $("#lang-select").val();    
    var dataArr = $.map(questionsData, function(item) {
        if (item["visible_question_"+lang] != null){
            return {
                label: item["visible_question_"+lang],
                value: item.id,
                };
        }
       
        });
    dataArr = dataArr.filter(
        (question, index) => index === dataArr.findIndex(
        other => question.label === other.label
    ));
    var accentMap = {
            "á": "a",
            "é": "e",
            "í": "i",
            "ó": "o",
            "ú": "u"
          };
      
    var normalize = function( term ) {
            var ret = "";
            for ( var i = 0; i < term.length; i++ ) {
              ret += accentMap[ term.charAt(i) ] || term.charAt(i);
            }
            return ret;
          }
    $("#source").autocomplete({
        source: function( request, response ) {
            var matcher = new RegExp( $.ui.autocomplete.escapeRegex( request.term ), "i" );
            response($.grep(dataArr, function(value) {
                return matcher.test(value.label) || matcher.test(normalize(value.label));
                }) 
            );
        },
        focus: function (event, ui) {
            if (ui.item.value != qaWikiHomeUrl) {
                event.preventDefault();
                $(event.target).val(ui.item.label);
            }
        },
        select: function( event, ui ) { 
            if (ui.item.value != qaWikiHomeUrl) {
                event.preventDefault();
                window.history.pushState({}, document.title, "/question_template/" + ui.item.value);
                loadTemplateForm(ui.item.value, lang);
            }
            else {
                window.location.href = ui.item.value;
            }
        },     
        response: function(event, ui) {
            if (!ui.content.length) {
                var noResult = { value: qaWikiHomeUrl, label: messagesData["no-results-new-item"][lang] };
                ui.content.push(noResult);
                showLangHelp(lang);
            }
            else {
                hideLangHelp();
            }
        }                
    })
;
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
                                        desc: item.desc == null ? "" : item.desc
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
                }).on("focus", function () {
                    $(this).autocomplete("search", this.value);
                }).autocomplete("instance")._renderItem = function(ul, item) {
                    return $("<li>")
                        .append("<div>" + item.label + "<br> <span class='desc'>" + item.desc + "</span></div>")
                        .appendTo(ul);
                };
                
            }
        });
    });
}