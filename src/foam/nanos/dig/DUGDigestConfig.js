/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUGDigestConfig',

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid'
    },
    {
      class: 'Boolean',
      name: 'enabled'
    },
    {
      class: 'String',
      name: 'algorithm',
      value: 'SHA-256'
    },
    {
      class: 'Password',
      name: 'secretKey'
    }
  ]
});
