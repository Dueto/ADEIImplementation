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

  
  <!-- <div class="chronoline-left" style="margin-top: 40px; height: 40px;">
    <div class="chronoline-left-icon" style="margin-top: 12.5px;"></div>
  </div>

   <div class="chronoline-right" style="margin-top: 40px; height: 40px;">
    <div class="chronoline-right-icon" style="margin-top: 12.5px;"></div>
  </div>/!-->


     <div id="mooveDiv">   	
     	<div id="masterChart" style="height: 100px;" style: "flow: auto"> 
     	</div>   
   	</div>
        <div id="detailChart" style: "position:absolute;"> 
         </div>    




<?

}

?>