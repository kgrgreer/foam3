/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.er',
  name: 'EventRecordResponse',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  ids: [
    'code',
    'partner'
  ],

  properties: [
    {
      name: 'code',
      class: 'String',
      required: true
    },
    {
      name: 'partner',
      class: 'String',
      require: true
    },
    {
      name: 'event',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'response',
      class: 'String',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 5,
        cols: 80
      }
    },
    {
      name: 'summary',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      javaCode: `
      if ( ! SafetyUtil.isEmpty(getSummary()) ) {
        return getSummary();
      }
      return null;
      `
    }
  ]
});
