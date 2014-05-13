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

    me.detailChart = null;

    me.renderMasterChar = function(id, series)
    {
        var self = this;
        self.divWidth = document.getElementById(id).offsetWidth;
        self.id = id;
        var ser = {};
        ser.data = [];
        for (var i = 0; i < series.data.length; i++)
        {
            ser.data.push(series.data[i].slice(0));
        }
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
    };


    me.setOnZoomCallback = function(zoomCallback)
    {
        this.zoomCallback = zoomCallback;
    };

    me.startDrag = function(event)
    {
        var self = this;
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

        if(typeof startPoint.plotX !== 'undefined' && typeof endPoint.plotX !== 'undefined')
        {            
            if(startPoint.plotX <= x && endPoint.plotX >= x)
            {
                document.body.style.cursor = "move";
                self.dragData =
                {
                    x: event.offsetX,
                    y: event.offsetY,
                    begTime: begTime,
                    endTime: endTime
                };  
                event.cancelBubble = true;
                event.stopPropagation();
            } 
            else
            {
                self.dragData = null;
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
            for(var i = 0; i < self.detailChart.chart.yAxis.length; i++)
            {
                var yAxis = self.detailChart.chart.yAxis[i];
                var max = yAxis.getExtremes().dataMax;
                var min = yAxis.getExtremes().dataMin;
                var margin = (max - min) / 10;
                self.detailChart.chart.yAxis[i].options.startOnTick = false;
                self.detailChart.chart.yAxis[i].options.endOnTick = false;
                yAxis.setExtremes(min - margin, max + margin);
            }
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

            btime = begTime + mapDiffX * multiplier;
            etime = endTime + mapDiffX * multiplier;
            self.changePlotbands(btime, etime);
            self.detailChart.zoomChart(btime / 1000, etime / 1000, false);

        }
        else
        {
            event.cancelBubble = false;
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
            self.previousStateX = null;
            document.body.style.cursor = "default";
            var btime = self.detailChart.chart.xAxis[0].min / 1000;
            var etime = self.detailChart.chart.xAxis[0].max / 1000;            
            self.detailChart.refreshChart(btime, etime);
            for(var i = 0; i < self.detailChart.chart.yAxis.length; i++)
            {
                var yAxis = self.detailChart.chart.yAxis[i];
                var max = yAxis.getExtremes().dataMax;
                var min = yAxis.getExtremes().dataMin;
                var margin = (max - min) / 10;
                self.detailChart.chart.yAxis[i].options.startOnTick = false;
                self.detailChart.chart.yAxis[i].options.endOnTick = false;
                yAxis.setExtremes(min - margin, max + margin);
            }
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

    me.changePlotbands = function(beginTime, EndTime)
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
            from: EndTime,
            to: self.series[0].data[self.series[0].data.length - 1][0],
            color: 'rgba(0, 0, 0, 0.2)'
        });
    };

    me.addSeries = function(series)
    {
        this.series.push(series);
        this.chart.addSeries(series, true);
    };

    return me;



};