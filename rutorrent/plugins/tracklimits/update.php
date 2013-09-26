<?php

if(count($argv)>2)
	$_SERVER['REMOTE_USER'] = $argv[2];

require_once( dirname(__FILE__).'/../../php/util.php' );
eval(getPluginConf('tracklimits'));

if(count($argv)>1)
{
	$trackers = $argv[1];
	foreach( $restrictedTrackers as $trk )
	{
		if( stristr( $trackers, $trk )!==false )
		{
			echo "Public";
			exit(0);
		}
	}	
}
