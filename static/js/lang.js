function applyLanguageText(lang){
    $.getJSON(json_lang, function(data){
        $(".lang").each(function(){
            $(this).html(data[$(this).attr("id")][lang]);
        });
    });
}

function readLanguageCookie() {
    let langCookie = Cookies.get('lang');
    if (typeof langCookie === 'undefined') {
        langCookie = 'en';
    }
    $("#lang-select").val(langCookie);
    return langCookie
}

function applyLanguage() {
    let langCookie = readLanguageCookie();
    applyLanguageText(langCookie);
    applyLanguageForm(langCookie, true);
}

function handleLanguageChange(change_form=false) {
    // Language selector change handler
    $("#lang-select").on("change", function(){
        applyLanguageText($("#lang-select").val());
        if(change_form) {
            applyLanguageForm($("#lang-select").val());
        }
        $('#set-lang').submit();
    });

    // Set language cookie via AJAX
    $("#set-lang").submit(function(e) {
        e.preventDefault();
        let form = $(this);
        let actionUrl = form.attr('action');
        $.ajax({
            type: "POST",
            url: actionUrl,
            data: form.serialize(),
        });
    });
}

/*
Este script se encarga de llamar a los handlers que son comunes a todos los templates.
 */
function baseSetup() {
    let langCookie = readLanguageCookie();
    applyLanguageText(langCookie);
    handleLanguageChange();
}

$( document ).ready(function () {
    baseSetup();
})