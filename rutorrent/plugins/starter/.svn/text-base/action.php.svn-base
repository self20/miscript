<?php
require_once( 'starter.php' );

set_time_limit(0);

$sta = new rStarter();
$ctype = "application/json";
$cmd = isset($_REQUEST["cmd"]) ? $_REQUEST["cmd"] : "get";

switch($cmd)
{
	case "set":
	{
		$sta->set();
	}
	case "get":
	{
		$content = $sta->get();
		cachedEcho($content,"application/javascript");
		break;
	}
	case "stop":
	{
		$content = $sta->stop();
		break;
	}
	case "start":
	{
		$content = $sta->start();
		break;
	}
	case "check":
	{
		$content = array( "link"=>$sta->check() );
		break;
	}
}

cachedEcho(json_encode($content),"application/json");
