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
  package: 'net.nanopay.reporting',
  name: 'UserOnboardingReport',

  mixins: [
    'foam.nanos.auth.CreatedAwareMixin',
  ],

  ids: [
    'userId'
  ],

  tableColumns: [
    'userId',
    'firstName',
    'lastName',
    'business',
    'merchantId',
    'businessSending',
    'businessReceiving',
    'userSendingOver1000',
    'userSendingUnder1000',
    'onboardingSubmissionDate',
    'userCreated',
    'complianceStatus',
    'approvalDate',
    'firstPaymentDate',
    'city'
  ],

  properties: [
    {
      name: 'userId',
      class: 'Long'
    },
    {
      name: 'firstName',
      class: 'String'
    },
    {
      name: 'lastName',
      class: 'String'
    },
    {
      name: 'business',
      class: 'String'
    },
    {
      name: 'merchantId',
      class: 'String'
    },
    {
      name: 'businessSending',
      class: 'Boolean'
    },
    {
      name: 'businessReceiving',
      class: 'Boolean'
    },
    {
      name: 'userSendingOver1000',
      class: 'Boolean'
    },
    {
      name: 'userSendingUnder1000',
      class: 'Boolean'
    },
    {
      name: 'onboardingSubmissionDate',
      class: 'DateTime'
    },
    {
      name: 'userCreated',
      class: 'DateTime'
    },
    {
      name: 'complianceStatus',
      class: 'String'
    },
    {
      name: 'approvalDate',
      class: 'DateTime'
    },
    {
      name: 'firstPaymentDate',
      class: 'DateTime'
    },
    {
      name: 'city',
      class: 'String'
    }
  ]
})
