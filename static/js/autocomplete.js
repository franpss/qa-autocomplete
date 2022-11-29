/*
Auxiliary functions to autocomplete
*/

function normalize(term){
    var ret = "";
    for ( var i = 0; i < term.length; i++ ) {
        ret += accentMap[ term.charAt(i) ] || term.charAt(i);
    }
    return ret;
}

function replaceTokensFromQuestion(question, lang){
    let output = normalize(question.toLowerCase());
    inputTokens[lang].forEach((token, tokenIdx) => {
        token.forEach(word => {
            let normWord = normalize(word);
            let wordRegex = new RegExp("\\b" + normWord + "((?= )|(?=\\?))", "g");
            output = output.replaceAll(wordRegex, "TOK" + tokenIdx.toString())
        }) 
    })
    return output;
}

function replaceTokensFromInput(input, lang, minChar=2){
    let output = normalize(input.toLowerCase());
    inputTokens[lang].forEach((token, tokenIdx) => {
        token.forEach(word => {
            let normWord = normalize(word);
            let wordRegex = normWord;
            for (let i = normWord.length - 1; i >= minChar; i--) {
                wordRegex = wordRegex + "|" + normWord.slice(0, i)
            }
            wordRegex = new RegExp("\\b(" + wordRegex + ")(?= |$)", "g");
            output = output.replaceAll(wordRegex, "TOK" + tokenIdx.toString())
        }) 
    })
    return output;
}

/*
Autocomplete functions (main and templates)
*/

function fillMainAutocomplete() {
    let lang =  $("#lang-select").val();    
    hideTemplateHelp();
    hideLangHelp();
    var dataArr = $.map(questionsData, function(item) {
        if (item["visible_question_"+lang] != null){
            let rawLabel = item["visible_question_"+lang].replaceAll("{", "").replaceAll("}", "")
            return {
                label: rawLabel,
                value: item.id,
                styledLabel: item["visible_question_"+lang].replaceAll("{", "<i class='mention'>").replaceAll("}", "</i>"),
                tokLabel: replaceTokensFromQuestion(rawLabel, lang)
                };
        }
       
        });
    dataArr = dataArr.filter(
        (question, index) => index === dataArr.findIndex(
        other => question.label === other.label
    ));
      
    $("#source").autocomplete({
        source: function( request, response ) {
            let tokReqTerm = replaceTokensFromInput(request.term, lang)
            var matcher = new RegExp( $.ui.autocomplete.escapeRegex( tokReqTerm ), "i" );
            response($.grep(dataArr, function(value) {
                return matcher.test(value.tokLabel);
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
                hideTemplateHelp();
                loadTemplateForm(ui.item.value, lang);
            }
            else {
                window.location.href = ui.item.value;
            }
        },     
        response: function(event, ui) {
            if (!ui.content.length) {
                let input = $(this).data("uiAutocomplete").term
                let inputList = input.split(" ");
                
                while (inputList.length > 1){
                    inputList = inputList.slice(0, -1);;
                    let newInput = inputList.join(" ")
                    let tokReqTerm = replaceTokensFromInput(newInput, lang)
                    var matcher = new RegExp( $.ui.autocomplete.escapeRegex( tokReqTerm ), "i" );
                    let matchedItems = $.grep(dataArr, function(value) {
                        return matcher.test(value.tokLabel);
                    })
                    if (matchedItems.length > 0) {
                        ui.content.push.apply(ui.content, matchedItems);
                        forcedResults = true;
                        updateTemplateHelp(lang);
                        break;
                    }
                }
                if (!ui.content.length) {
                    var noResult = { value: qaWikiHomeUrl, styledLabel: messagesData["no-results-new-item"][lang] };
                    ui.content.push(noResult);
                    showLangHelp(lang);
                    hideTemplateHelp();
                }
                
            }
            else {
                forcedResults = false;
                hideLangHelp();
                updateTemplateHelp(lang);
            }
        },
        minLength: 2                
    }).autocomplete("instance")._renderItem = function(ul, item) {
        return $("<li>")
        .append("<div>" + item.styledLabel + "</div>")
        .appendTo(ul);
    };
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
            $(this).bind("paste", function () {
                setTimeout(function () {
                    $(this).autocomplete("search", $(this).val());
                }, 0);
            });    
            }
        });
    });
}