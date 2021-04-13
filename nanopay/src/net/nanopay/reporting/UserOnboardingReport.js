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
  package: 'net.nanopay.reporting',
  name: 'UserOnboardingReport',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

  ids: [
    'userId'
  ],

  properties: [
    {
      name: 'userId',
      class: 'Long'
    },
    {
      name: 'lastName',
      class: 'String'
    },
    {
      name: 'firstName',
      class: 'String'
    },
    {
      name: 'onboardingDate',
      class: 'Date'
    },
    {
      name: 'status',
      class: 'String'
    },
    {
      name: 'numberOfTransactionProcessed',
      class: 'UnitValue'
    },
    {
      name: 'currencyOfTransactionsProcessed',
      class: 'String'
    },
    {
      name: 'valueOfTransactionsProcessed',
      class: 'UnitValue'
    },
    {
      name: 'currencyOfFeeRevenue',
      class: 'String'
    },
    {
      name: 'feeRevenue',
      class: 'UnitValue'
    },
    {
      name: 'nanopayRevenue',
      class: 'UnitValue'
    },
    {
      name: 'intuitRevenue',
      class: 'UnitValue'
    },
    {
      name: 'created',
      class: 'DateTime'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    }
  ]
})
