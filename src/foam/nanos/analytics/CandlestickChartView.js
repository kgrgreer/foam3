/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'CandlestickChartView',
  extends: 'foam.u2.Element',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.graphics.Box',
    'foam.graphics.Label',
    'foam.nanos.analytics.Candlestick',
    'org.chartjs.Line2'
  ],

  // imports: [
  //   'om1MinuteDAO',
  //   'om5MinuteDAO',
  //   'omHourlyDAO',
  //   'omDailyDAO'
  // ],

  messages: [
    {
      name: 'VIEW_HEADER',
      message: 'Candlestick Charting',
    },
    {
      name: 'MESSAGE_SELECT_DAO',
      message: 'Please select a Candlestick DAO'
    },
    {
      name: 'MESSAGE_SELECT_KEY',
      message: 'Please select a Candlestick key'
    }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.boot.NSpec',
      label: 'Candlestick DAO',
      name: 'candlestickDAOKey',
      documentation: `The Candlestick DAO to graph.`,
//      value: 'omDailyDAO',
      targetDAOKey: 'AuthenticatedNSpecDAO',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          data$: X.data.candlestickDAOKeyChoice$,
          search: true,
          sections: [
            {
              heading: 'DAO',
              dao: X.AuthenticatedNSpecDAO
                .where(E.AND(
                  E.EQ(foam.nanos.boot.NSpec.SERVE, true),
                  E.ENDS_WITH(foam.nanos.boot.NSpec.NAME, 'DAO'),
                  E.OR(
                    E.CONTAINS_IC(foam.nanos.boot.NSpec.NAME, "candlestick"),
                    E.IN(foam.nanos.boot.NSpec.NAME, [
                      'om1MinuteDAO',
                      'om5MinuteDAO',
                      'omHouryDAO',
                      'omDailyDAO'
                    ])
                  )
                ))
                .orderBy(foam.nanos.boot.NSpec.NAME)
            }
          ]
        };
      }
    },
    {
      name: 'candlestickDAOKeyChoice',
      class: 'String',
      visibility: 'RO',
      transient: true
    },
    {
      name: 'candlestickDAOKeyChoices',
      expression: function(candlestickDAOKeyChoice) {
        this.buildChart();
      },
      visibility: 'RO',
      transient: true
    },
    {
    // allow multiple selection of keys from selected dao.
      name: 'candlestickKey1',
      class: 'String',
      // value: 'Medusa.Dagger.globalIndex.increment'
      value: 'LRULinkedHashMap.UserPermissionCache.CacheHIT'
    },
    {
    // allow multiple selection of keys from selected dao.
      name: 'candlestickKey2',
      class: 'String',
      // value: 'ReplayingInfo.index.increment'
      value: 'LRULinkedHashMap.UserPermissionCache.CacheMISS'
    },
//     {
//       class: 'String',
//       name: 'candlestickKey',
//       view: function(_, X) {
//         var E = foam.mlang.Expressions.create();
//         return {
//           class: 'foam.u2.view.RichChoiceView',
//           search: true,
//           sections: [
//             {
// //              heading: 'DAO',d
//               dao: X.data[X.data.candlestickDAOKeyChoice]
//             }
//           ]
//         };
//       }
//     },
    {
      name: 'canvas',
      factory: function() {
        return this.Box.create({
          width: 1400,
          height: 700
        });
      },
      visibility: 'RO'
    },
    'chart',
    // {
    //   class: 'Int',
    //   name: 'seconds',
    //   postSet: function() {
    //     this.refresh();
    //   },
    //   visibility: 'HIDDEN',
    //   transient: true
    // },
    // {
    //   documentation: 'seconds between refreshes.',
    //   name: 'refreshRate',
    //   value: 10,
    //   visibility: 'HIDDEN',
    //   transient: true
    // },
    // {
    //   class: 'FObjectProperty',
    //   of: 'foam.util.Timer',
    //   name: 'timer',
    //   factory: function() {
    //     var t = this.Timer.create();
    //     this.seconds$ = t.second$.map(function(s) {
    //       return Math.floor(s / this.refreshRate);
    //     }.bind(this));
    //     return t;
    //   },
    //   visibility: 'HIDDEN',
    //   transient: true
    // }
  ],

  methods: [
    async function render() {
      this.SUPER();
       this.canvas.add(this.chart$);
//       this.canvas.invalidate();

      this.addClass(this.myClass());
      this
        .start(this.Cols).addClass(this.myClass('header'))
        .start().addClass(this.myClass('title'))
        .add(this.VIEW_HEADER)
        .end()
        .end();

      // Questions
      // 2. How to refresh the canvas on selection change?
      this
        .start(this.Cols).addClass(this.myClass('container-selectors'))
        .startContext({data: this})
        .start().addClass(this.myClass('selector'))
        .add(this.CANDLESTICK_DAOKEY.__)
        .add(this.CANDLESTICK_KEY1.__)
        .add(this.CANDLESTICK_KEY2.__)
        .add(this.CANDLESTICK_DAOKEY_CHOICE.__)
        .add(this.CANDLESTICK_DAOKEY_CHOICES.__)
//        .add(this.CANDLESTICK_KEY.__)
        .end()
        .end()
        .end();

      this.
        start('div', null, this.canvasContainer$).addClass(this.myClass('canvas-container')).
        add(this.canvas).
        end();
    },
    
    async function buildChart() {

      var self = this;
      var labels = new Map();
      var datasets = new Map();

      if ( this.candlestickDAOKey &&
           ( this.candlestickKey1 ||
             this.candlestickKey2 ) ) {
        let sink = await this[this.candlestickDAOKey]
            .where(this.OR(
              this.EQ(this.Candlestick.KEY, this.candlestickKey1),
              this.EQ(this.Candlestick.KEY, this.candlestickKey2)
            ))
            .orderBy(this.Candlestick.CLOSE_VALUE_TIME)
            .select();

        let arr = sink.array;
        for ( let i = 0; i < arr.length; i++ ) {
          let c = arr[i];
          labels.set(c.closeValueTime.getTime(), c.closeValueTime);
          var dataset = datasets.get(c.key);
          if ( ! dataset ) {
            let h = i+100;
            let s = i+100;
            let l = i+100;
            dataset = {
              label: c.key,
              data: [],
              fill: false,
              borderColor: 'hsl('+h+','+s+','+l+')',
              tension: 0.1
            }
            datasets.set(c.key, dataset);
          }
          var data = dataset['data'];
          data.push(c.total);
        }
      }

      let config = {
        labels: [...labels.values()].sort(),
        datasets: [...datasets.values()]
      };

      this.chart = this.Line2.create({
        data: config
      });

    }
  ]
});
