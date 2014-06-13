<?php
class CACHEData implements Iterator {
 var $cache;
 var $query;

 var $res;
 var $key, $row;
 var $row_assoc;
 

 function __construct(CACHEDB $cache, $table, $from, $to) {
    $this->cache = &$cache;

    $sqlfrom = $this->cache->SQLTime(floor($from));
    $sqlto = $this->cache->SQLTime(floor($to)); 

//    $this->query = "SELECT * FROM `$table` WHERE `time` BETWEEN FROM_UNIXTIME($from) AND FROM_UNIXTIME($to) ORDER BY `time` ASC";
    $this->query = "SELECT * FROM `$table` WHERE ((`time` >= $sqlfrom) AND (`time` < $sqlto)) ORDER BY `time` ASC";
 }

 
 function rewind() {
    $this->res = mysql_query($this->query, $this->cache->dbh);
    if (!$this->res)
	throw new ADEIException(translate("Select request to CACHE is failed [%s]", $this->query));
    $this->next();
 }


 
 function current() {
    return $this->row;
 }
 
 function key() {
    return $this->key;
 }
 
 function next() {
    $this->row = mysql_fetch_row($this->res);
    if ($this->row) $this->key = strtotime($this->row[0]);
    else {
	$this->key = false;
	mysql_free_result($this->res);
    }
 }

 function valid() {
    return $this->row?true:false;
 }

 function rewindAssoc()
 {
    $this->res = mysql_query($this->query, $this->cache->dbh);
    if (!$this->res)
    throw new ADEIException(translate("Select request to CACHE is failed [%s]", $this->query));
    $this->nextAssoc();
 }

function currentAssoc() {
    return $this->row_assoc;
 }

 function nextAssoc()
 {
    $this->row_assoc = mysql_fetch_assoc($this->res);
    if ($this->row_assoc) $this->key = strtotime($this->row_assoc['time']);
    else {
    $this->key = false;
    mysql_free_result($this->res);
    }
 }

 function validAssoc()
 {
    return $this->row_assoc?true:false;
 }

 



}
?>