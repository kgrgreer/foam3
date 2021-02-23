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
  name: 'FlinksAccountDetailRequest',
  extends: 'net.nanopay.flinks.model.FlinksAccountRequest',

  documentation: 'model for Flinks Account Detail Request',

  properties: [
    {
      class: 'Boolean',
      name: 'WithAccountIdentity'
    },
    {
      class: 'Boolean',
      name: 'WithKYC'
    },
    {
      class: 'String',
      name: 'DateFrom'
    },
    {
      class: 'String',
      name: 'DateTo'
    },
    {
      class: 'StringArray',
      name: 'AccountsFilter'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.RefreshDeltaModel',
      name: 'RefreshDelta'
    },
    {
      class: 'String',
      name: 'DaysOfTransactions'
    }
  ]
});