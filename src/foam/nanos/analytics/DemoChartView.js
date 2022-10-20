/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'DemoChartView',
  extends: 'foam.u2.Element',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.graphics.Label',
    'foam.graphics.Box',
    'foam.nanos.analytics.Candlestick',
    'foam.util.Timer',
    'org.chartjs.Line',
    'org.chartjs.Line2'
  ],
  imports: [
    'omDailyDAO',
    'om1MinuteDAO',
    'om5MinuteDAO'
  ],

  properties: [
    {
      name: 'candlestickDAO',
      class: 'String',
      value: 'omDailyDAO'
    },
    {
      name: 'candlestickKey',
      class: 'String',
      value: 'LRULinkedHashMap.UserPermissionCache.CacheHIT'
    },
    {
      name: 'width',
      value: 1000
    },
    {
      name: 'height',
      value: 700
    },
    {
      name: 'color',
      value: 'blue'
    },
    {
      name: 'labels',
      class: 'StringArray'
    },
    {
      name: 'data',
      class: 'StringArray'
    },
    {
      documentation: 'seconds between refreshes.',
      name: 'refreshRate',
      value: 10
    },
    {
      name: 'canvas',
      factory: function() {
        return this.Box.create({
          width: this.width,
          height: this.height,
          // color: this.color
        });
      }
    },
    {
      class: 'Int',
      name: 'seconds',
      postSet: function() {
        this.refresh();
      },
      hidden: true,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.util.Timer',
      name: 'timer',
      hidden: true,
      factory: function() {
        var t = this.Timer.create();
        this.seconds$ = t.second$.map(function(s) {
          return Math.floor(s / this.refreshRate);
        }.bind(this));
        return t;
      }
    }
  ],
  methods: [
    async function render() {
      this.SUPER();

      this.canvas.children = [];
      let sink = await this[this.candlestickDAO].where(this.EQ(this.Candlestick.KEY, this.candlestickKey)).select();
      this.labels = [];
      this.data = [];
      sink.array.forEach(function(c) {
        this.labels.push(c.closeTime);
        this.data.push(c.count);
      }.bind(this));

      let config = {
        labels: this.labels,
        datasets: [
          {
            label: this.candlestickKey,
            data: this.data,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: this.candlestickKey,
            data: this.data.reverse(),
            fill: false,
            borderColor: 'rgb(175, 92, 92)',
            tension: 0.1
          }
        ]
      };

      let myChart = this.Line2.create({
        data: config
      });

      this.canvas.add(myChart);
      this.canvas.invalidate();

      this.
        addClass(this.myClass()).
        start('center').
        add(this.candlestickDAO).
        tag('br').
        start(this.canvas).
        end().
        end();
    }
  ]
});
