plugin.loadMainCSS();
plugin.loadLang();

plugin.onLangLoaded = function()
{
    this.addButtonToToolbar("logoff", theUILang.logoff, "theDialogManager.show('logoffDlg')", "add");
    this.addSeparatorToToolbar("add");

    theDialogManager.make("logoffDlg", theUILang.logoff,
        "<div id='logoffDlg-content'>"+
            theUILang.logoffPrompt+
            "<div>"+
                "<label for='login.username'>" + theUILang.logoffUsername + ":</label> <input type='text' id='login.username' class='Textbox' /> <span id='logoffUserEmpty'></span>"+
            "</div>"+
            "<div>"+
                "<label for='login.password'>" + theUILang.logoffPassword + ":</label> <input type='password' id='login.password' class='Textbox' /> <span id='logoffPassEmpty'></span>"+
            "</div>"+
            "<div>" + theUILang.logoffNote + "</div>"+
        "</div>"+
        "<div id='logoffDlg-buttons' class='aright buttons-list'>"+
            "<input type='button' class='Button' value='" + theUILang.logoffChange + "' id='logoffChange'>"+
            "<input type='button' class='Button' value='" + theUILang.logoff + "' id='logoffComplete'>"+
            "<input type='button' class='Button' value='" + theUILang.Cancel + "' id='logoffCancel'>"+
        "</div>",
    true);

    $("#logoffChange").click(function()
    {
        if ($($$("login.username")).val() == "") {
            $("#logoffUserEmpty").html(theUILang.logoffEmpty);
            return(false);
        }
        $("#logoffUserEmpty").html("");

        if ($($$("login.password")).val() == "") {
            $("#logoffPassEmpty").html(theUILang.logoffEmpty);
            return(false);
        }
        $("#logoffPassEmpty").html("");

        if (document.location.protocol == "https:")
            document.location = "https://" + $($$("login.username")).val() + ":" + $($$("login.password")).val() + "@" + document.location.href.substring(8);
        else
            document.location = "http://" + $($$("login.username")).val() + ":" + $($$("login.password")).val() + "@" + document.location.href.substring(7);
    });

    $("#logoffComplete").click(function()
    {
        alert("logging off");
        if (document.location.protocol == "https:")
            document.location = "https://logoff@" + document.location.href.substring(8);
        else
            document.location = "http://logoff@" + document.location.href.substring(7);
    });

    $("#logoffCancel").click(function()
    {
        theDialogManager.hide("logoffDlg");
        return(false);
    });
}

plugin.onRemove = function()
{
    theDialogManager.hide("logoffDlg");

    this.removeSeparatorFromToolbar("add");
    this.removeButtonFromToolbar("logoff");
}
