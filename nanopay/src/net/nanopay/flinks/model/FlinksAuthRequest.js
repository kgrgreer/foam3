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
  name: 'FlinksAuthRequest',
  extends: 'net.nanopay.flinks.model.FlinksRequest',

  documentation: 'model for Flinks authorize request',

  properties: [
    {
      class: 'String',
      name: 'LoginId'
    },
    {
      class: 'String',
      name: 'Username',
      hidden: true
    },
    {
      class: 'String',
      name: 'Password',
      hidden: true
    },
    {
      class: 'String',
      name: 'Institution'
    },
    {
      class: 'String',
      name: 'Language'
    },
    {
      //key: MFA, value: MFA answer 
      class: 'Map',
      name: 'SecurityResponses',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'save'
    },
    {
      class: 'Boolean',
      name: 'ScheduleRefresh'
    },
    {
      class: 'Boolean',
      name: 'DirectRefresh'
    },
    {
      class: 'Boolean',
      name: 'MostRecentCached'
    },
    {
      class: 'String',
      name: 'Tag'
    }
  ]
});