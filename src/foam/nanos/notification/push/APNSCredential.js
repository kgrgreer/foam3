/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'APNSCredential',
  extends: 'foam.nanos.auth.Credential',

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'host'
    },
    {
      class: 'String',
      name: 'certificateAlias'
    },
    {
      class: 'String',
      name: 'keyAlias'
    },
    {
      class: 'String',
      name: 'appBundleId'
    }
  ]
});
