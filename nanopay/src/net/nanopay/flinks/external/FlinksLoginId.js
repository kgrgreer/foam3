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
      name: 'id',
      hidden: true
    },
    {
      class: 'String',
      name: 'loginId',
      documentation: 'Flinks LoginId'
    },
    {
      class: 'String',
      name: 'accountId',
      documentation: 'Flinks AccountId'
    },
    {
      class: 'String',
      name: 'institution',
      documentation: 'Flinks Institution'
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
      name: 'user',
      of: 'foam.nanos.auth.User',
      targetDAOKey: 'userDAO'
    },
    {
      class: 'Reference',
      name: 'business',
      of: 'net.nanopay.model.Business',
      targetDAOKey: 'businessDAO'
    },
    {
      class: 'Reference',
      name: 'account',
      of: 'net.nanopay.account.Account',
      targetDAOKey: 'accountDAO'
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
});
