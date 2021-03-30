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
  package: 'net.nanopay.crunch.bepay',
  name: 'ExtendedUserDetailsData',

  documentation: `This model represents the expanded info of a User that must be collect for BePay onboarding.`,

  properties: [
    {
      class: 'String',
      name: 'mothersMaidenName',
      label: 'mother\'s maiden name'
    }
  ]
});
