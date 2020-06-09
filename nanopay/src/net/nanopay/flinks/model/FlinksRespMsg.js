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
  package: 'net.nanopay.flinks.model',
  name: 'FlinksRespMsg',

  properties: [
    {
      class: 'Int',
      name: 'httpStatus'
    },
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'String',
      name: 'errorMessage'
    },
    {
      class: 'String',
      name: 'institution'
    },
    {
      class: 'String',
      name: 'username'
    },
    {
      class: 'String',
      name: 'requestId'
    },
    {
      class: 'String',
      name: 'loginId'
    },
    {
      class: 'String',
      name: 'password',
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.FlinksAccount',
      name: 'accounts'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.SecurityChallengeModel',
      name: 'securityChallenges'
    }
  ]
})