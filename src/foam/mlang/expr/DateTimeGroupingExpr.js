/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'DateTimeGroupingExpr',
  extends: 'foam.mlang.AbstractExpr',

  implements: [ 'foam.core.Serializable' ],

  documentation: `
    An expr whose value is the name of a date grouping.
    Currently works with hours, days, weeks, months, and years.
  `,

  javaImports: [
    'foam.nanos.auth.CreatedAware',
    'java.util.Arrays',
    'java.util.Comparator',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Enum',
      of: 'foam.time.TimeUnit',
      name: 'dateGroupingType',
      value: 'DAY'
    },
    {
      class: 'FObjectArray',
      of: 'foam.mlang.expr.DateGrouping',
      name: 'dateGroups',
      factory: function() {
        return [];
      },
      javaFactory: `
        return new foam.mlang.expr.DateGrouping[0];
      `
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(obj) {
        var groups = [ ...this.dateGroups ];

        // TODO: Add a check for overlap between dateGroups and other data validation
        groups.sort((a, b) => a.low - b.low);

        var offset = new Date().getTimezoneOffset() * 60000;
        var diff   = Math.floor((new Date().getTime()-offset)/this.dateGroupingType.conversionFactorMs) -
                     Math.floor((obj.created.getTime()-offset)/this.dateGroupingType.conversionFactorMs);

        for ( var i = 0 ; i < groups.length ; i++ ) {
          var group = groups[i];
          if ( diff >= group.low && diff < group.high )
            return group.name;
        }

        return 'Unknown Range';
      },
      javaCode: `
        DateGrouping[] dateGroupsSorted = getDateGroups().clone();

        Arrays.sort(dateGroupsSorted, new Comparator<DateGrouping>() {
          public int compare(DateGrouping a, DateGrouping b) {
            return a.getLow() - b.getHigh();
          }
        });

        Date today = new Date();

        CreatedAware createdAwareObj = (CreatedAware) obj;

        Double objDiffFromTodayMs = Math.floor(today.getTime()) - Math.floor(createdAwareObj.getCreated().getTime());

        Double diff = objDiffFromTodayMs / getDateGroupingType().getConversionFactorMs();

        for ( int i = 0; i < dateGroupsSorted.length; i++ ){
          DateGrouping group = dateGroupsSorted[i];

          if ( diff >= group.getLow() && diff < group.getHigh() )
            return group.getName();
        }

        return "Unknown Range";
      `
    }
  ]
});
