/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.time',
  name: 'TimeZone',

  searchColumns: [
    'id',
    'displayName'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'displayName'
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      of: 'foam.nanos.auth.Country'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        var s = this.id;
        if ( this.displayName ) {
          s += " ";
          s += this.displayName;
        }
        return s;
      },
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append(getId());
        if ( ! foam.util.SafetyUtil.isEmpty(getDisplayName()) ) {
          sb.append(" ");
          sb.append(getDisplayName());
        }
        return sb.toString();
      `
    }
  ]
});
