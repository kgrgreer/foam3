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
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'NanopayInternationalPaymentsCustomerAgreement',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'ACKNOWLEDGE_AGREEMENT', message: 'Certification required' }
  ],

  sections: [
    {
      name: 'reviewAgreementDocumentsSection',
      title: 'Review and accept the customer agreement',
      navTitle: 'Terms and Conditions',
      permissionRequired: true
    },
  ],

  properties: [
    {
      name: 'title',
      value: 'nanopay International Payments Customer Agreement'
    },
    {
      name: 'checkboxText',
      value: 'I certify that I have read, understood and agree to the '
    },
    {
      name: 'fileId',
      factory: function() {
        return '25c8917b-4283-ba9a-8158-533241a09619';
      }
    },
    {
      name: 'version',
      value: '1.0'
    },
    {
      name: 'issuedDate',
      factory: function() {
        return new Date('2019-02-01T00:00:00.0Z');
      }
    },
    {
      name: 'transactionType',
      value: 'AscendantFXTransaction'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .NanopayInternationalPaymentsCustomerAgreement.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_AGREEMENT'
        }
      ]
    }
  ]
});
