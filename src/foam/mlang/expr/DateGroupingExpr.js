/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'DateGroupingExpr',
  extends: 'foam.mlang.AbstractExpr',

  implements: [ 'foam.core.Serializable' ],

  documentation: `
    An expr whose value is the date/month/year of a date grouping.
  `,

  javaImports: [
    'foam.nanos.auth.CreatedAware',
    'java.util.Arrays',
    'java.util.Comparator',
    'java.util.Date',
    'java.util.Calendar',
    'java.util.Locale'
  ],

  properties: [
    {
      class: 'Enum',
      of: 'foam.mlang.expr.DateTypes',
      name: 'dateGroupingType',
      value: 'MONTHS'
    }
  ],

  methods: [
    {
      name: 'f',
      args: [
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      code: function(obj) {
        if ( obj.created ) {
          var dateCreated = new Date(obj.created);
          if ( this.dateGroupingType == 'DAYS' ) {
            return dateCreated.toLocaleString([], { day: 'numeric', month: 'long',  year: 'numeric' });
          }
          else if ( this.dateGroupingType == 'MONTHS' ) {
            return dateCreated.toLocaleString([], { month: 'long',  year: 'numeric' });
          }
          else if ( this.dateGroupingType == 'YEARS' ) {
            return dateCreated.toLocaleString([], { year: 'numeric' });
          }
        }
        return 'Unknown Range';
      },
      javaCode: `
        CreatedAware createdAwareObj = (CreatedAware) obj;

        if ( createdAwareObj.getCreated() != null ) {
          Date dateCreated = new Date(createdAwareObj.getCreated().toString());
          Calendar c = Calendar.getInstance();
          c.setTime(dateCreated);

          if ( getDateGroupingType().getName().equals("DAYS") ) {
            return Integer.toString(c.get(Calendar.DAY_OF_MONTH)) + " " + c.getDisplayName(Calendar.MONTH, Calendar.LONG, new Locale("en") ) + ", " + Integer.toString(c.get(Calendar.YEAR));
          }
          else if ( getDateGroupingType().getName().equals("MONTHS") ) {
            return c.getDisplayName(Calendar.MONTH, Calendar.LONG, new Locale("en") ) + " " + Integer.toString(c.get(Calendar.YEAR));
          }
          else if ( getDateGroupingType().getName().equals("YEARS") ) {
            return Integer.toString(c.get(Calendar.YEAR));
          }
        }
        return "Unknown Range";
      `
    }
  ]
});
