var masterChartRenderer = function()
{
    var me = {};

    me.id = '';
    me.zoomCallback = '';
    me.chart = null;
    me.series = [];
    me.optimalSeries = [];
    me.seriesNumber = 0;
    me.dragData = null;
    me.previousStateX = null;
    me.divWidth = null;
    me.dragBordersWidth = 15;
    me.dragLeftBorder = false;
    me.dragRightBorder = false;
    me.detailChart = null;

    me.beginTime = null;
    me.endTime = null;

    me.leftControl = null;
    me.rightControl = null;

    me.isZoomed = null;
    me.onlyDragging = false;
    me.intervalVariable = null;

    me.prevbegTime = null;
    me.orevEndTime = null;

    me.controlsVisibility = 'none'


    me.renderMasterChar = function(id, series, seriesNumber)
    {
        var self = this;      
        self.id = id;
        var ser = {};
        ser.data = [];   
        self.seriesNumber = seriesNumber;     
        for (var i = 0; i < series.data.length; i++)
        {
            ser.data.push(series.data[i].slice(0));
        }
        self.beginTime = ser.data[0][0];
        self.endTime = ser.data[ser.data.length - 1][0];
        ser.name = series.name;
        ser.pointInterval = series.pointInterval;
        me.series.push(ser);

        jQuery('#' + id).highcharts(
                {
                    chart:
                            {
                                reflow: false,
                                borderWidth: 0,
                                backgroundColor: null,
                                marginLeft: 40,
                                marginRight: 80,
                                zoomType: 'x',
                                events:
                                        {
                                            selection: function(event)
                                            {
                                                var extremesObject = event.xAxis[0],
                                                        min = extremesObject.min,
                                                        max = extremesObject.max,
                                                        xAxis = this.xAxis[0];

                                                xAxis.removePlotBand('mask-before');
                                                xAxis.addPlotBand({
                                                    id: 'mask-before',
                                                    from: series.data[0][0],
                                                    to: min,
                                                    color: 'rgba(0, 0, 0, 0.2)'
                                                });

                                                xAxis.removePlotBand('mask-after');
                                                xAxis.addPlotBand({
                                                    id: 'mask-after',
                                                    from: max,
                                                    to: series.data[series.data.length - 1][0],
                                                    color: 'rgba(0, 0, 0, 0.2)'
                                                });
                                                var plotBeginTime = self.chart.xAxis[0].min;
                                                var plotEndTime = self.chart.xAxis[0].max;
                                                var bandBeginTime = min;
                                                var bandEndTime = max;
                                                var plotDiff = (plotEndTime - plotBeginTime) / self.divWidth;
                                                var bandDiff = (bandEndTime - bandBeginTime) / self.divWidth;
                                                if((plotDiff / bandDiff) > 200)
                                                {
                                                    xAxis.removePlotLine('plotline');
                                                    self.controlsVisibility = '';
                                                    self.leftControl.style.display = self.controlsVisibility;   
                                                    self.rightControl.style.display = self.controlsVisibility;
                                                    xAxis.addPlotLine({
                                                        color: 'red',
                                                        width: 12,
                                                        id: 'plotline',
                                                        value: bandBeginTime
                                                    });
                                                    self.onlyDragging = true;
                                                }
                                                else 
                                                {
                                                    xAxis.removePlotLine('plotline');
                                                    self.controlsVisibility = 'none';
                                                    self.leftControl.style.display = self.controlsVisibility;   
                                                    self.rightControl.style.display = self.controlsVisibility;
                                                    self.onlyDragging = false;
                                                }
                                                self.detailChart.moovingRightCount = 4;
                                                self.detailChart.moovingLeftCount = 4;
                                                self.zoomCallback(event);
                                                return false;
                                            }
                                        }

                            },
                    title:
                            {
                                text: series.name
                            },
                    credits:
                            {
                                enabled: false
                            },
                    yAxis:
                            {
                                gridLineWidth: 0,
                                labels:
                                        {
                                            enabled: false
                                        },
                                title:
                                        {
                                            text: null
                                        },
                                showFirstLabel: false
                            },
                    xAxis:
                            {
                                type: 'datetime'
                            },
                    tooltip:
                            {
                                formatter: function()
                                {
                                    return false;
                                }
                            },
                    legend:
                            {
                                enabled: false
                            },
                    plotOptions:
                            {
                                series:
                                        {
                                            fillColor:
                                                    {
                                                        linearGradient: [0, 0, 0, 70],
                                                        stops: [
                                                            [0, '#4572A7'],
                                                            [1, 'rgba(0,0,0,0)']
                                                        ]
                                                    },
                                            lineWidth: 1,
                                            marker:
                                                    {
                                                        enabled: false
                                                    },
                                            shadow: false,
                                            states:
                                                    {
                                                        hover:
                                                                {
                                                                    lineWidth: 1
                                                                }
                                                    },
                                            enableMouseTracking: false
                                        }
                            },
                    series: [series],
                     exporting: 
                    {
                        buttons: 
                        {                    
                            menu: 
                            {
                                x: -70,
                                symbol: 'circle',
                                menuItems: [
                                {
                                    onclick: self.toOptimalZoom.bind(self),
                                    text: 'To optimal view'      
                                },
                                {
                                    onclick: self.toFullZoom.bind(self),
                                    text: 'To full view',   
                                }]
                            }
                        }
                    }
                });
        this.chart = jQuery('#' + id).highcharts();
        self.recalculateDivSizes();
        self.buildControls();
    };

    me.toOptimalZoom = function()
    {
        var self = this;   
        self.optimalSeries = []; 
        var plotBandBefore = self.chart.xAxis[0].plotLinesAndBands[0];
        var plotBandAfter = self.chart.xAxis[0].plotLinesAndBands[1];  
        var beginTime = plotBandBefore.options.to;
        var endTime = plotBandAfter.options.from;        
        var diffrence = (endTime - beginTime) * 2;
        var newOptZoomBeg = ((beginTime - diffrence) < self.beginTime) ? self.beginTime : beginTime - diffrence;
        var newOptZoomEnd = ((endTime + diffrence) > self.endTime) ? self.endTime : endTime + diffrence;
       /* self.detailChart.db.getData(self.detailChart.dataSources[0].db_server, 
                    self.detailChart.dataSources[0].db_name, 
                    self.detailChart.dataSources[0].db_group,
                    chart.dataSources[0].channels, 
                    newOptZoomBeg + '-' + newOptZoomEnd,
                    self.detailChart.pointCount, 'mean', function(obj)
            {

                for (var i = 0; i < 1; i++)
                {                    
                    self.optimalSeries.name = obj.label[i];     
                    for (var j = 0; j < obj.data[i].length; j++)
                    {
                        var pointData = obj.data[i][j];            
                        self.optimalSeries.data[j] = [];  
                        self.optimalSeries.data[j].push(parseFloat(obj.dateTime[j]) * 1000);            
                        self.optimalSeries.data[j].push(pointData);
                    }        
                }
                self.chart.series[0].remove();
                self.chart.addSeries(self.optimalSeries);
                self.chart.xAxis[0].setExtremes(newOptZoomBeg, newOptZoomEnd);
                self.changePlotbands(beginTime, endTime);
            });  */ 

        self.chart.xAxis[0].setExtremes(newOptZoomBeg, newOptZoomEnd);
        self.changePlotbands(beginTime, endTime);     
    };

    me.toFullZoom = function()
    {
        var self = this;
        var plotBandBefore = self.chart.xAxis[0].plotLinesAndBands[0];
        var plotBandAfter = self.chart.xAxis[0].plotLinesAndBands[1];  
        var beginTime = plotBandBefore.options.to;
        var endTime = plotBandAfter.options.from;          
        self.chart.xAxis[0].setExtremes(self.beginTime, self.endTime);   
        self.changePlotbands(beginTime, endTime);       
    };

    me.buildControls = function(width)
    {
        var self = this;
        var chart = document.getElementsByClassName("highcharts-series-group")[0].getBBox();      
        var pos = jQuery('#' + self.id).position();
        var parent = document.getElementById('mooveDiv');  
        self.leftControl = document.createElement('div');
        self.leftControl.className = 'chronoline-left';  
        self.leftControl.style.display = self.controlsVisibility;  

        var leftIcon = document.createElement('div');
        leftIcon.className = 'chronoline-left-icon';
        leftIcon.style.marginTop = '12px';
        leftIcon.style.marginLeft= '4px';
        self.leftControl.appendChild(leftIcon);
        self.leftControl.style.display = true;
        self.leftControl.style.marginTop = 10;
        self.leftControl.style.left = pos.left + 15 +'px';
        self.leftControl.style.top = chart.y + 20 + 'px';
        self.leftControl.style.marginTop = '40px';
        self.leftControl.style.height = '40px';
        self.leftControl.onmousedown = self.dragLeftSide.bind(self);        
        self.leftControl.onmouseup = self.onControlMouseUp.bind(self);
        parent.appendChild(self.leftControl);

        self.rightControl = document.createElement('div');
        self.rightControl.className = 'chronoline-right'; 
        self.rightControl.style.display = self.controlsVisibility; 

        var rightIcon = document.createElement('div');
        rightIcon.className = 'chronoline-right-icon';                
        rightIcon.style.marginTop = '12px';
        rightIcon.style.marginLeft= '6px';
        self.rightControl.appendChild(rightIcon);
        self.rightControl.style.display = true;
        self.rightControl.style.marginTop = 10;  
        if(typeof width !== 'undefined')  
        {self.rightControl.style.left = pos.left + width - 78 + 'px';}
        else
        {self.rightControl.style.left = pos.left + chart.width + 69 + 'px';}           
        self.rightControl.style.top = chart.y + 20 +'px';
        self.rightControl.style.marginTop = '40px';
        self.rightControl.style.height = '40px';
        self.rightControl.onmousedown = self.dragRightSide.bind(self);
        self.rightControl.onmouseup = self.onControlMouseUp.bind(self);
        parent.appendChild(self.rightControl);
            
    };

    me.dragRightSide = function()
    {
        var self = this; 
        self.intervalVariable = setInterval(function()
            {
                var multiplier = (self.detailChart.chart.xAxis[0].max - self.detailChart.chart.xAxis[0].min) / self.detailChart.divWidth;                     
                var btime = self.detailChart.chart.xAxis[0].min + multiplier * 40;
                var etime = self.detailChart.chart.xAxis[0].max + multiplier * 40;
                self.chart.xAxis[0].removePlotBand('plotline');             
                self.changePlotbands(btime, etime);                
                self.detailChart.zoomChart(btime / 1000, etime / 1000, false);                           
            }, 10);

    };

    me.dragLeftSide = function()
    {
        var self = this; 
        self.intervalVariable = setInterval(function()
            {
                var multiplier = (self.detailChart.chart.xAxis[0].max - self.detailChart.chart.xAxis[0].min) / self.detailChart.divWidth;                     
                var btime = self.detailChart.chart.xAxis[0].min - multiplier * 40;
                var etime = self.detailChart.chart.xAxis[0].max - multiplier * 40;
                self.chart.xAxis[0].removePlotBand('plotline');             
                self.changePlotbands(btime, etime);                
                self.detailChart.zoomChart(btime / 1000, etime / 1000, false);           
            }, 10);

    };

    me.setOnZoomCallback = function(zoomCallback)
    {
        this.zoomCallback = zoomCallback;
    };

    me.startDrag = function(event)
    {
	var self = this;
	if(self.chart !== null)
	{
    	var x = event.offsetX; //- self.chart.plotLeft; 
        var plotBandBefore = self.chart.xAxis[0].plotLinesAndBands[0];
        var plotBandAfter = self.chart.xAxis[0].plotLinesAndBands[1];       
        if(self.onlyDragging)
        {
            plotBandBefore = self.chart.xAxis[0].plotLinesAndBands[2];            
            plotBandAfter = self.chart.xAxis[0].plotLinesAndBands[2];
            var begTime = plotBandBefore.options.value;
            var endTime = plotBandAfter.options.value; 
        }
        else
        {
            plotBandBefore = self.chart.xAxis[0].plotLinesAndBands[0];
            plotBandAfter = self.chart.xAxis[0].plotLinesAndBands[1];
            var begTime = plotBandBefore.options.to;
            var endTime = plotBandAfter.options.from; 
        }            
        var startPoint;
        var endPoint;
        /*for(var i = 0; i < self.chart.series[0].points.length; i++)     
        {
            var date = self.chart.series[0].points[i].x;
            if(begTime < date)
            {
                startPoint = self.chart.series[0].points[i];
                for(var j = i; j < self.chart.series[0].points.length; j++)
                {
                    date = self.chart.series[0].points[j].x;
                    if(endTime < date)
                    {
                        endPoint = self.chart.series[0].points[j];
                        break;
                    }
                }
                break;
            }
        }*/

        startPoint = plotBandBefore.svgElem.element.getBBox();
        endPoint = plotBandAfter.svgElem.element.getBBox();
        startPoint = startPoint.x + startPoint.width;
        endPoint = endPoint.x;
        if(self.onlyDragging) 
        {   
            if((endPoint - self.dragBordersWidth) <= x && (endPoint + self.dragBordersWidth) >= x)
            {
                btime = self.detailChart.chart.xAxis[0].min;
                etime = self.detailChart.chart.xAxis[0].max;
                self.dragData =
                {
                    x: event.offsetX,
                    y: event.offsetY,
                    begTime: btime,
                    endTime: etime
                };  
                self.dragRightBorder = false;
                self.dragLeftBorder = false;
                event.cancelBubble = true;
                event.stopPropagation();
                return;
            }  
            else
            {
                self.dragData = null;
                self.dragRightBorder = false;
                self.dragLeftBorder = false;
                event.cancelBubble = false;    
                return;
            }          
        } 
        if(startPoint + self.dragBordersWidth <= x && endPoint - self.dragBordersWidth >= x)
        {
            document.body.style.cursor = "move";
            self.dragData =
            {
                x: event.offsetX,
                y: event.offsetY,
                begTime: begTime,
                endTime: endTime
            };  
            self.dragRightBorder = false;
            self.dragLeftBorder = false;
            event.cancelBubble = true;
            event.stopPropagation();
        } 
        else if(endPoint - self.dragBordersWidth <= x && endPoint + self.dragBordersWidth >= x)
        {
            document.body.style.cursor = "col-resize";
            self.dragData =
            {
                x: event.offsetX,
                y: event.offsetY,
                begTime: begTime,
                endTime: endTime
            };  
            self.dragRightBorder = true;
            self.dragLeftBorder = false;
            event.cancelBubble = true;
            event.stopPropagation();

        }
        else if(startPoint - self.dragBordersWidth <= x && startPoint + self.dragBordersWidth >= x)
        {
            document.body.style.cursor = "col-resize";
            self.dragData =
            {
                x: event.offsetX,
                y: event.offsetY,
                begTime: begTime,
                endTime: endTime
            };  
            self.dragRightBorder = false;
            self.dragLeftBorder = true;
            event.cancelBubble = true;
            event.stopPropagation();

        }
        else
        {     
            self.dragData = null;
            self.dragRightBorder = false;
            self.dragLeftBorder = false;
            event.cancelBubble = false;    
        }

       
	}

    };


    me.setUpDetailChart = function(detailChart)
    {
        var self = this;
        self.detailChart = detailChart;
    }

    me.drag = function(event)
    {
        var self = this;
        if(self.dragData)
        {            
            document.body.style.cursor = "move";
            event.cancelBubble = true;
            event.stopPropagation();
            var e = event || window.event;            

            if (self.previousStateX === null)
            {
                self.previousStateX = e.clientX;                
            }
            var mapDiffX = e.clientX - self.previousStateX;

            var begTime = self.dragData.begTime;
            var endTime = self.dragData.endTime;

            var multiplier = (self.chart.xAxis[0].max - self.chart.xAxis[0].min) / self.chart.chartWidth;              
            var btime = begTime + mapDiffX * multiplier;
            var etime = endTime + mapDiffX * multiplier;

            if(self.dragLeftBorder)
            {
                if(btime < (endTime - multiplier * 30))
                {
                    self.changePlotbands(btime, endTime);
                    self.detailChart.zoomChart(btime / 1000, endTime / 1000, false);
                }
               
            } else if(self.dragRightBorder)
            {
                if((begTime + multiplier * 30) < etime)
                {
                    self.changePlotbands(begTime, etime);
                    self.detailChart.zoomChart(begTime / 1000, etime / 1000, false);
                }                
            }
            else
            {   
                self.chart.xAxis[0].removePlotBand('plotline');             
                self.changePlotbands(btime, etime);                
                self.detailChart.zoomChart(btime / 1000, etime / 1000, false);
            }     
        }
        else
        {
            if(self.chart !== null)
            {
                event.cancelBubble = false;            
                var x = event.offsetX;
                var plotBandBefore = self.chart.xAxis[0].plotLinesAndBands[0];
                var plotBandAfter = self.chart.xAxis[0].plotLinesAndBands[1];                         
                var startPoint = plotBandBefore.svgElem.element.getBBox();
                var endPoint = plotBandAfter.svgElem.element.getBBox();             
                startPoint = startPoint.x + startPoint.width;
                endPoint = endPoint.x;
                if(startPoint + self.dragBordersWidth <= x && endPoint - self.dragBordersWidth >= x)
                {
                    document.body.style.cursor = "move";                   
                } 
                else if(endPoint - self.dragBordersWidth <= x && endPoint + self.dragBordersWidth >= x)
                {
                    document.body.style.cursor = "col-resize"; 
                }
                else if(startPoint - self.dragBordersWidth <= x && startPoint + self.dragBordersWidth >= x)
                {
                    document.body.style.cursor = "col-resize";     
                }
                else
                {     
                   document.body.style.cursor = "default";   
                }
            }
        }

    };

    me.stopDrag = function(event)
    {     
        var self = this;           
        if (self.dragData)
        {   
            event.cancelBubble = true;
            event.stopPropagation();
            self.dragData = null;
            self.dragLeftBorder = false;
            self.dragRightBorder = false;
            self.previousStateX = null;
            document.body.style.cursor = "default"; 
            var btime = self.detailChart.chart.xAxis[0].min / 1000;
            var etime = self.detailChart.chart.xAxis[0].max / 1000;            
            self.detailChart.refreshChart(btime, etime);             
        }       
    };

    me.onMouseOut = function()
    {
        document.body.style.cursor = "default";
    };

    me.onControlMouseUp = function()
    {
        var self = this;        
        window.clearInterval(self.intervalVariable); 
        var btime = self.detailChart.chart.xAxis[0].min / 1000;
        var etime = self.detailChart.chart.xAxis[0].max / 1000;            
        self.detailChart.refreshChart(btime, etime); 
    };

    me.bindEvents = function(event)
    {
        var self = this;
        mooveContainer = document.getElementById('mooveDiv');
        mooveContainer.addEventListener('mousedown', self.startDrag.bind(self), true);
        mooveContainer.addEventListener('mousemove', self.drag.bind(self), true);
        mooveContainer.addEventListener('mouseup', self.stopDrag.bind(self), true);
        mooveContainer.addEventListener('mouseout', self.onMouseOut, true)        
    };

    me.onSelectionCallback = function(event)
    {
        /*var self = this;
         var chart = jQuery('#' + self.id).highcharts();
         var extremesObject = event.xAxis[0]
         var xAxis = chart.xAxis[0];
         var min = extremesObject.min;
         var max = extremesObject.max;
         xAxis.removePlotBand('mask-before');
         xAxis.addPlotBand({
         id: 'mask-before',
         from: Date.UTC(2006, 0, 1),
         to: min,
         color: 'rgba(0, 0, 0, 0.2)'
         });

         xAxis.removePlotBand('mask-after');
         xAxis.addPlotBand({
         id: 'mask-after',
         from: max,
         to: Date.UTC(2008, 11, 31),
         color: 'rgba(0, 0, 0, 0.2)'
         });*/
    };

    me.changeSeries = function(series)
    {
        this.series = [];
        this.series.push(series);
        this.chart.setData(this.series);
    };

    me.changePlotbands = function(beginTime, endTime)
    {
        var self = this;
        var xAxis = self.chart.xAxis[0];
        xAxis.removePlotBand('mask-before');
        xAxis.addPlotBand({
            id: 'mask-before',
            from: self.series[0].data[0][0],
            to: beginTime,
            color: 'rgba(0, 0, 0, 0.2)'
        });

        xAxis.removePlotBand('mask-after');
        xAxis.addPlotBand({
            id: 'mask-after',
            from: endTime,
            to: self.series[0].data[self.series[0].data.length - 1][0],
            color: 'rgba(0, 0, 0, 0.2)'
        });
        var plotBeginTime = self.chart.xAxis[0].min;
        var plotEndTime = self.chart.xAxis[0].max;
        var bandBeginTime = beginTime;
        var bandEndTime = endTime;
        var plotDiff = (plotEndTime - plotBeginTime) / self.divWidth;
        var bandDiff = (bandEndTime - bandBeginTime) / self.divWidth;
        if((plotDiff / bandDiff) > 200)
        {            
            xAxis.removePlotLine('plotline');  
            self.controlsVisibility = '';
            self.leftControl.style.display = self.controlsVisibility;   
            self.rightControl.style.display = self.controlsVisibility;
            xAxis.addPlotLine({
                color: 'red',
                width: 12,
                id: 'plotline',
                value: bandBeginTime
            });
            self.onlyDragging = true;
        }
        else 
        {
            self.controlsVisibility = 'none';
            self.leftControl.style.display = self.controlsVisibility;   
            self.rightControl.style.display = self.controlsVisibility;
            xAxis.removePlotLine('plotline');
            self.onlyDragging = false;
        }

    };

    me.addSeries = function(series)
    {
        this.series.push(series);
        this.chart.addSeries(series, true);
    };

    me.dispose = function()
    {
        var self = this;
        self.series = [];
        self.chart.destroy();
    };

    me.rebuildControls = function(width)
    {
        var self = this;        
        jQuery('.chronoline-left-icon').remove();
        jQuery('.chronoline-right-icon').remove();
        jQuery('.chronoline-left').remove();
        jQuery('.chronoline-right').remove();
        self.buildControls(width);  
        self.detailChart.buildControls();     
    };

    me.recalculateDivSizes = function()
    {
        var self = this;
        self.divWidth = document.getElementsByClassName('highcharts-series-group')[1].getBBox().width;
    };

    return me;



};
