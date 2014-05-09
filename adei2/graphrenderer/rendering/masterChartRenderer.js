var masterChartRenderer = function()
{
    var me = {};

    me.id = '';
    me.zoomCallback = '';
    me.chart = null;
    me.series = [];

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