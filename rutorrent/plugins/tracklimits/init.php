<?php

require_once( dirname(__FILE__).'/../../php/xmlrpc.php' );
eval(getPluginConf($plugin["name"]));

@define('MAX_SPEED', 100*1024*1024);

function checkThrottles()
{
	$toCorrect = array();
	$req = new rXMLRPCRequest( 
		new rXMLRPCCommand( "d.multicall", array(
		        "",
			getCmd("d.get_hash="),
			getCmd("d.get_throttle_name="),
			getCmd('cat').'=$'.getCmd("get_throttle_up_max").'=$'.getCmd("d.get_throttle_name="),
			getCmd('cat').'=$'.getCmd("get_throttle_down_max").'=$'.getCmd("d.get_throttle_name=")))
		);
	if($req->run() && !$req->fault)
	{
		for($i=0; $i<count($req->val); $i+=4)
		{
			if($req->val[$i+1]=="trklimit")
			{
				if(($req->val[$i+2]==="-1") && ($req->val[$i+3]==="-1"))
				{
					$toCorrect[] = $req->val[$i];
				}
			}
        	}
	}
	return($toCorrect);
}

function correctThrottles( $toCorrect )
{
	$req = new rXMLRPCRequest();
	foreach($toCorrect as $hash)
	{
		$req->addCommand(new rXMLRPCCommand( "branch", array(
			$hash, 
			getCmd("d.is_active="), 
			getCmd('cat').'=$'.getCmd("d.stop").'=,$'.getCmd("d.set_throttle_name=").'trklimit,$'.getCmd('d.start='), 
				getCmd('d.set_throttle_name=').'trklimit' )));
	}
	if($req->getCommandsCount())
		return($req->success());
	return(true);
}

$req = new rXMLRPCRequest( array(
	new rXMLRPCCommand( "get_upload_rate" ),
	new rXMLRPCCommand( "get_download_rate" ) ));
$inited = false;

if($req->success())
{
	$req1 = new rXMLRPCRequest();
	if($req->val[0]==0)
		$req1->addCommand(new rXMLRPCCommand( "set_upload_rate", MAX_SPEED ));
	if($req->val[1]==0)
		$req1->addCommand(new rXMLRPCCommand( "set_download_rate", MAX_SPEED ));
	if(!$req1->getCommandsCount() || $req1->success())
	{
		$toCorrect = checkThrottles();
		$req = new rXMLRPCRequest( array(
			new rXMLRPCCommand("throttle_up", array("trklimit",$MAX_UL_LIMIT."")),
			new rXMLRPCCommand("throttle_down", array("trklimit",$MAX_DL_LIMIT."")),
			$theSettings->getOnInsertCommand(array('_tracklimits'.getUser(), 
				getCmd('d.set_custom').'=x-throttle,"$'.getCmd('execute_capture').
				'={'.getPHP().','.$rootPath.'/plugins/tracklimits/update.php,\"$'.getCmd('t.multicall').'=$'.getCmd('d.get_hash').'=,'.getCmd('t.get_url').'=,'.getCmd('cat').'=#\",'.getUser().'}" ; '.
				getCmd('branch').'=$'.getCmd('not').'=$'.getCmd('d.get_custom').'=x-throttle,,'.
				getCmd('d.set_throttle_name').'=trklimit'
				)),
			)
		);
		if($preventUpload)
		{
			$req->addCommand(
				$theSettings->getOnFinishedCommand(array('_tracklimits1'.getUser(), 
					getCmd('d.set_custom').'=x-throttle,"$'.getCmd('execute_capture').
					'={'.getPHP().','.$rootPath.'/plugins/tracklimits/update.php,\"$'.getCmd('t.multicall').'=$'.getCmd('d.get_hash').'=,'.getCmd('t.get_url').'=,'.getCmd('cat').'=#\",'.getUser().'}" ; '.
					getCmd('branch').'=$'.getCmd('not').'=$'.getCmd('d.get_custom').'=x-throttle,,'.
					getCmd('d.close').'='
				)));
			$req->addCommand(
				$theSettings->getOnResumedCommand(array('_tracklimits2'.getUser(), 
					getCmd('d.set_custom').'=x-throttle,"$'.getCmd('execute_capture').
					'={'.getPHP().','.$rootPath.'/plugins/tracklimits/update.php,\"$'.getCmd('t.multicall').'=$'.getCmd('d.get_hash').'=,'.getCmd('t.get_url').'=,'.getCmd('cat').'=#\",'.getUser().'}" ; '.
					getCmd('branch').'=$'.getCmd('not').'=$'.getCmd('d.complete').'=,,'.
					'$'.getCmd('not').'=$'.getCmd('d.get_custom').'=x-throttle,,'.
					getCmd('d.close').'='
				)));
		}
		if($req->success() && correctThrottles( $toCorrect ))
		{
			$theSettings->registerPlugin($plugin["name"],$pInfo["perms"]);
			$inited = true;
		}
	}
}

if(!$inited)
	$jResult .= "plugin.disable(); noty('tracklimits: '+theUILang.pluginCantStart,'error');";
	