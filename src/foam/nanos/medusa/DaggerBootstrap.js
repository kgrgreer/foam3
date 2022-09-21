/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'DaggerBootstrap',

  documentation: 'Instructions for which bootstrap hashes to use. Bootstrap hashes themselves are provided by an HSM or other secure vault.',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  properties: [
    {
      name: 'id',
      class: 'Long',
      value: 1
    },
    {
      name: 'bootstrapIndex',
      class: 'Int',
      value: 0
    },
    {
      name: 'bootstrapEntries',
      class: 'Int',
      value: 2
    },
    {
      name: 'hashingEnabled',
      class: 'Boolean',
      value: true
    },
    {
      name: 'algorithm',
      class: 'String',
      value: 'SHA-256'
    }
  ]
});
