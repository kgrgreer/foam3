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
    'foam.graphics.CView',
    'foam.graphics.Box',
    'foam.graphics.Label',
    'foam.nanos.analytics.Candlestick',
    'org.chartjs.Line2'
  ],

  imports: [
    'om1MinuteDAO',
    'om5MinuteDAO',
    'omHourlyDAO',
    'omDailyDAO'
  ],

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
      value: 'omDailyDAO',
      targetDAOKey: 'AuthenticatedNSpecDAO',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'DAO',
              dao: X.AuthenticatedNSpecDAO
                .where(E.AND(
                  E.EQ(foam.nanos.boot.NSpec.SERVE, true),
                  E.ENDS_WITH(foam.nanos.boot.NSpec.NAME, 'DAO'),
                  E.OR(
                    E.CONTAINS_IC("candlestick"),
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
    'canvasContainer',
    {
      name: 'canvas',
      factory: function() {
        return this.Box.create({
          width: 1400,
          height: 700
        });
      },
      visibility: 'RO'
    }
  ]
});
