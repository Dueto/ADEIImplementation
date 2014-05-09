 <?php

class BINARYHandler extends DATAHandler 
{


 function __construct(&$opts = NULL, STREAMHandler $h  = NULL) {

    $this->content_type = "arraybuffer";
    $this->extension = "arraybuffer"; 

    parent::__construct($opts, $h);
	
	if ($opts['accept_null_values']) 
    {
	    $this->nullwriter = true;
	}
 }


 function DataVector(&$time, &$values, $flags = 0) {
    if ($this->subseconds) {

        $subsec = strchr(sprintf("%.6F", $time), '.');
        $this->h->Write(pack("a*", date('Y-m-d H:i:s', $time) . $subsec));
    } else  {
        $this->h->Write(pack("a*", date('Y-m-d H:i:s', $time) . ".000000"));
    }

    foreach ($values as $value) {
	$this->h->Write(pack("d*", $value));
    }
 }
}

?>
