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
      value: 1,
      visibility: 'RO'
    },
    {
      name: 'bootstrapHashOffset',
      class: 'Int',
      value: 0
    },
    {
      documentation: 'DefaultDaggerService only supports 2 links',
      name: 'bootstrapHashEntries',
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
    },
    {
      documentation:'Index after reconfiguration, to be used as initial global index for next startup',
      name: 'bootstrapIndex',
      class: 'Long',
      value: 0,
      visibility: 'RO'
    },
    {
      documentation: 'Store first byte of each hash retrieved from the system supplied hashes set',
      class: 'StringArray',
      name: 'bootstrapHashes',
      javaFactory: 'return new String[getBootstrapHashEntries()];',
      // REVIEW: security concern sending first 8 characters of hash?
      // storageTransient: true,
      visibility: 'RO'
    },
    {
      documentation: 'Store first byte of each calculated bootstrap hash, so compaction can compare all mediators',
      class: 'StringArray',
      name: 'bootstrapDAGHashes',
      javaFactory: 'return new String[getBootstrapHashEntries()];',
      // REVIEW: security concern sending first 8 characters of hash?
      // storageTransient: true,
      visibility: 'RO'
    }
  ]
});
