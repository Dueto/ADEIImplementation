var masterChartRenderer = function()
{
    var me = {};

    me.id = '';
    me.zoomCallback = '';
    me.chart = null;
    me.series = [];
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

    me.renderMasterChar = function(id, series)
    {
        var self = this;      
        self.id = id;
        var ser = {};
        ser.data = [];        
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
                                                var plotBeginTime = series.data[0][0];
                                                var plotEndTime = series.data[series.data.length - 1][0];
                                                var bandBeginTime = min;
                                                var bandEndTime = max;
                                                var plotDiff = (plotEndTime - plotBeginTime) / self.divWidth;
                                                var bandDiff = (bandEndTime - bandBeginTime) / self.divWidth;
                                                if((plotDiff / bandDiff) > 200)
                                                {
                                                    xAxis.addPlotLine({
                                                        color: 'red',
                                                        width: 10,
                                                        id: 'plotline',
                                                        value: bandBeginTime
                                                    });
                                                    self.onlyDragging = true;
                                                }
                                                else 
                                                {
                                                    xAxis.removePlotLine('plotline');
                                                    self.onlyDragging = false;
                                                }

                                                self.zoomCallback(event);
                                                return false;
                                            }
                                        }

                            },
                    title:
                            {
                                text: null
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
                    series: [series]
                });
        this.chart = jQuery('#' + id).highcharts();
        self.recalculateDivSizes();
        self.buildControls();
    };

    me.buildControls = function(width)
    {
        var self = this;
        var chart = document.getElementsByClassName("highcharts-series-group")[0].getBBox();      
        var pos = jQuery('#' + self.id).position();
        var parent = document.getElementById('mooveDiv');  
        self.leftControl = document.createElement('div');
        self.leftControl.className = 'chronoline-left';  
        self.leftControl.style.display = 'none';  

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
        parent.appendChild(self.leftControl);

        self.rightControl = document.createElement('div');
        self.rightControl.className = 'chronoline-right'; 
        self.rightControl.style.display = 'none'; 

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
        parent.appendChild(self.rightControl);
            
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
    	var x = event.offsetX - self.chart.plotLeft; 
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
        for(var i = 0; i < self.chart.series[0].points.length; i++)     
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
        }

        if(self.onlyDragging) 
        {              
            var point;  
            if(typeof startPoint === 'undefined')
            {point = endPoint;}
            else
            {point = startPoint;}
            if(point.plotX - 10 <= x && point.plotX + 10 >= x)
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
        if(typeof startPoint !== 'undefined' && typeof endPoint !== 'undefined')
        {   
            if(startPoint.plotX + self.dragBordersWidth <= x && endPoint.plotX - self.dragBordersWidth >= x)
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
            else if(endPoint.plotX - self.dragBordersWidth <= x && endPoint.plotX >= x)
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
            else if(startPoint.plotX <= x && startPoint.plotX + self.dragBordersWidth >= x)
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
            /*for(var i = 0; i < self.detailChart.chart.yAxis.length; i++)
            {
                var yAxis = self.detailChart.chart.yAxis[i];
                var max = yAxis.getExtremes().dataMax;
                var min = yAxis.getExtremes().dataMin;
                var margin = (max - min) / 10;
                self.detailChart.chart.yAxis[i].options.startOnTick = false;
                self.detailChart.chart.yAxis[i].options.endOnTick = false;
                yAxis.setExtremes(min - margin, max + margin);
            }*/

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

            var multiplier = (self.chart.xAxis[0].max - self.chart.xAxis[0].min) / self.divWidth;  
            //if(self.onlyDragging)
            //{multiplier = (self.detailChart.chart.xAxis[0].max - self.detailChart.chart.xAxis[0].min) / self.detailChart.divWidth * 10}           
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
            {   self.chart.xAxis[0].removePlotBand('plotline');             
                self.changePlotbands(btime, etime);                
                self.detailChart.zoomChart(btime / 1000, etime / 1000, false);
            }     
        }
        else
        {
            if(self.chart !== null)
            {
                event.cancelBubble = false;            
                var x = event.offsetX - self.chart.plotLeft;
                var plotBandBefore = self.chart.xAxis[0].plotLinesAndBands[0];
                var plotBandAfter = self.chart.xAxis[0].plotLinesAndBands[1];
                var begTime = plotBandBefore.options.to;
                var endTime = plotBandAfter.options.from;
                
                var startPoint;
                var endPoint;
                for(var i = 0; i < self.chart.series[0].points.length; i++)     
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
                }
                if(typeof startPoint !== 'undefined' && typeof endPoint !== 'undefined')
                {
                    if(startPoint.plotX + self.dragBordersWidth <= x && endPoint.plotX - self.dragBordersWidth >= x)
                    {
                        document.body.style.cursor = "move";                
                    } 
                    else if(endPoint.plotX - self.dragBordersWidth <= x && endPoint.plotX >= x)
                    {
                        document.body.style.cursor = "col-resize"; 
                    }
                    else if(startPoint.plotX <= x && startPoint.plotX + self.dragBordersWidth >= x)
                    {
                        document.body.style.cursor = "col-resize"; 
                    }
                    else
                    {
                        document.body.style.cursor = "initial"; 
                    }
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
            /*for(var i = 0; i < self.detailChart.chart.yAxis.length; i++)
            {
                var yAxis = self.detailChart.chart.yAxis[i];
                var max = yAxis.getExtremes().dataMax;
                var min = yAxis.getExtremes().dataMin;
                var margin = (max - min) / 10;
                self.detailChart.chart.yAx
                is[i].options.startOnTick = false;
                self.detailChart.chart.yAxis[i].options.endOnTick = false;
                yAxis.setExtremes(min - margin, max + margin);
            }*/
        }
    };

    me.bindEvents = function(event)
    {
        var self = this;
        mooveContainer = document.getElementById('mooveDiv');
        mooveContainer.addEventListener('mousedown', self.startDrag.bind(self), true);
        mooveContainer.addEventListener('mousemove', self.drag.bind(self), true);
        mooveContainer.addEventListener('mouseup', self.stopDrag.bind(self), true);        
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
        var plotBeginTime = self.series[0].data[0][0];
        var plotEndTime = self.series[0].data[self.series[0].data.length - 1][0];
        var bandBeginTime = beginTime;
        var bandEndTime = endTime;
        var plotDiff = (plotEndTime - plotBeginTime) / self.divWidth;
        var bandDiff = (bandEndTime - bandBeginTime) / self.divWidth;
        if((plotDiff / bandDiff) > 200)
        {            
            xAxis.removePlotLine('plotline');
            self.leftControl.style.display = '';
            self.rightControl.style.display = '';
            xAxis.addPlotLine({
                color: 'red',
                width: 10,
                id: 'plotline',
                value: bandBeginTime
            });
            self.onlyDragging = true;
        }
        else 
        {
            self.leftControl.style.display = 'none';
            self.rightControl.style.display = 'none';
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
        /*self.leftControl.style.left = chart.x - 20 +'px';
        self.leftControl.style.top = chart.y + 20 + 'px';
        self.rightControl.style.left = chart.x - 20 + chart.width + 60 + 'px';
        self.rightControl.style.top = chart.y + 20 +'px';*/
        jQuery('.chronoline-left-icon').remove();
        jQuery('.chronoline-right-icon').remove();
        jQuery('.chronoline-left').remove();
        jQuery('.chronoline-right').remove();
        self.buildControls(width);
        self.leftControl.style.display = '';
        self.rightControl.style.display = '';


    };

    me.recalculateDivSizes = function()
    {
        var self = this;
        self.divWidth = document.getElementsByClassName('highcharts-series-group')[1].getBBox().width;
    };

    return me;



};
