<?php

require_once( dirname(__FILE__)."/../../php/xmlrpc.php" );
require_once( dirname(__FILE__)."/../../php/cache.php" );
eval(getPluginConf('starter'));

class rStarter
{
	public $hash = "starter.dat";
	public $autoReload = 1;
	public $askOnStart = 1;

	static public function load()
	{
		$cache = new rCache();
		$rt = new rStarter();
		$cache->get($rt);
		return($rt);
	}

	public function store()
	{
		$cache = new rCache();
		return($cache->set($this));
	}

	public function set()
	{
		$this->autoReload = $_REQUEST['auto_reload'];
		$this->askOnStart = $_REQUEST['ask_on_start'];
                $this->store();
	}

	public function check()
	{
		$req = new rXMLRPCRequest( new rXMLRPCCommand("system.client_version") );
		return($req->run() ? 1 : 0);
	}

	public function get()
	{
		return("theWebUI.starter = { auto_reload: ".$this->autoReload.", ask_on_start: ".$this->askOnStart." }; ");
	}

	protected function exec( $cmd )
	{
	        $results = array();
		$ret = exec($cmd,$results,$return);
		$results = array_map('trim', $results);
		if(!$return)
			sleep(WAIT_EXEC_TIMEOUT);
		return( array( "status"=>$return, "link"=>$this->check(), "out"=>$results ) );
	}

	public function start()
	{
		global $rTorrentStartCmd;
		$this->stop();
		return($this->exec($rTorrentStartCmd));
	}

	public function stop()
	{
		global $rTorrentStopCmd;
		return($this->exec($rTorrentStopCmd));		
	}
}
