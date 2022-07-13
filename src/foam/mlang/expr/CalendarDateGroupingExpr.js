/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'CalendarDateGroupingExpr',
  extends: 'foam.mlang.AbstractExpr',

  implements: [ 'foam.core.Serializable' ],

  documentation: `
    An expr whose value is the name of a calendar date grouping.
    Currently works with hours, days, weeks, months, and years.
  `,

  javaImports: [
    'foam.nanos.auth.CreatedAware',
    'java.util.Arrays',
    'java.util.Comparator',
    'java.util.Date',
    'java.lang.Long'
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
        var dateGroupsSorted = [
          ...this.dateGroups
        ];

        // TODO: Add a check for overlap between dateGroups and other data validation
        dateGroupsSorted.sort((a, b) => a.low - b.high);

        var today = new Date();
        var objDate = new Date(obj.created.getTime());

        var d1 = new Date(objDate.getFullYear(), objDate.getMonth(), objDate.getDate());
        var d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        var objDiffFromTodayDays = (d2 - d1) / (1000 * 3600 * 24);

        var groupName = "Unknown Range";

        dateGroupsSorted.forEach(group => {
          if (
            objDiffFromTodayDays >= group.low &&
            objDiffFromTodayDays < group.high
          ) groupName = group.name;
        })

        return groupName;
      },
      javaCode: `
        DateGrouping[] dateGroupsSorted = getDateGroups().clone();

        Arrays.sort(dateGroupsSorted, new Comparator<DateGrouping>() {
          public int compare(DateGrouping a, DateGrouping b) {
            return a.getLow() - b.getHigh();
          }
        });

        CreatedAware createdAwareObj = (CreatedAware) obj;

        Date today = new Date();
        Date objDate = new Date(createdAwareObj.getCreated().getTime());

        Date d1 = new Date(objDate.getYear() + 1900, objDate.getMonth(), objDate.getDate());
        Date d2 = new Date(today.getYear() + 1900, today.getMonth(), today.getDate());

        double objDiffFromTodayDays = (d2.getTime() - d1.getTime()) / (1000 * 3600 * 24);

        for ( int i = 0; i < dateGroupsSorted.length; i++ ){
          DateGrouping group = dateGroupsSorted[i];

          if (
            objDiffFromTodayDays >= group.getLow() &&
            objDiffFromTodayDays < group.getHigh()
          ) {
            return group.getName();
          }
        }

        return "Unknown Range";
      `
    }
  ]
});
