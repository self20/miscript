plugin.loadLang();
plugin.loadMainCSS();

plugin.config = theWebUI.config;
theWebUI.config = function(data)
{
	plugin.config.call(this,data);
	plugin.start();
}

plugin.start = function()
{
	if(plugin.allStuffLoaded)
	{
		plugin.setControlStatus( { link : theWebUI.systemInfo.rTorrent.started } );
		if(!theWebUI.systemInfo.rTorrent.started && theWebUI.starter.ask_on_start)
		{
			theDialogManager.show("dlg_starter");
		}
	}
	else
		setTimeout(arguments.callee,1000);
}

theWebUI.showStarterManager = function()
{
	this.request( "?action=checkrtorrent", [theWebUI.doShowStarterManager, this] );
}

theWebUI.doShowStarterManager = function(data)
{
	plugin.setControlStatus(data);
	$('#starterlog').html('');
	theDialogManager.show("dlg_starter");
}

theWebUI.webuiRestart = function()
{
	window.location.reload();
}

theWebUI.rtorrentStart = function()
{
        $('#starterlog').html('');
	$('#starter_btns').css( "background", "transparent url(./plugins/create/images/ajax-loader.gif) no-repeat 5px 7px" );
	this.request( "?action=startrtorrent", [theWebUI.starterResult, this] );
}

theWebUI.rtorrentStop = function()
{
        $('#starterlog').html('');
	$('#starter_btns').css( "background", "transparent url(./plugins/create/images/ajax-loader.gif) no-repeat 5px 7px" );
	this.request( "?action=stoprtorrent", [theWebUI.starterResult, this] );
}

theWebUI.starterResult = function( data )
{
        $('#starter_btns').css( "background", "none" );
        var arr = data.out;
        if(arr)
        {
               	arr.push(data.status ? theUILang.starterFailed+" ("+data.status+")" : theUILang.starterSucces);
		var s = ''
		for(var i = 0; i<arr.length; i++)
		{
			s += escapeHTML(arr[i]);
			s+='<br>';
		}
		$('#starterlog').html(s);
		$('#starterlog')[0].scrollTop = $('#starterlog')[0].scrollHeight;
	}
	plugin.setControlStatus(data);
	if(theWebUI.starter.auto_reload && !data.status)
		theWebUI.webuiRestart();
}

plugin.setControlStatus = function(data)
{
	if(data.link)
	{
		$('#dlg_starter-header').text(theUILang.rtorrentIsRunning);
		$('#rtorrentStart').attr('disabled',true);
		$('#rtorrentStop').attr('disabled',false);
	}
	else
	{
		$('#dlg_starter-header').text(theUILang.rtorrentIsStopped);
		$('#rtorrentStart').attr('disabled',false);
		$('#rtorrentStop').attr('disabled',true);
	}
}

rTorrentStub.prototype.startrtorrent = function()
{
	this.content = "cmd=start";
	this.contentType = "application/x-www-form-urlencoded";
	this.mountPoint = "plugins/starter/action.php";
	this.dataType = "json";
}

rTorrentStub.prototype.stoprtorrent = function()
{
	this.content = "cmd=stop";
	this.contentType = "application/x-www-form-urlencoded";
	this.mountPoint = "plugins/starter/action.php";
	this.dataType = "json";
}

rTorrentStub.prototype.checkrtorrent = function()
{
	this.content = "cmd=check";
	this.contentType = "application/x-www-form-urlencoded";
	this.mountPoint = "plugins/starter/action.php";
	this.dataType = "json";
}

if(plugin.canChangeOptions())
{
	plugin.addAndShowSettings = theWebUI.addAndShowSettings;
	theWebUI.addAndShowSettings = function( arg )
	{
		if(plugin.enabled)
	        {
			$$('auto_reload').checked = ( theWebUI.starter.auto_reload == 1 );
			$$('ask_on_start').checked = ( theWebUI.starter.ask_on_start == 1 );
		}
		plugin.addAndShowSettings.call(theWebUI,arg);
	}

	theWebUI.starterWasChanged = function()
	{
		return(	($$('auto_reload').checked != ( theWebUI.starter.auto_reload == 1 )) ||
			($$('ask_on_start').checked != ( theWebUI.starter.ask_on_start == 1 )) );
	}

	plugin.setSettings = theWebUI.setSettings;
	theWebUI.setSettings = function()
	{
		plugin.setSettings.call(this);
		if( plugin.enabled && this.starterWasChanged() )
			this.request( "?action=setstarter" );
	}

	rTorrentStub.prototype.setstarter = function()
	{
		this.content = "cmd=set&auto_reload=" + ( $$('auto_reload').checked ? '1' : '0' ) +
			"&ask_on_start=" + ( $$('ask_on_start').checked  ? '1' : '0' );
		this.contentType = "application/x-www-form-urlencoded";
		this.mountPoint = "plugins/starter/action.php";
		this.dataType = "script";
	}
}

plugin.onLangLoaded = function()
{
	this.addButtonToToolbar("starter",theUILang.starterManager,"theWebUI.showStarterManager()","settings");
	theDialogManager.make( 'dlg_starter', theUILang.starterManager,
		"<div class='cont fxcaret'>" +
			"<fieldset>"+
				"<legend>"+theUILang.starterConsole+"</legend>"+
				"<div class='starterConsole' id='starterlog'></div>"+
			"</fieldset>"+
		"</div>"+
		"<div class='aright buttons-list' id='starter_btns'>"+
			"<input type='button' id='rtorrentStart' value='" + theUILang.rtorrentStart + "' class='Button' " +
				" onclick='theWebUI.rtorrentStart(); return(false);' />" +
			"<input type='button' id='rtorrentStop' value='" + theUILang.rtorrentStop + "' class='Button' " +
				" onclick='theWebUI.rtorrentStop(); return(false);' />" +
			"<input type='button' id='rutorrentRestart' value='" + theUILang.webuiRestart + "' class='Button' " +
				" onclick='theWebUI.webuiRestart(); return(false);' />" +
			"<input type='button' value='"+ theUILang.Cancel + "' class='Cancel Button'/>" +
		"</div>", true);                                        
	this.attachPageToOptions( $("<div>").attr("id","st_starter").html(
		"<fieldset>"+
			"<legend>"+theUILang.starterManager+"</legend>"+
			"<div class='checkbox'>" +
				"<input type='checkbox' id='auto_reload'/>"+
				"<label for='auto_reload'>"+ theUILang.starterAutoReload +"</label>"+
			"</div>" +
			"<div class='checkbox'>" +
				"<input type='checkbox' id='ask_on_start'/>"+
				"<label for='ask_on_start'>"+ theUILang.starterAskOnStart +"</label>"+
			"</div>"+
		"</fieldset>"
		)[0], theUILang.starter );
}

plugin.onRemove = function()
{
	theDialogManager.hide("dlg_starter");
	this.removePageFromOptions("st_starter");
	this.removeButtonFromToolbar("starter");
}

