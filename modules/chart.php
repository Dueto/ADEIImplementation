<?php
$chart_title = _("Chart");


function chartJS() {
?>      

  chart = new detailChartRenderer('moduleChart');  
  chart.addButton('ui-icon-info', infotab.onSelect.bind(infotab));
  chart.addButtonInControls('click', function(min, max)
  {
    alert('min:' + min + ' max:' + max)
  });
  chart.addCallbackOnChartRefreshing(source_window.SetCustomWindow.bind(source_window));   
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

  //chart.setDataInMasterChart({data:[] /*, etc. any properties supported by highcharts*/ });
  //chart.addButton('ui-icon-arrowthickstop-1-s', data_export.Export.bind(data_export));  

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