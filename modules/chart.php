<?php
$chart_title = _("Chart");


function chartJS() {
?>      

   chart = new detailChartRenderer();
  
<?
   
    return "chart";
}

function chartPage() {
?>   
<button onclick="chart.changeZoomTypeToXY()">TO XY</button>

 <button onclick="chart.changeZoomTypeToMap()">TO MAP</button>
  <button onclick="chart.hideLegend()">HIDE LEGEND</button>
   <button onclick="chart.showLegend()">SHOW LEGEND</button></br>   

     <div id="mooveDiv">   	
     	<div id="masterChart" style="height: 100px;"> 
     	</div>   
   	</div>


 
        <div id="detailChart" height: "100%"  width: "100%"> 
         </div>


            
     



<?

}

?>