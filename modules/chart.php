<?php
$chart_title = _("Chart");


function chartJS() {
?>      

  chart = new detailChartRenderer('moduleChart');
  //chart.addButton('ui-icon-arrowthickstop-1-s', data_export.Export.bind(data_export));  
  chart.addButton('ui-icon-info', infotab.onSelect.bind(infotab));
  chart.addCallbackOnChartRefreshing(source_window.SetCustomWindow.bind(source_window)); 

<?
   
    return "chart";
}

function chartPage() {
?>   

  
  <!-- <div class="chronoline-left" style="margin-top: 40px; height: 40px;">
    <div class="chronoline-left-icon" style="margin-top: 12.5px;"></div>
  </div>

   <div class="chronoline-right" style="margin-top: 40px; height: 40px;">
    <div class="chronoline-right-icon" style="margin-top: 12.5px;"></div>
  </div>/!-->

<div id="moduleChart">
 
<div> 




<?

}

?>