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
  package: 'net.nanopay.flinks.external',
  name: 'FlinksLoginId',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware'
  ],

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.flinks.model.FlinksAccountsDetailResponse'
  ], 

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'loginId'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.flinks.model.AccountType',
      name: 'type'
    },
    {
      class: 'Reference',
      name: 'flinksAccountsDetails',
      of: 'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
      targetDAOKey: 'flinksAccountsDetailResponseDAO',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Reference',
      name: 'account',
      of: 'net.nanopay.account.Account',
      targetDAOKey: 'accountDAO',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'DateTime',
      name: 'created',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent'
    }
  ]
})