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
  extends: 'net.nanopay.flinks.external.FlinksLoginIdRequest',

  javaImports: [
    'foam.core.FObject',
    'java.util.HashMap',
    'net.nanopay.account.Account',
    'net.nanopay.flinks.model.FlinksAccountsDetailResponse'
  ], 

  properties: [
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
      documentation: 'Whether to skip resolution of loginId against FlinksLoginId calls'
    },
    {
      class: 'Boolean',
      name: 'guestMode',
      documentation: 'Whether the user is logging in in guest mode or not'
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
      class: 'UnitValue',
      name: 'amount',
      unitPropName: 'currency'
    },
    {
      class: 'String',
      name: 'currency',
      value: 'CAD',
      externalTransient: true
    },
    {
      class: 'Enum',
      of: 'net.nanopay.flinks.external.OnboardingType',
      name: 'type',
      value: 'DEFAULT',
      documentation: `Personal or business onboarding. 
        If type is provided, it forces that type of onboarding. 
        If not provided, the login type from Flinks is used to determine the type of onboarding.`
    },
    {
      name: 'capabilityPayloads',
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.connection.CapabilityPayload',
      readPermissionRequired: false,
      writePermissionRequired: true,
      documentation: 'Onboarding capabilities that remain to be satisfied for top level capabilities'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.external.FlinksOverrides',
      name: 'flinksOverrides',
      documentation: 'Data that will override the data retrieved from Flinks.'
    }
  ]
});
