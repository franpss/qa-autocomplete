function applyLanguageText(lang){
    $.getJSON(langJson, function(data){
        $(".lang").each(function(){
            if ($(this).contents().length > 0 && (this.id  != "about-text")) {
                let contents = $(this).contents().filter(function(){ return this.nodeType != 3; }).first().replaceWith(data[$(this).attr("id")][lang]);
                $(this).html(data[$(this).attr("id")][lang]);
                $(this).append(contents);
            }
            
            else {
                $(this).html(data[$(this).attr("id")][lang]);
            }
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
}

function handleLanguageChange() {
    // Language selector change handler
    $("#lang-select").on("change", function(){
        if (!$("#template-form").hasClass("hidden")){
            $('#set-lang').submit();
            window.location.href = "/";
        }
        else {
            applyLanguageText($("#lang-select").val());
            addMainPlaceholder();
            $('#set-lang').submit();
        }
        
        
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