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

foam.ENUM({
  package: 'net.nanopay.util',
  name: 'Frequency',

  documentation: 'Frequency.',

  values: [
    {
      name: 'DAILY',
      label: 'Daily',
      ms: 24 * 60 * 60 * 1000
    },
    {
      name: 'WEEKLY',
      label: 'Weekly',
      ms: 7 * 24 * 60 * 60 * 1000
    },
    {
      name: 'MONTHLY',
      label: 'Monthly',
      ms: 30 * 24 * 60 * 60 * 1000
    },
    {
      name: 'PER_TRANSACTION',
      label: 'Per Transaction',
      ms: 1
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'ms'
    }
  ]
});
