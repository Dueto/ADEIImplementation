var detailChartRenderer = function()
{
    var me = {};


    me.masterChart = new masterChartRenderer();
    me.masterChartId = 'masterChart';
    me.id = 'detailChart';
    me.chart = null;
    me.upControl = null;
    me.downControl = null;
    me.leftControl = null;
    me.rightControl = null;
    me.intervalVariable = null;

    self.masterChartSeriesNumber = 0;

    me.hostURL = 'http://ipecluster5.ipe.kit.edu/ADEIRelease/adei'

    me.axes = '';
    me.axesToShow = [];
    
    me.neddenAxes = [];
    me.axesToChannels = [];
    me.dataSourcesToChannels = []; 

    me.moovingRightCount = 0;
    me.moovingLeftCount = 0;   

    me.stopPropagation = false;

    me.temporaryAxis = {gridLineWidth: 0, id: 'temporary',labels: {format: '{value}', style: { color: 'black'}}, title: {text: 'Temporary axis', style: { color: 'black'}}};

    me.series = '';
    me.divWidth = '';
    me.divHieght = '';
    me.pointCount = '';
    me.timer = '';
    me.delta = 0;
    me.resolutionMultiplier = 0.4;
    me.zoomMultiplier = 20;
    me.tooltipX = 10;
    me.tooltipY = 35;
    me.mouseDown = 0;
    me.initialBeginTime = '';
    me.initialEndTime = '';
    me.onDraggingLeft = 80;
    me.onDraggingRigth = 0;
    me.dragData = null;
    me.zoomType = 'xy';
    me.chartOptions = '';
    me.isLegendEnabled = false;
    me.firstRequest = false;
    me.needenWindow = '-';

    me.resetXAxisAfterRenderTime = false;
    me.resetYAxisAfterRenderTime = false;
    me.previousStateX = null;
    me.previousStateY = null;

    me.db = new dataCacher('httpgetbinary', true, true, false, false);
    me.dataSources = [];
    me.currentDataSource = 0;
    me.allChannels = '';
    me.dataSourcePeriod = 0;
    me.dataSourceLevel = '';



    me.className = 'detailChartRenderer';

    me.Request = function(cfg)
    {
        var self = this;        
        //self.dataSources = [];
        var dataSource = {};
        dataSource.db_server = cfg.db_server;
        dataSource.db_name = cfg.db_name;
        dataSource.db_group = cfg.db_group;
        dataSource.aggregation = cfg.aggregation;   
        dataSource.channels = cfg.db_mask;    
        var experiment = cfg.experiment;
        if(dataSource.aggregation === null)
        {
            dataSource.aggregation = 'mean';
        }       
        if(parseInt(cfg.window) !== 0)
        {
            self.needenWindow = (cfg.window);  
        } 
        self.pointCount = self.divWidth * self.resolutionMultiplier;
        self.onDraggingRigth = self.divWidth - self.onDraggingLeft;        
        self.masterChart.setOnZoomCallback(self.onZoomMasterChartEvent.bind(self));         
        if(self.chart !== null && self.masterChart !== null && self.masterChart.chart !== null)
        {
            self.resizeCharts();
            self.divWidth = self.getDivWidth(self.id);
            self.divHieght = self.getDivHieght(self.id);
            self.masterChart.recalculateDivSizes();
        } 
        if(dataSource.db_server === 'virtual' && dataSource.db_name === 'srctree')
        {            
            var srctree = cfg.srctree.split(',');
            var virtualSources = self.formVirtualSources(srctree);            
            if(self.isPriviousRequest(virtualSources))
            {
                return;
            }
            else{self.dataSources = [];self.axesToShow = []; self.firstRequest = true; }          
            var min = 9999999999999999;
            var max = 0;                
            for (var i = 0; i < virtualSources.length; i++) 
            { 
                if(virtualSources[i].channels.split(',').length > 10)
                {
                    alert('You setted up more then 10 channels.');
                    return;
                }
                self.formAxesInfo(virtualSources[i]);
                if(experiment === '-' || experiment === '*-*')
                { 
                    var time = self.getExperimentInterval(virtualSources[i]);                           
                    var beginTime = time.split('-')[0];
                    var endTime = time.split('-')[1];
                    if(parseInt(min) > parseInt(endTime))
                    {
                        min = endTime;
                    }
                    if(parseInt(max) < parseInt(beginTime))
                    {
                        max = beginTime;
                    }  
                }
                else
                {
                    min = experiment.split('-')[1];
                    max = experiment.split('-')[0];
                }
            }
            self.dataSources = virtualSources;
            if(!self.stopPropagation)
            {
                self.refreshChartFromMasterChart(max, min);
                self.bindEvents();
                self.masterChart.bindEvents();
            }            
        }
        else
        {   
            if(self.isPriviousRequest([dataSource]))
            {
                return;
            }
            else{self.dataSources = []; self.firstRequest = true;self.axesToShow = [];}           
            if(experiment === '-' || experiment === '*-*')
            {
                experiment = self.getExperimentInterval(dataSource);
            }  
            if(dataSource.channels.split(',').length > 10)
            {
                alert('You setted up more then 10 channels.');
                return;
            }
            self.formAxesInfo(dataSource);
            self.dataSources.push(dataSource);
            self.renderChart(experiment);
            self.setChartTitle();
        }   
    };

    me.renderChart = function(experiment)
    {
        var self = this;       
        self.divWidth = self.getDivWidth(self.id);
        self.divHieght = self.getDivHieght(self.id);
        self.pointCount = self.divWidth * self.resolutionMultiplier;
        self.onDraggingRigth = self.divWidth - self.onDraggingLeft;        

        self.series = [];
        self.dataSourcesToChannels = [];
        self.formChart(self.id, self.series);
        self.chart = jQuery('#' + self.id).highcharts();
        self.masterChart.setOnZoomCallback(self.onZoomMasterChartEvent.bind(self));
        try
        {
            
                self.db.getData(self.dataSources[0].db_server, self.dataSources[0].db_name, self.dataSources[0].db_group,
                        self.dataSources[0].channels, experiment,
                        self.pointCount, self.dataSources[0].aggregation, function(obj)
                {
                    self.dataSourceLevel = self.db.level.window;
                    if (obj === null)
                    {
                        //alert('No data in server responces.');
                        console.log('No data in server responces');
                    }
                    else
                    {
                        for (var i = 0; i < obj.data.length; i++)
                        {
                            var series = self.parseData(obj, i);
                            series.dataSource = self.dataSources[self.currentDataSource].db_server + ' ' + self.dataSources[self.currentDataSource].db_name + ' ' + self.dataSources[self.currentDataSource].db_group;                        
                            self.addSeries(series, true);  
                            self.dataSourcesToChannels.push(self.dataSources[0].db_server  + ' '
                            + self.dataSources[0].db_name  + ' ' 
                            + self.dataSources[0].db_group);

                        }
                        var masterSeries = {};
                        masterSeries.data = self.series[0].data;
                        masterSeries.name = self.series[0].name;
                        self.masterChart.renderMasterChar(self.masterChartId, masterSeries, self.masterChartSeriesNumber);
                        self.masterChart.changePlotbands(experiment.split('-')[0] * 1000, experiment.split('-')[1] * 1000);
                        if(self.firstRequest === true)
                        {
                             
                            var max = self.chart.xAxis[0].max;
                            var min = self.chart.xAxis[0].min;
                            if(typeof self.needenWindow.split('-')[1] !== 'undefined')
                            {
                                var minWindow = parseInt(self.needenWindow.split('-')[0]) * 1000;
                                var maxWindow = parseInt(self.needenWindow.split('-')[1]) * 1000;
                                if(minWindow >= min && maxWindow <= max && minWindow < maxWindow)
                                {
                                    min = minWindow;
                                    max = maxWindow;
                                }
                            }
                            else
                            {
                                var diffrence = max - min;                    
                                if(diffrence > (parseInt(self.needenWindow) * 1000))
                                {
                                    min = max - parseInt(self.needenWindow) * 1000;
                                }
                            }                
                            self.chart.xAxis[0].setExtremes(min, max);
                            self.masterChart.changePlotbands(min, max);
                            self.firstRequest = false;                            
                        }
                    }
                    self.rebuildAxesControls();

                });
            
        }
        catch (ex)
        {
            console.log(ex);
        }

    };

    jQuery(window).resize(function() 
    {   
        chart.resizeCharts();        
        chart.masterChart.recalculateDivSizes();        
        chart.divWidth = chart.getDivWidth(chart.id);
        chart.divHieght = chart.getDivHieght(chart.id);
    });

    me.formChart = function(id, series, yAxises)
    {
        var self = this;
        var title = self.formTitle();
        for(var i = 0; i < series.length; i++)
        {
    	    series[i].lineWidth = 1;
        }
        self.chartOptions = {
            chart:
                    {                        
                        zoomType: self.zoomType,
                        height: 800,
                        events:
                                {
                                    selection: self.onZoomEvent.bind(self)
                                },
                        interpolate: 
                                {
                                    enabled: true                                                                                   
                                },
                        plotShadow: true,
                        animation: false,
                        marginRight: self.onDraggingLeft,
                        resetZoomButton: 
                        {
                            theme:
                            {
                                display: 'none'
                            }
                        }


                    },
            credits:
                    {
                        enabled: false
                    },
            title:
                    {
                        text: title,
                        margin: 10
                    },
            yAxis: self.axesToShow,
            xAxis:
                    {
                        type: 'datetime',
                        gridLineWidth: 0.5
                    },
            legend:
                    {
                        enabled: self.isLegendEnabled,               
                        itemHiddenStyle:
                                {
                                    color: '#000000',
                                    fontWeight: 'normal'
                                },
                        itemStyle:
                                {
                                    color: '#000000',
                                    fontWeight: 'bold'
                                },
                        align: 'right',
                        verticalAlign: 'top',
                        layout: 'vertical',
                        y: 35,
                        x: -self.onDraggingLeft - 80,
                        symbolHeight: 20,
                        floating: false,
                        marginRight: 100,
                    },
            plotOptions:
                    {
                        line:
                                {
                                    dataLabels:
                                            {
                                                enabled: false,
                                            }
                                },
                        series:
                                {
                                    stacking: null,
                                    allowPointSelect: true,
                                    connectNulls: false,
                                    cursor: 'pointer',
                                    point:
                                            {
                                                events:
                                                        {
                                                            click: self.showLabels
                                                        }
                                            },
                                    marker:
                                            {
                                                enabled: false,
                                                states:
                                                        {
                                                            hover:
                                                                    {
                                                                        enabled: true
                                                                    }


                                                        }
                                            },
                                    shadow: false,
                                    states:
                                            {
                                                hover:
                                                        {
                                                    	    enabled: true,
                                                    	    lineWidth: 1
                                                            
                                                        }
                                            },
                                    threshold: null,
                                }


                    },
            tooltip:
                    {
                        useHTML: true,
                        enabled: false,
                        shared: true,
                        crosshairs: [{
                                width: 0.5,
                                color: 'red',
                                dashStyle: 'longdash'
                            }],
                        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
                        valueDecimals: 8,
                        hideDelay: 0,
                        animation: false,
                        xDateformat: '%Y-%m-%d<br/>%H:%M',
                        positioner: self.tooltipPosition.bind(self)
                    },
            series: series,
            exporting: 
            {
                buttons: 
                {                    
                    menu: {
                        x: -70,
                        symbol: 'circle',
                        menuItems: self.menuItems,                                            
                    },                   
                    zoomInButton: {
                        x: -80,
                        y: 40,
                        onclick: self.zoomIn.bind(self),
                        text: 'Zoom in',  
                        theme: 
                        {
                            zIndex: 20
                        },                           
                    },
                    zoomOutButton: {
                        x: -80,
                        y: 70,
                        onclick: self.zoomOut.bind(self),
                        text: 'Zoom out',   
                        theme: 
                        {
                            zIndex: 20
                        },  
                    }
                    
                }
            }
        };
        jQuery('#' + id).highcharts(self.chartOptions);
        self.chart = jQuery('#' + self.id).highcharts();
        var sourceWidth;
        if(document.getElementById('main_sidebar_source').offsetWidth > document.getElementById('main_sidebar_controls').offsetWidth)
        {
            sourceWidth = document.getElementById('main_sidebar_source').offsetWidth;
        }
        else
        {
            sourceWidth = document.getElementById('main_sidebar_controls').offsetWidth;
        }
        self.chart.setSize
        (
            jQuery(window).width() - sourceWidth, 
            jQuery(window).height() - document.getElementById('header_div').offsetHeight - 100  - 70,
            false
        ); 
        self.divWidth = self.getDivWidth(self.id);
        self.divHieght = self.getDivHieght(self.id);
        self.buildControls();
        self.bindEvents();
        self.masterChart.bindEvents();
        //makeScalabale(Highcharts);
        /* (function(H)
         {
         H.wrap(H.Tooltip.prototype, 'refresh', function(proceed, point, e)
         {
         if (e.type !== 'mousemove' )
         {
         proceed.call(this, point, e);
         }

         });
         H.addEvent(H.Point.prototype, 'click', function(e)
         {
         e.point.series.chart.tooltip.refresh(e.point, e);
         });
         }(Highcharts));*/
    };

    me.onZoomEvent = function(event)
    {
        var self = this;
        if (event.xAxis)
        {
            var begTime = event.xAxis[0].min / 1000;
            var endTime = event.xAxis[0].max / 1000;
            var prevBegTime = event.xAxis[0].axis.min / 1000;
            var prevEndTime = event.xAxis[0].axis.max / 1000;
            var max = event.yAxis[0].max;
            var min = event.yAxis[0].min;
            var prevMin = event.yAxis[0].axis.min;
            var prevMax = event.yAxis[0].axis.max;
            var diffY = (max - min) / self.divHieght;
            var diffX = (endTime - begTime) / self.divWidth;
            var prevDiffY = (prevMax - prevMin) / self.divHieght;
            var prevDiffX = (prevEndTime - prevBegTime) / self.divWidth;
            if(diffY <= prevDiffY / 30)
            {
                self.resetXAxisAfterRenderTime = false;
                self.resetYAxisAfterRenderTime = true;
            }
            if(diffX <= prevDiffX / 30)
            {
                self.resetXAxisAfterRenderTime = true;
                self.resetYAxisAfterRenderTime = false;
                begTime = prevBegTime;
                endTime = prevEndTime;             
            }
            self.masterChart.changePlotbands(begTime * 1000, endTime * 1000);
            if(!self.stopPropagation)
            {
                self.refreshChart(begTime, endTime);
            }
        }
        else
        {
            self.resetYAxis();
        }

    };

    me.onZoomMasterChartEvent = function(event)
    {
        var self = this;
        //self.hideLegend();
        var begTime = event.xAxis[0].min / 1000;
        var endTime = event.xAxis[0].max / 1000;
        begTime = (begTime.toString()).split('.')[0];
        endTime = (endTime.toString()).split('.')[0];
        self.initialBeginTime = begTime;
        self.initialEndTime = endTime;
        if(!self.stopPropagation)
        {
            self.refreshChartFromMasterChart(begTime, endTime); 
        }        
    };



    me.refreshZoomSeries = function(beginTime, endTime)
    {
        var self = this;
        var beginTime1 = beginTime - (endTime - beginTime);
        var endTime1 = endTime + (endTime - beginTime);
        try
        {

            self.db.getData(self.dataSources[self.currentDataSource].db_server, self.dataSources[self.currentDataSource].db_name, self.dataSources[self.currentDataSource].db_group,
                    self.dataSources[self.currentDataSource].channels, beginTime1 + '-' + endTime1,
                    self.pointCount, self.dataSources[self.currentDataSource].aggregation, function(obj)
            {
                self.dataSourceLevel = self.db.level.window;
                if (obj === null)
                {
                    self.currentDataSource++;
                    self.series.push([]);
                    self.refreshChart(beginTime, endTime);
                    console.log('No data in server responces.');
                    //alert('No data in server responces.');
                    return;                   
                }
                else
                {                   
                    for (var i = 0; i < obj.data.length; i++)
                    {
                        var series = self.parseData(obj, i); 
                        self.series.push(series);  
                    }
                    self.currentDataSource++;
                    self.refreshChart(beginTime, endTime);

                }
            });

        }
        catch (ex)
        {
            self.currentDataSource++;
            self.refreshChart(beginTime, endTime);
            console.log(ex);
        }
    };

    me.refreshChart = function(beginTime, endTime)
    {
        var self = this;        
        if (self.currentDataSource === 0)
        {        
            self.stopPropagation = true;   
            self.series = [];       
            self.refreshZoomSeries(beginTime, endTime);
        }
        else if (self.currentDataSource < self.dataSources.length)
        {
            self.refreshZoomSeries(beginTime, endTime);
        }
        else
        {                      
            
            self.setUpNewSeries();
            var xAxis = self.chart.xAxis[0];
            xAxis.setExtremes(beginTime * 1000, endTime * 1000, false);
            //self.chart.redraw();
            if(self.resetYAxisAfterRenderTime)
            {
                self.resetYAxis();
                self.resetYAxisAfterRenderTime = false;
            }            
            self.currentDataSource = 0;
            self.chart.redraw();
            self.rebuildAxesControls();
            self.stopPropagation = false;            
            self.setChartTitle();
        }         
    };

    me.setChartTitle = function()
    {
        var self = this;
        var title = self.formTitle();
        self.chart.setTitle({text: title}); 
    };

    me.setUpNewSeries = function()
    {
        var self = this;
        for (var i = 0; i < self.series.length; i++)            
        {
            for(var j = 0; j < self.chart.series.length; j++)
            {
                if(typeof self.chart.series[j] !== 'undefined' && self.chart.series[j].name === self.series[i].name)
                {   
                    self.chart.series[j].setData(self.series[i].data, false, false);
                    break;                                     
                }    
                else if(self.series.length > self.chart.series.length)
                {
                    /*self.series[i].lineWidth = 1;
                    self.chart.addSeries(self.series[i], false);  
                    break;*/

                }            
            }            
        }

    };

    me.refreshSeries = function(beginTime, endTime)
    {
        var self = this;
        try
        {
            self.db.getData(self.dataSources[self.currentDataSource].db_server, self.dataSources[self.currentDataSource].db_name, self.dataSources[self.currentDataSource].db_group,
                    self.dataSources[self.currentDataSource].channels, beginTime + '-' + endTime,
                    self.pointCount, self.dataSources[self.currentDataSource].aggregation, function(obj)
            {
                self.dataSourceLevel = self.db.level.window;
                if (obj === null)
                {
                    self.currentDataSource++;
                    self.refreshChartFromMasterChart(beginTime, endTime);
                    //self.addSeries({data: [], name: '', pointInterval: self.dataSourceLevel * 1000}, false);                   
                    self.dataSourcesToChannels.push(self.dataSources[self.currentDataSource].db_server  + ' '
                        + self.dataSources[self.currentDataSource].db_name  + ' ' 
                        + self.dataSources[self.currentDataSource].db_group);
                    //alert('No data in server responces.');
                    console.log('No data in server responces');
                    return;
                }
                else
                {      
                    for (var i = 0; i < obj.data.length; i++)
                    {             
                        var series = self.parseData(obj, i);
                        series.dataSource = self.dataSources[self.currentDataSource].db_server + ' ' + self.dataSources[self.currentDataSource].db_name + ' ' + self.dataSources[self.currentDataSource].db_group;
                        self.addSeries(series, false);                       
                        self.dataSourcesToChannels.push(self.dataSources[self.currentDataSource].db_server  + ' '
                        + self.dataSources[self.currentDataSource].db_name  + ' ' 
                        + self.dataSources[self.currentDataSource].db_group);
                    }
                    self.currentDataSource++;
                    self.refreshChartFromMasterChart(beginTime, endTime);
                }
            });

        }
        catch (ex)
        {     
            self.currentDataSource++;
            self.refreshChartFromMasterChart(beginTime, endTime);
            //self.addSeries({data: [], name: '', pointInterval: self.dataSourceLevel * 1000}, false);
            self.dataSourcesToChannels.push(self.dataSources[self.currentDataSource].db_server  + ' '
                + self.dataSources[self.currentDataSource].db_name  + ' ' 
                + self.dataSources[self.currentDataSource].db_group);         
            console.log(ex);
        }
    };

    me.refreshChartFromMasterChart = function(beginTime, endTime)
    {
        var self = this;       
        if (self.currentDataSource === 0)
        {            
            self.stopPropagation = true;
            self.dispose();       
            self.formChartWithEmptySeries();
            self.refreshSeries(beginTime, endTime);   
        }
        else if (self.currentDataSource < self.dataSources.length)
        {
            self.refreshSeries(beginTime, endTime);
        }
        else
        {   
            self.afterGettingData();
            self.currentDataSource = 0;
            self.stopPropagation = false;
            self.setChartTitle();
        }               
    };

    me.afterGettingData = function()
    {
        var self = this;  
        self.chart.redraw();              
        if(self.firstRequest === true)
        {  
            self.setXAxisWithNeedenWindow();      
            self.refreshMasterChart(self.chart.xAxis[0].min, self.chart.xAxis[0].max);                     
            self.firstRequest = false;               
        }        
        //self.chart.redraw();
        self.rebuildAxesControls(); 
    };

    me.setXAxisWithNeedenWindow = function()
    {
        var self = this;
        var max = self.chart.xAxis[0].max;
        var min = self.chart.xAxis[0].min;              
        if(typeof self.needenWindow.split('-')[1] !== 'undefined')
        {
            var minWindow = parseInt(self.needenWindow.split('-')[0]) * 1000;
            var maxWindow = parseInt(self.needenWindow.split('-')[1]) * 1000;
            if(minWindow >= min && maxWindow <= max && minWindow < maxWindow)
            {
                min = minWindow;
                max = maxWindow;
            }
        }
        else
        {
            var diffrence = max - min;                    
            if(diffrence > (parseInt(self.needenWindow) * 1000))
            {
                min = max - parseInt(self.needenWindow) * 1000;
            }
        }  

        self.chart.xAxis[0].setExtremes(min, max);    
    };

    me.refreshMasterChart = function(beginTime, endTime)
    {
        var self = this;
        if(self.masterChart.chart !== null)
        {
            self.masterChart.dispose();
        }
        if(self.masterChart.series.length === 0)
        {
            var masterSeries = {};
            masterSeries.data = self.series[0].data;
            masterSeries.name = self.series[0].name;
            self.masterChart.renderMasterChar(self.masterChartId, masterSeries, self.masterChartSeriesNumber);                            
        }      
        self.masterChart.changePlotbands(beginTime, endTime);
    };

    me.parseData = function(obj, i)
    {
        var self = this;
        var series = {yAxis: 0, data: [], name: '', pointInterval: self.dataSourceLevel * 1000};
        series.data = (obj.data[i]);
        series.name = obj.label[i];

        var name = obj.label[i];
        for(var k = 0; k < self.dataSources[self.currentDataSource].axesToChannels.length; k++)
        {
            if(self.dataSources[self.currentDataSource].axesToChannels[k].channelName === name)
            {
                series.channelNumber =  self.dataSources[self.currentDataSource].axesToChannels[k].channelNumber; 
                if(self.dataSources[self.currentDataSource].axesToChannels[k].currentAxis !== null)
                {
                    series.yAxis = self.dataSources[self.currentDataSource].axesToChannels[k].currentAxis;                                       
                }      
                else
                {
                    series.yAxis = 'standart';
                }                          
                break;
            }                      
        }        
	
    	if(series.yAxis !== 0)
    	{
    	    series.color = self.chart.get(series.yAxis).options.labels.style.color;    
    	}
    	else
    	{
    	    series.color = self.chart.yAxis[0].options.labels.style.color;
    	}               
        for (var j = 0; j < obj.data[i].length; j++)
        {
            var pointData = obj.data[i][j];            
            series.data[j] = [];  
            series.data[j].push(parseFloat(obj.dateTime[j]) * 1000);            
            series.data[j].push(pointData);
        }


        return series;
    };

    me.zoomChart = function(beginTime, endTime, refreshAfterTimeOut)
    {
        var self = this;       
        var xAxis = self.chart.xAxis[0];
        var yAxis = self.chart.yAxis[0];
        xAxis.setExtremes(beginTime * 1000, endTime * 1000);
        self.masterChart.changePlotbands(beginTime * 1000, endTime * 1000);

        if (refreshAfterTimeOut)
        {
            self.timer = setTimeout(function()
            {
                if(!self.stopPropagation)
                {
                    self.refreshChart(beginTime, endTime);
                }                
            }, 100);
        }
              
    };

    me.onScrollZoom = function(event)
    {
        var self = this;
        clearTimeout(self.timer);
        var e = window.event || event;
        self.delta = self.delta + Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        var btime = self.chart.xAxis[0].min / 1000;
        var etime = self.chart.xAxis[0].max / 1000;
        var diffrence = (etime - btime) / self.divWidth * self.zoomMultiplier;
        var begTime = btime + (diffrence * self.delta);
        var endTime = etime - (diffrence * self.delta);
        self.delta = 0;
        self.zoomChart(begTime, endTime, true);

    };

    me.zoomIn = function(e)
    {
        var self = this;
        //window.event.stopPropagation();
        //window.event.cancelBubble = true;
        var beginTime = self.chart.xAxis[0].min + ((self.chart.xAxis[0].max - self.chart.xAxis[0].min) / 4);
        var endTime = self.chart.xAxis[0].max - ((self.chart.xAxis[0].max - self.chart.xAxis[0].min) / 4);        
        if(!self.stopPropagation)
        {
            self.zoomChart(beginTime / 1000, endTime / 1000, false);
            self.refreshChart(beginTime / 1000, endTime / 1000);
        }        
    };  

    me.zoomOut = function(e)
    {
        var self = this;
        //window.event.stopPropagation();
        //window.event.cancelBubble = true;
        var beginTime = self.chart.xAxis[0].min - ((self.chart.xAxis[0].max - self.chart.xAxis[0].min) / 4);
        var endTime = self.chart.xAxis[0].max + ((self.chart.xAxis[0].max - self.chart.xAxis[0].min) / 4);
        if(!self.stopPropagation)
        {
            self.zoomChart(beginTime / 1000, endTime / 1000, false);
            self.refreshChart(beginTime / 1000, endTime / 1000);
        }    
    };

    me.bindEvents = function()
    {
        var self = this;
        var chartContainer = document.getElementById(self.id);   
        /*chartContainer.onmousewheel = self.onScrollZoom.bind(self);
        chartContainer.onmousedown = self.startDrag.bind(self);
        chartContainer.onmousemove =  self.drag.bind(self);
        chartContainer.onmouseup = self.stopDrag.bind(self);*/
        chartContainer.addEventListener("mousewheel" || "onscroll", self.onScrollZoom.bind(self), true);
        chartContainer.addEventListener('mousedown', self.startDrag.bind(self), false);
        chartContainer.addEventListener('mousemove', self.drag.bind(self), false);
        chartContainer.addEventListener('mouseup', self.stopDrag.bind(self), false);
//        var draggabaleContainer = document.getElementById("draggabaleZone");
//        draggabaleContainer.addEventListener("mousemove", function(e)
//        {
//            var left = e.pageX - draggabaleContainer.offset().left;
//            if ((left >= 0 && left <= self.onDraggingLeft) || (left >= self.onDraggingRigth && left <= self.divWidth))
//            {
//
//            }
//        }, false);

    };

    me.changeTooltipPosition = function(event)
    {
        var self = this;
        self.tooltipX = event.clientX;
        self.tooltipY = event.clientY;

    };

    me.startDrag = function(event)
    {
        var self = this;
        if (event.which === 1)
        {
            var chartContainer = document.getElementById(self.id);
            if (!self.dragData)
            {
                var e = event || event;
                var left = self.chart.chartWidth - e.clientX;

                if (self.zoomType === 'xy')
                {
                   /* if ((left >= 0 && left <= self.onDraggingLeft) || (left >= self.onDraggingRigth && left <= self.divWidth))
                    {
                        document.body.style.cursor = "move";
                        self.dragData =
                                {
                                    x: e.clientX - chartContainer.offsetLeft,
                                    y: e.clientY - chartContainer.offsetTop
                                };
                    }*/
                }
                else
                {
                    if (left <= 120)
                    {                        
                        self.dragData = null;
                    }
                    else
                    {
                          document.body.style.cursor = "move";
                          self.dragData =
                            {
                                x: e.clientX - chartContainer.offsetLeft,
                                y: e.clientY - chartContainer.offsetTop
                            };
                    }
                  
                }
            }
        }
        else if (event.which === 2)
        {
            self.resetYAxis();
        }
    };

    me.drag = function(event)
    {
        var self = this;

        if (self.dragData)
        {
            var e = event || event;
            var diff;
            var btime;
            var etime;

            if (self.previousStateX === null && self.previousStateY === null)
            {
                self.previousStateX = e.clientX;
                self.previousStateY = e.clientY;
            }

            var mapDiffX = self.previousStateX - e.clientX;
            var mapDiffY = self.previousStateY - e.clientY;

            var begTime = self.chart.xAxis[0].min / 1000;
            var endTime = self.chart.xAxis[0].max / 1000;
         
            /*var minY = [];
            var maxY = [];
            var min = [];
            var max = [];
            var multiplierY = [];
            for(var i = 0; i < self.chart.yAxis.length; i++)
            {
                minY.push(self.chart.yAxis[i].min);
                maxY.push(self.chart.yAxis[i].max);
                multiplierY.push((maxY[i] - minY[i]) / self.divHieght);
                min.push(minY[i] - mapDiffY * multiplierY[i]);
                max.push(maxY[i] - mapDiffY * multiplierY[i]);
            }   */

            var multiplier = (endTime - begTime) / self.chart.chartWidth;            
            if (self.zoomType === 'xy')
            {               
                btime = begTime + mapDiffX * multiplier;
                etime = endTime + mapDiffX * multiplier;
                self.zoomChart(btime, etime, false);
            }
            else
            {
                btime = begTime + mapDiffX * multiplier;
                etime = endTime + mapDiffX * multiplier;


                for(var i = 0; i < self.chart.yAxis.length; i++)
                {
                    var yAxis = self.chart.yAxis[i];
                    var max = yAxis.max;
                    var min = yAxis.min;
                    var multiplierY = (max - min) / self.divHieght;
                    var minY = min - mapDiffY * multiplierY;
                    var maxY = max - mapDiffY * multiplierY;

                    if(yAxis.oldUserMax !== maxY &&
                        yAxis.oldUserMin !== minY &&
                        yAxis.oldMax !== maxY &&
                        yAxis.oldMin !== minY)
                    {
                        yAxis.options.startOnTick = false;
                        yAxis.options.endOnTick = false;
                        yAxis.setExtremes(minY, maxY);
                    }                    
                }

                self.zoomChart(btime, etime, false);
                /*for(var i = 0; i < self.chart.yAxis.length; i++)
                {
                    self.chart.yAxis[i].options.startOnTick = false;
                    self.chart.yAxis[i].options.endOnTick = false;
                    self.chart.yAxis[i].setExtremes(min[i], max[i]);
                }    */

                


            }
            self.previousStateX = e.clientX;
            self.previousStateY = e.clientY;


        }
    };

    me.stopDrag = function(event)
    {
        var self = this;
        if (self.dragData)
        {
            self.rebuildAxesControls();
            var btime = self.chart.xAxis[0].min / 1000;
            var etime = self.chart.xAxis[0].max / 1000;
            document.body.style.cursor = "default";
            if(!self.stopPropagation)
            {
                self.refreshChart(btime, etime);
            }            
            self.dragData = null;
            self.previousStateX = null;
            self.previousStateY = null;
        }
    };


    me.resetYAxis = function()
    {
        var self = this;       
        for(var i = 0; i < self.chart.yAxis.length; i++)
        {
            var yAxis = self.chart.yAxis[i];
            var max = yAxis.getExtremes().dataMax;
            var min = yAxis.getExtremes().dataMin;
            var margin = (max - min) / 10;
            self.chart.yAxis[i].options.startOnTick = false;
            self.chart.yAxis[i].options.endOnTick = false;
            yAxis.setExtremes(min - margin, max + margin, false);
        }
        self.chart.redraw();
        self.rebuildAxesControls();
    };

    me.tooltipPosition = function()
    {
        var self = this;
        return {x: self.tooltipX, y: self.tooltipY};
    };


    me.getDivWidth = function(id)
    {
        return document.getElementById(id).offsetWidth;
    };

    me.getDivHieght = function(id)
    {
        return document.getElementById(id).offsetHeight;
    };

    me.formTitle = function()
    {
        var self = this;
        var title = '';
        for (var i = 0; i < self.dataSources.length; i++)
        {
            var db_server = self.dataSources[i].db_server;
            var db_name = self.dataSources[i].db_name;
            var db_group = self.dataSources[i].db_group;
            var level = self.db.level.window;
            title = title + db_server + ' ' + db_name + ' ' + db_group + ' resolution:' + level + ' ';
        }
        return title;
    };

    me.hideLegend = function()
    {
        var self = this;
        var begTime = self.chart.xAxis[0].min;
        var endTime = self.chart.xAxis[0].max;
        var max = [];        
        var min = []; 
        for(var i = 0; i < self.chart.yAxis.length; i++)
        {
            max.push(self.chart.yAxis[i].max);
            min.push(self.chart.yAxis[i].min);
        }   


        self.isLegendEnabled = false;
        self.formChart(self.id, self.series);
        self.chart = jQuery('#' + self.id).highcharts();
        for(var i = 0; i < self.chart.yAxis.length; i++)
        {
            self.chart.yAxis[i].options.startOnTick = false;
            self.chart.yAxis[i].options.endOnTick = false;
            self.chart.yAxis[i].setExtremes(min[i], max[i], false);
        }    
        
        self.chart.xAxis[0].setExtremes(begTime, endTime, false);        
        self.masterChart.changePlotbands(begTime, endTime);
        self.chart.redraw();
        self.rebuildAxesControls();


};


    me.rebuildAxesControls = function()
    {
        var self = this;
        jQuery(".axisControl").remove();

        var yAxes = document.getElementsByClassName("highcharts-axis-labels highcharts-yaxis-labels");        
        for(var i = 0; i < self.chart.yAxis.length; i++)
        {
            var axisBox = yAxes[i + 1].getBBox();
            var yAxis = self.chart.yAxis[i];

            bBoxWidth = axisBox.width + 20;
            bBoxHeight = axisBox.height;
            bBoxX = axisBox.x - 10;
            bBoxY = axisBox.y;

            labelGroupBBox = self.chart.renderer.rect(bBoxX, bBoxY, bBoxWidth, bBoxHeight)
            .attr({
                class: 'axisControl',
                fill: '#fff',
                opacity: 0,
                zIndex: 8
            })
            .css({
                cursor: 'ns-resize'
            })
            .add();

            var isDragging = false;
            var isDraggingMaxExtreme = false;
            var isDraggingMinExtreme = false;
            var downYValue;

            var rectangles = document.getElementsByClassName('axisControl');
            var rect = rectangles[i];
            var downYValue;

            rectangles[i].onmousedown = function(yAxis, rect)
            { 
                return function(e)
                {   
                    isDragging = true;  
                    //if(self.zoomType !== 'xy')
                    //{
                        window.event.cancelBubble = true;
                        window.event.stopPropagation();
                    //}   
                    /*var higherPosition = rect.getBBox().height / 2 - 100;
                    var downPosition = higherPosition + 200;
                    if(e.offsetY < higherPosition)
                    {
                        isDraggingMaxExtreme = true;       
                        isDraggingMinExtreme = false;                 
                    }
                    else if(e.offsetY > downPosition)
                    {
                        isDraggingMinExtreme = true;
                        isDraggingMaxExtreme = false;
                    }
                    else
                    {
                        isDraggingMaxExtreme = false;
                        isDraggingMinExtreme = false;
                    } */                
                };
            }(yAxis, rect);

            rectangles[i].onmousemove = function(yAxis, rect)
            { 
                return function(e)
                {    
                    window.event.cancelBubble = true;
                    window.event.stopPropagation();
                    if (isDragging) 
                    {                           
                        if (self.previousStateX === null && self.previousStateY === null)
                        {                            
                            self.previousStateY = e.clientY;
                        }
                        var mapDiffY = self.previousStateY - e.clientY;

                        var max = yAxis.max;
                        var min = yAxis.min;
                        if(self.divHieght === 0)
                        {self.divHieght = 800;}
                        var multiplierY = (max - min) / self.divHieght;
                        var minY = min - mapDiffY * multiplierY;
                        var maxY = max - mapDiffY * multiplierY;    

                        /*extremes = yAxis.getExtremes(),
                        userMin = extremes.userMin,
                        userMax = extremes.userMax,
                        dataMin = extremes.dataMin,
                        dataMax = extremes.dataMax,

                        minimum = userMin !== undefined ? userMin : dataMin,
                        maximum = userMax !== undefined ? userMax : dataMax;*/

                        if(yAxis.oldUserMax !== maxY &&
                            yAxis.oldUserMin !== minY &&
                            yAxis.oldMax !== maxY &&
                            yAxis.oldMin !== minY)
                        {
                            /*if(isDraggingMinExtreme)
                            {
                                yAxis.options.startOnTick = false;
                                yAxis.options.endOnTick = false;
                                minY = minY > dataMin ? minY : dataMin;
                                yAxis.setExtremes(minY, max, true, false);
                            } else if(isDraggingMaxExtreme)
                            {
                                yAxis.options.startOnTick = false;
                                yAxis.options.endOnTick = false;
                                maxY = maxY > dataMax ? maxY : dataMax;                                
                                yAxis.setExtremes(min, maxY, true, false);
                            }
                            else 
                            {*/
                                yAxis.options.startOnTick = false;
                                yAxis.options.endOnTick = false;
                                yAxis.setExtremes(minY, maxY, true, false);
                        //    }                            
                        } 

                    }
                        self.previousStateY = e.clientY;  
                                    
                                 
                    
                };
            }(yAxis, rect);

            rectangles[i].onmouseup = function(yAxis, rect)
            { 
                return function(e)
                {                
                    window.event.cancelBubble = true;
                    window.event.stopPropagation();
                    self.rebuildAxesControls();
                    self.previousStateY = null;
                    isDragging = false;    
                    isDraggingMinExtreme = false;
                    isDraggingMaxExtreme = false;                    
                };
            }(yAxis, rect);

            rectangles[i].onmouseout = function(yAxis, rect)
            { 
                return function(e)
                {                
                    window.event.cancelBubble = true;
                    window.event.stopPropagation();
                    self.rebuildAxesControls();
                    self.previousStateY = null;
                    isDragging = false;    
                    isDraggingMinExtreme = false;
                    isDraggingMaxExtreme = false;                    
                };
            }(yAxis, rect);

            rectangles[i].ondblclick = function(yAxis, rect)
            { 
                return function(e)
                {                
                    var extremes = yAxis.getExtremes(),
                    dataMin = extremes.dataMin,
                    dataMax = extremes.dataMax;
                    yAxis.setExtremes(dataMin, dataMax, true, false);
                };
            }(yAxis, rect);





        }
    };

    me.resizeCharts = function()
    {
        var self = this;
        var sourceWidth;
        if(document.getElementById('main_sidebar_source').offsetWidth > document.getElementById('main_sidebar_controls').offsetWidth)
        {sourceWidth = document.getElementById('main_sidebar_source').offsetWidth;}
        else{sourceWidth = document.getElementById('main_sidebar_controls').offsetWidth}
        self.chart.setSize(
            jQuery(window).width() - sourceWidth, 
            jQuery(window).height() - document.getElementById('header_div').offsetHeight - 100  - 70,
            true
        ); 
        self.masterChart.chart.setSize(
            jQuery(window).width() - sourceWidth,
            150
        );
        self.masterChart.rebuildControls(jQuery(window).width() - sourceWidth);
    };

    me.showLegend = function()
    {
        var self = this;
        var begTime = self.chart.xAxis[0].min;
        var endTime = self.chart.xAxis[0].max;
        var max = [];        
        var min = []; 
        for(var i = 0; i < self.chart.yAxis.length; i++)
        {
            max.push(self.chart.yAxis[i].max);
            min.push(self.chart.yAxis[i].min);
        }   

        self.isLegendEnabled = true;
        self.formChart(self.id, self.series);
        self.chart = jQuery('#' + self.id).highcharts();
        for(var i = 0; i < self.chart.yAxis.length; i++)
        {
            self.chart.yAxis[i].options.startOnTick = false;
            self.chart.yAxis[i].options.endOnTick = false;
            self.chart.yAxis[i].setExtremes(min[i], max[i], false);
        }            
        self.chart.xAxis[0].setExtremes(begTime, endTime, false);
        self.masterChart.changePlotbands(begTime, endTime);
        self.chart.redraw();
        self.rebuildAxesControls();
    };

    me.showLabels = function(e)
    {
        var self = this;
//        if (self.cloneToolTip)
//        {
//            self.chart.container.firstChild.removeChild(self.cloneToolTip);
//        }
//        if (self.cloneToolTip2)
//        {
//            self.cloneToolTip2.remove();
//        }
//        self.cloneToolTip = self.chart.tooltip.label.element.cloneNode(true);
//        self.chart.container.firstChild.appendChild(self.cloneToolTip);
//
//        self.cloneToolTip2 = jQuery('.highcharts-tooltip').clone();
//        jQuery(self.chart.container).append(self.cloneToolTip2);

//        hs.htmlExpand(null, {
//            pageOrigin: {
//                x: this.pageX,
//                y: this.pageY
//            },
//            headingText: this.series.name,
//            maincontentText: /*Highcharts.dateFormat('%Y-%m-%d<br/>%H:%M:%S', this.x)*/ this.x + '<br/> ' +
//                    this.y + '',
//            width: 300});

        var points = [];        
        var msg = '<div class="ui-dialog">';
        var heightY = chart.chart.plotHeight / 500;        
        var clientY = this.plotY;
        var max = clientY + heightY;
        var min = clientY - heightY;
        var seriesToMove;
        var dataSourceOfMovingSeries;
        for(var i = 0; i < chart.chart.series.length; i++)
        {            
            var minx = chart.chart.series[i].xAxis.min;
            var maxx = chart.chart.series[i].xAxis.max;
            var diffrencex = (maxx - minx) / 200; 
            for(var j = 0; j < chart.chart.series[i].points.length; j++)
            {                             
                var y = chart.chart.series[i].points[j].plotY;  
                var date = chart.chart.series[i].points[j].x;
                var value = chart.chart.series[i].points[j].y;

                if(date <= (this.x + diffrencex) && date >= (this.x - diffrencex) 
                    && y <= (max) && y >= (min))
                {
                    seriesToMove = chart.chart.series[i];
                    dataSourceOfMovingSeries = chart.dataSourcesToChannels[i];
                    msg = msg + '</br><strong>Data source:</strong>' + chart.dataSourcesToChannels[i] +
                     '</br><strong>Channel:</strong> ' + chart.chart.series[i].name + 
                     '</br><strong>Date:</strong> ' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S.%L', date) + 
                     '</br><strong>Value:</strong> ' + value + '</br>';
                    break;
                }           
            }
        }    
        var buttons;    
        var axesRelations = chart.getAxesRelations(dataSourceOfMovingSeries);        
        if(seriesToMove.yAxis.options.id === 'temporary')
        {
           buttons =  {"Delete this series from the temporary axis": function()
            {
                var flag;
                var needenAxis;
                if(seriesToMove.yAxis.series.length === 1)
                {
                    flag = true;                  
                } 
                for(var i = 0; i < axesRelations.length; i++)
                {
                    if(seriesToMove.options.channelNumber === axesRelations[i].channelNumber)
                    {
                        needenAxis = axesRelations[i].currentAxis = axesRelations[i].value;
                        break;
                    }
                }                           
                var jSONSeries = JSON.stringify(seriesToMove.options);
                var series = JSON.parse(jSONSeries);                    
                seriesToMove.remove();
                series.yAxis = needenAxis;
                series.color = chart.chart.get(needenAxis).options.labels.style.color;
                series.lineWidth = 1;
                chart.chart.addSeries(series, true);                    
                if(flag)
                {
                    var temporaryAxis = chart.chart.get('temporary');
                    temporaryAxis.remove();
                    chart.axesToShow.splice(chart.axesToShow.length, 1);
                }           
                chart.rebuildAxesControls();   
            }}                   
        }
        else
        {
            if(seriesToMove.yAxis.series.length !== 1)
            {            
                buttons = {"Show last series on another axis": function()
                {   
                    for(var i = 0; i < axesRelations.length; i++)
                    {
                        if(seriesToMove.options.channelNumber === axesRelations[i].channelNumber)
                        {                            
                            axesRelations[i].currentAxis = 'temporary';
                            break;
                        }
                    }
                    var temporaryAxis = chart.chart.get('temporary');
                    if(!temporaryAxis)
                    {
                        chart.chart.addAxis(chart.temporaryAxis, false, false);                        
                    }                      
                    var jSONSeries = JSON.stringify(seriesToMove.options);
                    var series = JSON.parse(jSONSeries);
                    seriesToMove.remove();
                    series.yAxis = 'temporary';
                    series.color = chart.temporaryAxis.labels.style.color;
                    series.lineWidth = 1;
                    chart.chart.addSeries(series, true);
                    chart.rebuildAxesControls();                                   
                }
                };
             }
        }
        msg = msg + '</div>';
        jQuery(msg).dialog({
            dialogClass: 'dialog',
            title: 'Point info',
            position: [e.clientX + 10, e.clientY + 10],
            closeText: 'Close',
            width: 'auto',
            maxWidth: 1000,
            height: 'auto',
            buttons: buttons
            /*close: function() {
                jQuery('#message' + this.x).remove();
            }*/
        });

    };

    me.getAxesRelations = function(dataSource)
    {
        var self = this;
        dataSource = dataSource.split(' ');
        for (var i = 0; i < self.dataSources.length; i++)
        {
            if (self.dataSources[i].db_server === dataSource[0] &&
                    self.dataSources[i].db_name === dataSource[1] &&
                    self.dataSources[i].db_group === dataSource[2])

            {
                return self.dataSources[i].axesToChannels;
            }
        }
    }

    me.formDataSources = function(dataSource)
    {
        var self = this;
        if (self.dataSources.length === 0)
        {
            self.dataSources.push(dataSource);
        }
        else
        {
            var flag = false;
            for (var i = 0; i < self.dataSources.length; i++)
            {
                if (self.dataSources[i].db_server === dataSource.db_server &&
                        self.dataSources[i].db_name === dataSource.db_name &&
                        self.dataSources[i].db_group === dataSource.db_group &&
                        self.dataSources[i].aggregation === dataSource.aggregation)

                {
                    flag = true;
                    self.dataSources[i].channels = dataSource.channels;
                    break;
                }
            }
            if (!flag)
            {
                self.dataSources.push(dataSource);
            }
        }

    };

    me.dispose = function()
    {
        var self = this;
        if(self.chart !== null)
        {
            self.chart.destroy();               
        }        
        self.dataSourcesToChannels = [];
        self.series = [];
    };

    me.formChartWithEmptySeries = function()
    {
        var self = this;
        self.formChart(self.id, []);
        self.chart = jQuery('#' + self.id).highcharts();
    };


    me.formVirtualSources = function(srctree)
    {
        var virtualSources = [];    
        for(var i = 0; i < srctree.length; i++)
        {
            var flag = false;
            var virtualSource = {};
            var group = srctree[i].split('__');
            if(typeof group[0] !== 'undefined' &&
               typeof group[1] !== 'undefined' &&
               typeof group[2] !== 'undefined' &&
               typeof group[3] !== 'undefined')
            {
                virtualSource.db_server = group[0];
                virtualSource.db_name = group[1];
                virtualSource.db_group = group[2];
                virtualSource.channels = group[3];
                for(var j = 0; j < virtualSources.length; j++)
                {
                    if(virtualSources[j].db_server === virtualSource.db_server &&
                       virtualSources[j].db_name === virtualSource.db_name &&
                       virtualSources[j].db_group === virtualSource.db_group)
                    {
                        flag = true;
                        virtualSources[j].channels = virtualSources[j].channels +  ',' + (virtualSource.channels);                       
                        break;
                    }
                }
                if(!flag)
                {                                  
                    virtualSources.push(virtualSource);
                }
                
            }
        }
        return virtualSources;

    };

    me.getSeries = function(id)
    {
        return this.series[id];
    };

    me.addAxis = function(axis)
    {
        this.chart.addAxis(axis, false, false);

    };

    me.changeZoomTypeToMap = function()
    {
        var self = this;
        var begTime = self.chart.xAxis[0].min;
        var endTime = self.chart.xAxis[0].max;
        var max = [];        
        var min = []; 
        for(var i = 0; i < self.chart.yAxis.length; i++)
        {
            max.push(self.chart.yAxis[i].max);
            min.push(self.chart.yAxis[i].min);
        }   


        self.zoomType = '';
        self.chart.destroy();
        self.formChart(self.id, self.series);
        self.chart = jQuery('#' + self.id).highcharts();
        for(var i = 0; i < self.chart.yAxis.length; i++)
        {
            self.chart.yAxis[i].options.startOnTick = false;
            self.chart.yAxis[i].options.endOnTick = false;
            self.chart.yAxis[i].setExtremes(min[i], max[i], false);
        }            
        self.chart.xAxis[0].setExtremes(begTime, endTime, false);
        self.masterChart.changePlotbands(begTime, endTime);
        self.chart.redraw();
        self.rebuildAxesControls();
    };

    me.changeZoomTypeToXY = function()
    {
        var self = this;
        var begTime = self.chart.xAxis[0].min;
        var endTime = self.chart.xAxis[0].max;
        var max = [];        
        var min = []; 
        for(var i = 0; i < self.chart.yAxis.length; i++)
        {
            max.push(self.chart.yAxis[i].max);
            min.push(self.chart.yAxis[i].min);
        }   


        self.zoomType = 'xy';
        self.formChart(self.id, self.series);
        self.chart = jQuery('#' + self.id).highcharts();
        for(var i = 0; i < self.chart.yAxis.length; i++)
        {
            self.chart.yAxis[i].options.startOnTick = false;
            self.chart.yAxis[i].options.endOnTick = false;
            self.chart.yAxis[i].setExtremes(min[i], max[i], false);
        }        
        
        self.chart.xAxis[0].setExtremes(begTime, endTime, false);
        self.masterChart.changePlotbands(begTime, endTime);
        self.chart.redraw();
        self.rebuildAxesControls();      
    };

    me.changeMasterChartSeries = function(seriesId)
    {
        if (seriesId > this.series.length && seriesId < 0)
        {
            return;
        }
        this.masterChart.renderMasterChar(this.masterChartId, this.series[seriesId],  this.masterChartSeriesNumber);
    };

    me.addSeries = function(series, isRedraw)
    {
        this.series.push(series);
        series.lineWidth = 1;        
        this.chart.addSeries(series, isRedraw);
    };

    me.addSeriesToMasterChart = function()
    {

    };

    me.addDataSource = function(dataSource, beginTime, endTime)
    {        

        this.formDataSources(dataSource);
        this.refreshChartFromMasterChart(beginTime, endTime);

    };

    me.getExperimentInterval = function(dataSource)
    {
        var self = this;
        var url = self.db.formURLInfo(dataSource.db_server, dataSource.db_name, dataSource.db_group, 'cache');        
        var responseXML = self.db.httpGetXml(url);
        var item = responseXML.getElementsByTagName('Value');
        if(typeof item[0] !== 'undefined')
        {
            var beginTime = item[0].getAttribute('first');
            var endTime = item[0].getAttribute('last');
            return beginTime + '-' + endTime;
        }
        else
        {
            throw 'Error while getting experiment interval from the server.'
        }
    };


    me.getDataSourcePeriod = function(dataSource)
    {
        var self = this;
        var url = self.db.formURLList(dataSource.db_server, dataSource.db_name, dataSource.db_group, 'max_resolution');              
        var responseXML = self.db.httpGetXml(url);
        var item = responseXML.getElementsByTagName('Value');
        var period = item[0].getAttribute('value');  
        return period;

    };

    me.isPriviousRequest = function(dataSources)
    {
        var self = this;
        if(dataSources.length !== self.dataSources.length)
        {return false;}
        for(var i = 0; i < dataSources.length; i++)
        {            
            if(dataSources[i].db_server !== self.dataSources[i].db_server ||
                  dataSources[i].db_name !== self.dataSources[i].db_name ||
                  dataSources[i].db_group !== self.dataSources[i].db_group ||
                  dataSources[i].channels !== self.dataSources[i].channels)
            {
                return false;
            }
        }
        return true;
    }

    me.getAllAxes = function()
    {
        var self = this;
        var url = self.db.formURLList('', '', '', 'axes');              
        var responseXML = self.db.httpGetXml(url);
        var axes = responseXML.getElementsByTagName('Value');
        var axesArray = [];        
        for(var i = 0; i < axes.length; i++)
        {
            var axisObj = {};
            axisObj.id = i;
            axisObj.value = axes[i].getAttribute('value');
            axisObj.units = axes[i].getAttribute('axis_units');
            axisObj.name = axes[i].getAttribute('axis_name');
            axesArray.push(axisObj);
        }
        return axesArray;
    };

    me.formURLAxes = function(db_server, db_name, db_group, db_channels, target)
    {
        var url = this.hostURL + '/services/list.php?db_server=' + db_server
                + '&db_name=' + db_name
                + '&db_group=' + db_group
                + '&db_mask=' + db_channels
                + '&target=' + target
                + '&info=1';
        return url;
    };
    
    me.httpGetText = function(url)
    {
	var xmlHttp = null;
	
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, false);
	xmlHttp.send(null);
	return xmlHttp.response;
    };

   me.stringtoXML = function(text)
   {
        if (window.ActiveXObject)
        {
    	    var doc=new ActiveXObject('Microsoft.XMLDOM');
    	    doc.async='false';
    	    doc.loadXML(text);
        } else 
        {
	    var parser=new DOMParser();
    	    var doc=parser.parseFromString(text,'text/xml');
	}
	return doc;
    };

    me.formNeedenAxes = function(dataSource)
    {
        var self = this;
        var url = self.formURLAxes(dataSource.db_server, dataSource.db_name, dataSource.db_group, dataSource.channels, 'items');              
        var responseXML = self.stringtoXML(self.httpGetText(url));
        var items = responseXML.getElementsByTagName('Value');
        var axesArray = [];        
        for(var i = 0; i < items.length; i++)
        {
            var axisObj = {};
            axisObj.channelNumber = items[i].getAttribute('value');
            axisObj.channelName = items[i].getAttribute('name');
            axisObj.value = items[i].getAttribute('axis'); 
            axisObj.currentAxis = items[i].getAttribute('axis');
            axesArray.push(axisObj);
        }
        return axesArray;
    };

    me.formAxesInfo = function(dataSource)
    {
        var self = this;
        var needenAxes = self.formNeedenAxes(dataSource);        
        //self.axesToChannels = self.axesToChannels.concat(needenAxes);
        
        dataSource.axesToChannels = needenAxes;

        var needenIds = [];
        needenIds.push(dataSource.axesToChannels[0]);
        
        for (var i = 0; i < dataSource.axesToChannels.length; i++)
        {
            var flag = false;
            for(var j = 0; j < needenIds.length; j++)
            {
                if(needenIds[j].value === dataSource.axesToChannels[i].value)
                {
                    flag = true;
                    break;
                }                
            }
            if(!flag)
            {    
                needenIds.push(dataSource.axesToChannels[i]);                
            }
        }

        self.needenAxes = needenIds;
        axesToShow = [];
        var counter = 1;
        var flag = false;
        for(var i = 0; i < self.axes.length; i++)
        {
    	    if(counter > 9)
    	    {
    	        counter = 1;
    	    }
            var axesObj = {value: '',labels: {format: '{value} ', style: { color: Highcharts.getOptions().colors[counter]}}, title: {text: '', style: { color: Highcharts.getOptions().colors[counter]}}};
            counter++;
            for(j = 0; j < self.needenAxes.length; j++)
            {
        	if(typeof self.needenAxes[j] === 'undefined')
                {
            	    flag = true;
            	    axesToShow.push({gridLineWidth: 0, id: 'standart',labels: {format: '{value}', style: { color: Highcharts.getOptions().colors[0]}}, title: {text: 'Standart axis', style: { color: Highcharts.getOptions().colors[0]}}});
            	    continue;    	    
        	}
        	else
        	{        	    
            	    if(self.needenAxes[j].value === null && flag === false)
            	    {
                	flag = true;
                	axesToShow.push({gridLineWidth: 0, id: 'standart',labels: {format: '{value}', style: { color: Highcharts.getOptions().colors[0]}}, title: {text: 'Standart axis', style: { color: Highcharts.getOptions().colors[0]}}});
                	continue;
            	    }
        	}
            	 
                if(self.needenAxes[j].value === self.axes[i].value)
                {
                    if(j !== 0)
                    {
                        axesObj.gridLineWidth = 0;
                    }                    
                    axesObj.id = self.axes[i].value;
                    axesObj.labels.format = axesObj.labels.format + self.axes[i].units;
                    axesObj.title.text = self.axes[i].name;      
                    axesObj.startOnTick = false;
                    axesObj.endOnTick = false;      
                    axesToShow.push(axesObj);
                }
            }

        }

        for (var i = 0; i < axesToShow.length; i++)
        {
            var flag = false;
            for(var j = 0; j < self.axesToShow.length; j++)
            {
                if(axesToShow[i].id === self.axesToShow[j].id)
                {
                    flag = true;
                    break;
                }                
            }
            if(!flag)
            {
                self.axesToShow.push(axesToShow[i]);                
            }
        }
    };

    me.buildControls = function(width)
    {
        var self = this;
        var chart = document.getElementsByClassName("highcharts-series-group")[0].getBBox();      
        var pos = jQuery('#' + self.id).position();
        var parent = document.getElementById('moduleChart');  
        self.leftControl = document.createElement('div');
        self.leftControl.className = 'chronoline-left';  
        self.leftControl.style.display = self.controlsVisibility; 
        var leftIcon = document.createElement('div');
        leftIcon.className = 'chronoline-left-icon';
        leftIcon.style.marginTop = '3px';
        leftIcon.style.marginLeft= '4px';
        self.leftControl.appendChild(leftIcon);
        self.leftControl.style.display = true;
        self.leftControl.style.marginTop = 10;
        self.leftControl.style.left = pos.left + self.chart.chartWidth - 150 + 'px';
        self.leftControl.style.top = pos.top + 90 + 'px';
        self.leftControl.style.marginTop = '40px';
        self.leftControl.style.height = ' 20px'; 
        self.leftControl.style.zIndex = 20; 
        self.leftControl.onclick = self.onMovingLeft.bind(self);      
        parent.appendChild(self.leftControl);


        self.rightControl = document.createElement('div');
        self.rightControl.className = 'chronoline-left'; 
        self.rightControl.style.display = self.controlsVisibility; 
        var rightIcon = document.createElement('div');
        rightIcon.className = 'chronoline-left-icon';                
        rightIcon.style.marginTop = '3px';
        rightIcon.style.marginLeft= '4px';
        self.rightControl.appendChild(rightIcon);
        self.rightControl.style.display = true;
        self.rightControl.style.marginTop = 10;
        self.rightControl.style.left = pos.left + self.chart.chartWidth - 110 + 'px';
        self.rightControl.style.top = pos.top + 90  + 'px';
        self.rightControl.style.marginTop = '40px';
        self.rightControl.style.height = ' 20px'; 
        self.rightControl.style.zIndex = 20;
        self.rightControl.style.webkitTransform = 'rotate('+180+'deg)'; 
        self.rightControl.style.mozTransform    = 'rotate('+180+'deg)'; 
        self.rightControl.style.msTransform     = 'rotate('+180+'deg)'; 
        self.rightControl.style.oTransform      = 'rotate('+180+'deg)'; 
        self.rightControl.style.transform       = 'rotate('+180+'deg)'; 
        self.rightControl.onclick = self.onMovingRight.bind(self);                
        parent.appendChild(self.rightControl);


        self.upControl = document.createElement('div');
        self.upControl.className = 'chronoline-left'; 
        self.upControl.style.display = self.controlsVisibility; 
        var upIcon = document.createElement('div');
        upIcon.className = 'chronoline-left-icon';                
        upIcon.style.marginTop = '3px';
        upIcon.style.marginLeft= '4px'; 
        self.upControl.appendChild(upIcon);
        self.upControl.style.display = true;
        self.upControl.style.marginTop = 10;
        self.upControl.style.left = pos.left + self.chart.chartWidth - 130 + 'px';
        self.upControl.style.top = pos.top + 70 + 'px';
        self.upControl.style.marginTop = '40px';
        self.upControl.style.height = ' 20px';   
        self.upControl.style.webkitTransform = 'rotate('+90+'deg)'; 
        self.upControl.style.mozTransform    = 'rotate('+90+'deg)'; 
        self.upControl.style.msTransform     = 'rotate('+90+'deg)'; 
        self.upControl.style.oTransform      = 'rotate('+90+'deg)'; 
        self.upControl.style.transform       = 'rotate('+90+'deg)';  
        self.upControl.onclick = self.onMovingUp.bind(self);      
        parent.appendChild(self.upControl);

        self.downControl = document.createElement('div');
        self.downControl.className = 'chronoline-left'; 
        self.downControl.style.display = self.controlsVisibility; 
        var downIcon = document.createElement('div');
        downIcon.className = 'chronoline-left-icon';                
        downIcon.style.marginTop = '3px';
        downIcon.style.marginLeft= '4px'; 
        self.downControl.appendChild(downIcon);
        self.downControl.style.display = true;
        self.downControl.style.marginTop = 10; 
        self.downControl.style.left = pos.left + self.chart.chartWidth - 130 + 'px';
        self.downControl.style.top = pos.top + 70 + 'px';
        self.downControl.style.marginTop = '80px';
        self.downControl.style.height = ' 20px';   
        self.downControl.style.webkitTransform = 'rotate('+270+'deg)'; 
        self.downControl.style.mozTransform    = 'rotate('+270+'deg)'; 
        self.downControl.style.msTransform     = 'rotate('+270+'deg)'; 
        self.downControl.style.oTransform      = 'rotate('+270+'deg)'; 
        self.downControl.style.transform       = 'rotate('+270+'deg)';
        self.downControl.onclick = self.onMovingDown.bind(self);              
        parent.appendChild(self.downControl);
    };

    me.onMovingUp = function(e)
    {
        var self = this;
        e.cancelBubble = true;
        e.stopPropagation();
        for(var i = 0; i < self.chart.yAxis.length; i++)
        {
            var yAxis = self.chart.yAxis[i];
            var max = yAxis.max;
            var min = yAxis.min;
            var multiplierY = (max - min) / 6;
            var minY = min + multiplierY;
            var maxY = max + multiplierY;         
            yAxis.options.startOnTick = false;
            yAxis.options.endOnTick = false;
            yAxis.setExtremes(minY, maxY);                              
        }
    };

    me.onMovingDown = function(e)
    {
        var self = this;
        e.cancelBubble = true;
        e.stopPropagation();
        for(var i = 0; i < self.chart.yAxis.length; i++)
        {
            var yAxis = self.chart.yAxis[i];
            var max = yAxis.max;
            var min = yAxis.min;
            var multiplierY = (max - min) / 6;
            var minY = min - multiplierY;
            var maxY = max - multiplierY;         
            yAxis.options.startOnTick = false;
            yAxis.options.endOnTick = false;
            yAxis.setExtremes(minY, maxY);                              
        }
    };

    me.onMovingLeft = function(e)
    {
        var self = this;     
        window.clearTimeout(self.intervalVariable);
        window.event.cancelBubble = true;
        window.event.stopPropagation();
        var xAxis = self.chart.xAxis[0];
        var max = xAxis.max;
        var min = xAxis.min;
        var multiplierX = (max - min) / 4;
        var minX = min - multiplierX;
        var maxX = max - multiplierX;         
        xAxis.options.startOnTick = false;
        xAxis.options.endOnTick = false;
        xAxis.setExtremes(minX, maxX);  
        self.masterChart.changePlotbands(minX, maxX);
        self.moovingLeftCount++;
        if(self.moovingLeftCount > 3)
        {
            if(!self.stopPropagation)
            {
                self.refreshChart(minX / 1000, maxX / 1000);
                self.moovingLeftCount = 0;
            }  
        }                             
    };

    me.onMovingRight = function(e)
    {
        var self = this;     
        window.clearTimeout(self.intervalVariable);
        window.event.cancelBubble = true;
        window.event.stopPropagation();
        var xAxis = self.chart.xAxis[0];
        var max = xAxis.max;
        var min = xAxis.min;
        var multiplierX = (max - min) / 4;
        var minX = min + multiplierX;
        var maxX = max + multiplierX;         
        xAxis.options.startOnTick = false;
        xAxis.options.endOnTick = false;
        xAxis.setExtremes(minX, maxX);  
        self.masterChart.changePlotbands(minX, maxX);
        self.moovingRightCount++;
        if(self.moovingRightCount > 3)
        {
            if(!self.stopPropagation)
            {
                self.refreshChart(minX / 1000, maxX / 1000);
                self.moovingRightCount = 0;
            }  
        }  
    };

    me.addButtonInControls = function(text, callback)
    {
        var self = this;
        self.menuItems.push({onclick:callback, text: text});
    };

    me.GetNode = function(){};
    me.attachEvent = function(){};
    me.dispatchEvent = function(event){};

    me.menuItems = [{
                        onclick: me.hideLegend.bind(me),
                        text: 'Hide legend'      
                    },
                    {
                        onclick: me.showLegend.bind(me),
                        text: 'Show legend'   
                    },
                    {
                        onclick: me.changeZoomTypeToMap.bind(me),
                        text: 'To map manipulation' 
                    },
                    {
                        onclick: me.changeZoomTypeToXY.bind(me),
                        text: 'To XY zoom type'
                    }];

    me.axes = me.getAllAxes();
    me.masterChart.setUpDetailChart(me);

    return me;





};