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
      hidden: true,
      documentation: 'Unique ID'
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
      class: 'Boolean',
      name: 'skipLoginIdResolution',
      documentation: 'Whether to skip resolution of loginId against FlinksLoginId calls',
      storageTransient: true
    },
    {
      class: 'Reference',
      name: 'flinksAccountsDetails',
      of: 'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
      targetDAOKey: 'flinksAccountsDetailResponseDAO',
      readPermissionRequired: true,
      writePermissionRequired: true,
      documentation: 'Response to Flinks account details call'
    },
    {
      class: 'Reference',
      name: 'user',
      of: 'foam.nanos.auth.User',
      targetDAOKey: 'userDAO',
      documentation: 'User associated to this Flinks LoginId'
    },
    {
      class: 'Reference',
      name: 'business',
      of: 'net.nanopay.model.Business',
      targetDAOKey: 'businessDAO',
      documentation: 'Business associated to this Flinks LoginId'
    },
    {
      class: 'Reference',
      name: 'account',
      of: 'net.nanopay.account.Account',
      targetDAOKey: 'accountDAO',
      documentation: 'Account associated to this Flinks AccountId'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Date created'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'Creating user'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'Creating agent'
    }
  ]
});
