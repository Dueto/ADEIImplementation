<?php
try 
{		
	$req = new REQUEST($_GET);
	if(isset($_GET['resolution']) && $_GET['resolution'] != 0) $resolution = $req->GetProp('resolution');
	else throw new ADEIException('No missing data points on zero level');			 
	if(isset($_GET['experiment'])) $experiment = $req->GetProp('experiment');
	else throw new ADEIException('The experiment time should be specified');
	/*if(isset($_GET['format'])) $format = $req->GetProp('format');
	else throw new ADEIException('The data format should be specified');*/	
	$source_request = new SOURCERequest($req->GetProps());
	$cachedb = new CACHEDB($source_request);	
	$table = $cachedb->GetTableName($resolution);
	$from = explode('-', $experiment)[0];
	$to = explode('-', $experiment)[1];
	$cache_data = new CACHEData($cachedb, $table, $from, $to);		
	$cache_data->rewindAssoc();
    switch($_GET['target']) 
    {
		case 'point_count':		   
		    $response = "Date/Time, Point count\r\n";
			while($cache_data->validAssoc())
			{
				$row = $cache_data->currentAssoc();
				$response = $response . strtotime($row['time']) . "," . $row['n'] . "\r\n";
				$row = $cache_data->nextAssoc();
			}
			echo($response);
		break;
		case 'missing_points':		
			/*switch ($format) 
			{
				case 'binary':					
					$handler = new BINARYHandler();
					break;				
				case 'csv':					
					$handler = new CSVHandler();
					break;
				default:
					throw new ADEIException('Unsupported format (' . $format . ') is specified');
					break;
			}*/			
			$response = "Date/Time, Missing points\r\n";
			while($cache_data->validAssoc())
			{
				$row = $cache_data->currentAssoc();
				$response = $response . strtotime($row['time']) . "," . $row['missing'] . "\r\n";
				$row = $cache_data->nextAssoc();
			}			
			echo($response);
		break;
		default:
			if (isset($_GET['target'])) $error = translate("Unknown list target (%s) is specified", $_GET['target']);
		    else $error = translate("The list target is not specified");
	}
}
catch (ADEIException $ex) 
{
    $ex->logInfo(NULL, $reader?$reader:$req);
    $error = xml_escape($ex->getInfo());
}
if($error)
{
	echo($error);
}

?>