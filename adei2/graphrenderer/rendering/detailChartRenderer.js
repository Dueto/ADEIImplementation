var detailChartRenderer = function()
{
    var me = {};


    me.masterChart = new masterChartRenderer();
    me.masterChartId = 'masterChart';
    me.id = 'detailChart';
    me.chart = null;

    me.axes = '';
    me.axesToShow = [];
    
    me.neddenAxes = [];
    me.axesToChannels = [];
    me.dataSourcesToChannels = [];

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
    me.needenWindow = 0;

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
        self.dataSources = [];
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
        me.axesToShow = [];        
        if(parseInt(cfg.window) !== 0)
        {
            self.needenWindow = (cfg.window);      
            self.firstRequest = true;      
        }
        if(dataSource.db_server === 'virtual' && dataSource.db_name === 'srctree')
        {
            self.divWidth = self.getDivWidth(self.id);
            self.divHieght = self.getDivHieght(self.id);
            self.pointCount = self.divWidth * self.resolutionMultiplier;
            self.onDraggingRigth = self.divWidth - self.onDraggingLeft;
            self.bindEvents();
            self.masterChart.bindEvents();
            self.masterChart.setOnZoomCallback(self.onZoomMasterChartEvent.bind(self));
            var srctree = cfg.srctree.split(',');
            var virtualSources = self.formVirtualSources(srctree);
                         
            var min = 9999999999999999;
            var max = 0;                
            for (var i = 0; i < virtualSources.length; i++) 
            {                 
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
            self.refreshChartFromMasterChart(max, min);

           
        }
        else
        {  
            if(experiment === '-' || experiment === '*-*')
            {
                experiment = self.getExperimentInterval(dataSource);
            }             
            
            self.formAxesInfo(dataSource);
            self.dataSources.push(dataSource);
            self.renderChart(experiment);
        }   
    };

    me.GetNode = function()
    {

    };

    me.attachEvent = function(event, responder)
    {

    };

    me.dispatchEvent = function(event)
    {

    };

    me
    .renderChart = function(experiment)
    {
        var self = this;       
        self.divWidth = self.getDivWidth(self.id);
        self.divHieght = self.getDivHieght(self.id);
        self.pointCount = self.divWidth * self.resolutionMultiplier;
        self.onDraggingRigth = self.divWidth - self.onDraggingLeft;
        self.bindEvents();
        self.masterChart.bindEvents();

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
                        self.masterChart.renderMasterChar(self.masterChartId, masterSeries);
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


    me.formChart = function(id, series, yAxises)
    {
        var self = this;
        var title = self.formTitle();
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
                        marginRight: self.onDraggingLeft

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
                        gridLineWidth: 1
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
                        y: 30,
                        x: -self.onDraggingLeft,
                        symbolHeight: 20,
                        floating: false
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
                                                            lineWidth: 2
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
            series: series
        };
        jQuery('#' + id).highcharts(self.chartOptions);
        self.chart = jQuery('#' + self.id).highcharts();
       
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
            self.masterChart.changePlotbands(begTime * 1000, endTime * 1000);
            self.refreshChart(begTime, endTime);
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
        self.refreshChartFromMasterChart(begTime, endTime);
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
                        /*self.dataSourcesToChannels.push(self.dataSources[self.currentDataSource].db_server  + ' '
                        + self.dataSources[self.currentDataSource].db_name  + ' ' 
                        + self.dataSources[self.currentDataSource].db_group);*/

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
            /*if(self.chart.series.length !== self.dataSourcesToChannels.length)
            {
                self.dataSourcesToChannels = []; 
            }*/
            self.series = [];       
            self.refreshZoomSeries(beginTime, endTime);
        }
        else if (self.currentDataSource < self.dataSources.length)
        {
            self.refreshZoomSeries(beginTime, endTime);
        }
        else
        {
            var title = self.formTitle();
            self.chart.setTitle({text: title});            
            for (var i = 0; i < self.series.length; i++)
            {
                if(typeof self.chart.series[i] !== 'undefined')
                {                    
                    self.chart.series[i].setData(self.series[i].data);                                     
                }    
                else if(self.series.length > self.chart.series.length)
                {
                    self.addSeries(self.series[i], false);  
                }            
            }
            
            var xAxis = self.chart.xAxis[0];
            xAxis.setExtremes(beginTime * 1000, endTime * 1000);
            //self.chart.redraw();
            self.currentDataSource = 0;
            self.rebuildAxesControls();
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
                    self.addSeries({data: [], name: '', pointInterval: self.dataSourceLevel * 1000}, false);
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
            console.log(ex);
        }
    };

    me.refreshChartFromMasterChart = function(beginTime, endTime)
    {
        var self = this;
        if (self.currentDataSource === 0)
        {            
            if(self.chart !== null)
            {
                self.chart.destroy();               
            }         
            self.dataSourcesToChannels = [];
            self.series = [];
            self.formChart(self.id, []);
            self.chart = jQuery('#' + self.id).highcharts();
            self.refreshSeries(beginTime, endTime);   
        }
        else if (self.currentDataSource < self.dataSources.length)
        {
            self.refreshSeries(beginTime, endTime);
        }
        else
        {        
            self.chart.redraw();
            var max = self.chart.xAxis[0].max;
            var min = self.chart.xAxis[0].min;
            if(self.firstRequest === true)
            {                
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
                self.firstRequest = false;           
                if(self.masterChart.chart !== null)
                {
                    self.masterChart.chart.destroy();
                    self.masterChart.series = [];
                }                
            }
            if(self.masterChart.series.length === 0)
            {
                var masterSeries = {};
                masterSeries.data = self.series[0].data;
                masterSeries.name = self.series[0].name;
                self.masterChart.renderMasterChar(self.masterChartId, masterSeries);  
                self.masterChart.changePlotbands(min, max);              
            }      
            else
            {
                self.masterChart.changePlotbands(beginTime * 1000, endTime * 1000);
            }            
            self.currentDataSource = 0;
            self.rebuildAxesControls();
        }
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
                if(self.dataSources[self.currentDataSource].axesToChannels[k].value !== null)
                {
                    series.yAxis = self.dataSources[self.currentDataSource].axesToChannels[k].value;
                }      
                else
                {
                    series.yAxis = 'standart';
                }                          
                break;
            }                      
        }        

        series.color = self.chart.get(series.yAxis).options.labels.style.color;

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
                self.refreshChart(beginTime, endTime);
            }, 300);
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

    me.bindEvents = function()
    {
        var self = this;
        var chartContainer = document.getElementById(self.id);   
        chartContainer.addEventListener("mousewheel" || "onscroll", self.onScrollZoom.bind(self), false);
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
                var left = e.clientX - chartContainer.offsetLeft;

                if (self.zoomType === 'xy')
                {
                    if ((left >= 0 && left <= self.onDraggingLeft) || (left >= self.onDraggingRigth && left <= self.divWidth))
                    {
                        document.body.style.cursor = "move";
                        self.dragData =
                                {
                                    x: e.clientX - chartContainer.offsetLeft,
                                    y: e.clientY - chartContainer.offsetTop
                                };
                    }
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

            var multiplier = (endTime - begTime) / self.divWidth;            
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
            self.refreshChart(btime, etime);
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
            yAxis.setExtremes(min - margin, max + margin);
        }
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
            self.chart.yAxis[i].setExtremes(min[i], max[i]);
        }    
        
        self.chart.xAxis[0].setExtremes(begTime, endTime);
        self.masterChart.changePlotbands(begTime, endTime);

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

            var bBoxWidth = axisBox.width + 20;
            var bBoxHeight = axisBox.height;
            var bBoxX = axisBox.x - 10;
            var bBoxY = axisBox.y;

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
            var downYValue;

            var rectangles = document.getElementsByClassName('axisControl');
            

            rectangles[i].onmousedown = function(yAxis)
            { 
                return function(e)
                {   
                    isDragging = true;
                    e.cancelBubble = true;
                    e.stopPropagation();
                };
            }(yAxis);

            rectangles[i].onmousemove = function(yAxis)
            { 
                return function(e)
                {    
                    if (isDragging) 
                    {                           
                        if (self.previousStateX === null && self.previousStateY === null)
                        {                            
                            self.previousStateY = e.clientY;
                        }
                        var mapDiffY = self.previousStateY - e.clientY;

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
                        self.previousStateY = e.clientY;  
                    }                
                                 
                    
                };
            }(yAxis);

            rectangles[i].onmouseup = function(yAxis)
            { 
                return function(e)
                {                
                    self.rebuildAxesControls();
                    self.previousStateY = null;
                    isDragging = false;                        
                };
            }(yAxis);

            rectangles[i].ondblclick = function(yAxis)
            { 
                return function(e)
                {                
                    var extremes = yAxis.getExtremes(),
                    dataMin = extremes.dataMin,
                    dataMax = extremes.dataMax;
                    yAxis.setExtremes(dataMin, dataMax, true, false);
                };
            }(yAxis);



        }
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
            self.chart.yAxis[i].setExtremes(min[i], max[i]);
        }            
        self.chart.xAxis[0].setExtremes(begTime, endTime);
        self.masterChart.changePlotbands(begTime, endTime);
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
                    msg = msg + '</br><strong>Data source:</strong>' + chart.dataSourcesToChannels[i] +
                     '</br><strong>Channel:</strong> ' + chart.chart.series[i].name + 
                     '</br><strong>Date:</strong> ' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S.%L', date) + 
                     '</br><strong>Value:</strong> ' + value + '</br>';
                    break;
                }           
            }
        }    
        var buttons;    
        if(seriesToMove.yAxis.options.id === 'temporary')
        {
           buttons =  {"Delete this series from the temporary axis": function()
            {
                var flag;
                if(seriesToMove.yAxis.series.length === 1)
                {
                    flag = true;                  
                } 
                var standartAxis = chart.chart.get('standart');                            
                if(!standartAxis)
                {
                    standartAxis = {gridLineWidth: 0, id: 'standart',labels: {format: '{value}', style: { color: Highcharts.getOptions().colors[0]}}, title: {text: 'Standart axis', style: { color: Highcharts.getOptions().colors[0]}}};
                    
                    chart.chart.addAxis(standartAxis, false, false);
                    chart.axesToShow.push(standartAxis); 
                }                
                var jSONSeries = JSON.stringify(seriesToMove.options);
                var series = JSON.parse(jSONSeries);                    
                seriesToMove.remove();
                series.yAxis = 'standart';
                series.color = Highcharts.getOptions().colors[0];
                chart.chart.addSeries(series, true);    
                var temporaryAxis = chart.chart.get('temporary');
                if(flag)
                {
                    temporaryAxis.remove();                    
                }              
            }}                   
        }
        else
        {
            if(seriesToMove.yAxis.series.length !== 1)
            {            
                buttons = {"Show this series on another axes": function()
                {
                   
                    if(seriesToMove.yAxis.options.id === 'temporary')
                    {
                        alert("Series is already on temporary axis.");
                        return;
                    }
                    else
                    {
                        var temporaryAxis = chart.chart.get('temporary');

                        if(!temporaryAxis)
                        {
                            chart.chart.addAxis(chart.temporaryAxis, false, false);
                            chart.axesToShow.push(chart.temporaryAxis); 
                        }                      
                        var jSONSeries = JSON.stringify(seriesToMove.options);
                        var series = JSON.parse(jSONSeries);
                        seriesToMove.remove();
                        series.yAxis = 'temporary';
                        series.color = chart.temporaryAxis.labels.style.color;
                        chart.chart.addSeries(series, true);
                    }
                                  
                 }};
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

    me.hideLabels = function()
    {

    };

    me.getSeries = function(id)
    {
        return this.series[id];
    };

    me.hideChannel = function(channelId)
    {

    };

    me.showChannel = function(channelId)
    {

    };

    me.changeZoomType = function()
    {

    };

    me.deleteAxis = function(axis)
    {
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
            self.chart.yAxis[i].setExtremes(min[i], max[i]);
        }            
        self.chart.xAxis[0].setExtremes(begTime, endTime);
        self.masterChart.changePlotbands(begTime, endTime);
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
            self.chart.yAxis[i].setExtremes(min[i], max[i]);
        }        
        
        self.chart.xAxis[0].setExtremes(begTime, endTime);
        self.masterChart.changePlotbands(begTime, endTime);
        self.rebuildAxesControls();

    };

    me.changeMasterChartSeries = function(seriesId)
    {
        if (seriesId > this.series.length && seriesId < 0)
        {
            return;
        }
        this.masterChart.renderMasterChar(this.masterChartId, this.series[seriesId]);
    };

    me.addSeries = function(series, isRedraw)
    {
        this.series.push(series);
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
        var url = 'http://ipecluster5.ipe.kit.edu/ADEIRelease/adei/services/list.php?db_server=' + db_server
                + '&db_name=' + db_name
                + '&db_group=' + db_group
                + '&db_mask=' + db_channels
                + '&target=' + target
                + '&info=1';
        return url;
    };

   

    me.formNeedenAxes = function(dataSource)
    {
        var self = this;
        var url = self.formURLAxes(dataSource.db_server, dataSource.db_name, dataSource.db_group, dataSource.channels, 'items');              
        var responseXML = self.db.httpGetXml(url);
        var items = responseXML.getElementsByTagName('Value');
        var axesArray = [];        
        for(var i = 0; i < items.length; i++)
        {
            var axisObj = {};
            axisObj.channelNumber = items[i].getAttribute('value');
            axisObj.channelName = items[i].getAttribute('name');
            axisObj.value = items[i].getAttribute('axis');          
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
        var flag = false;
        for(var i = 0; i < self.axes.length; i++)
        {
            var axesObj = {value: '',labels: {format: '{value} ', style: { color: Highcharts.getOptions().colors[i + 1]}}, title: {text: '', style: { color: Highcharts.getOptions().colors[i + 1]}}};
            for(j = 0; j < self.needenAxes.length; j++)
            {
                if(self.needenAxes[j].value === null && flag === false)
                {
                    flag = true;
                    axesToShow.push({gridLineWidth: 0, id: 'standart',labels: {format: '{value}', style: { color: Highcharts.getOptions().colors[0]}}, title: {text: 'Standart axis', style: { color: Highcharts.getOptions().colors[0]}}});
                    continue;
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

    me.axes = me.getAllAxes();
    me.masterChart.setUpDetailChart(me);

    return me;





};