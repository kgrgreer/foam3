/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
  package: 'net.nanopay.account',
  name: 'ZeroAccountUserAssociation',

  documentation: 'User associated with particular Transactions, from which to locate the Zero Account (Trust, Losses Account).  AlternaCITransaction -> nanopay -> TrustAccount for owner nanopay in currency CAD.',

  properties: [
    {
      documentation: 'Unique String such as spid-currency which maps to User which owns TrustAccount for example.',
      name: 'id',
      class: 'String',
      value: 'nanopay.*'
    },
   // {
   //    name: 'id',
   //    class: 'Long',
   // },
   // {
   //    name: 'sp',
   //    label: 'Service Provider',
   //    class: 'Reference',
   //    of: 'foam.nanos.auth.ServiceProvider',
   //    value: 'nanopay'
   //  },
   //  {
   //    name: 'currency',
   //    class: 'String',
   //    value: '*'
   //  }
    {
      name: 'user',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      value: 1
    }
  ]
});
