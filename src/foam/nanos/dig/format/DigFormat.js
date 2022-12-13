/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.format',
  name: 'DigFormat',

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'driverNSpec'
    },
    {
      class: 'Enum',
      name: 'format',
      of: 'foam.nanos.http.Format'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function toSummary() {
        if ( this.name ) return this.name;
        if ( this.format ) return this.format.name;
        return this.id;
      },
      javaCode: `
        if ( ! SafetyUtil.isEmpty(this.getName()) ) return this.getName();
        return this.getId();
      `
    }
  ]
});
