/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.place',
  name: 'PlaceDetailAddressComponent',

  properties: [
    {
      class: 'String',
      shortName: 'long_name',
      name: 'longName'
    },
    {
      class: 'String',
      shortName: 'short_name',
      name: 'shortName'
    },
    {
      class: 'StringArray',
      name: 'types',
      shortName: 'types',
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.longName + " | " + this.shortName + " | " + this.types.join(",");
      },
      javaCode: `
        return "";
      `
    }
  ]
})