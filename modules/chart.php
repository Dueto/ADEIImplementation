<?php
$chart_title = _("Chart");


function chartJS() {
?>      

  chart = new detailChartRenderer('moduleChart');  

  // Adding buttons in selection event - first argument is png class of image in jquery button ui
  chart.addButton('ui-icon-arrowthickstop-1-s', function()
  {
    data_export.Export(true);
  }); 
  chart.addButton('ui-icon-info', infotab.onSelect.bind(infotab));  


  //Adding customizable button in menu
  chart.addButtonInControls('click', function(min, max)
  {
    alert('min:' + min + ' max:' + max)
  });

  //Adding callbacks on each chart refreshing
  chart.addCallbackOnChartRefreshing(source_window.SetCustomWindow.bind(source_window));   


  // CHART FILTERS
  chart.addFilter(8.712281136796792);
  chart.addFilter(7.2503278656030945);
  chart.addFilter(function(pointData)
    {
      if(pointData === 7.110836130288014)
      {
        return 10;
      }
      else
      {
        return pointData;
      }
    });

  //CHANGING DATA IN TOP CHART
  //chart.setDataInMasterChart({data:[] /*, etc. any properties supported by highcharts*/ });  

<?
   
    return "chart";
}

function chartPage() {
?>   

<div id="moduleChart"> 
<div> 
<?

}

?>