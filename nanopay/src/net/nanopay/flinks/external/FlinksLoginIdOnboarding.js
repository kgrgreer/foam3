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
  name: 'FlinksLoginIdOnboarding',
  extends: 'net.nanopay.flinks.external.FlinksLoginId',

  javaImports: [
    'foam.core.FObject',
    'java.util.HashMap'
  ], 

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.flinks.external.OnboardingType',
      name: 'type',
      documentation: 'Personal or business onboarding. Defaults to personal.'
    },
    {
      class: 'Map',
      name: 'missingUserCapabilityDataObjects',
      javaFactory: `
        return new HashMap<String,FObject>();
      `,
      readPermissionRequired: false,
      writePermissionRequired: true,
      documentation: 'Onboarding capabilities that remain to be satisfied for user'
    }
    ,
    {
      class: 'Map',
      name: 'missingBusinessCapabilityDataObjects',
      javaFactory: `
        return new HashMap<String,FObject>();
      `,
      readPermissionRequired: false,
      writePermissionRequired: true,
      documentation: 'Onboarding capabilities that remain to be satisfied for business'
    }
  ]
});
