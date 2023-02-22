/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.er',
  name: 'EventRecordResponse',

  documentation: `Documentation and Response for an event`,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'event',
      class: 'String'
    },
    {
      name: 'partner',
      class: 'String'
    },
    {
      name: 'code',
      class: 'String'
    },
    {
      name: 'description',
      class: 'String',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 5,
        cols: 80
      }
    },
    {
      name: 'response',
      label: 'Response / Resolution',
      class: 'String',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 5,
        cols: 80
      }
    }
  ]
});
