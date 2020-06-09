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
    { name: 'ACKNOWLEDGE_AGREEMENT', message: 'Must acknowledge the agreement above.' }
  ],

  properties: [
    {
      name: 'title',
      value: 'nanopay international Payments Customer Agreement'
    },
    {
      name: 'checkboxText',
      value: 'I acknowledge that I have read and accept the '
    },
    {
      name: 'link',
      value: 'https://ablii.com/wp-content/uploads/2019/08/Sep-2019-nanopay-International-Payments-Customer-Agreement.pdf'
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
