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
  name: 'CADAFEXTerms',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'ACKNOWLEDGE_AGREEMENT', message: 'Must acknowledge the agreement' }
  ],

  properties: [
    {
      name: 'title',
      value: `AFEX terms and conditions`
    },
    {
      name: 'checkboxText',
      value: 'I acknowledge that international payments are authorized and provided by AFEX and not nanopay. I certify that all statements provided are true and correct and I have obtained consent to submit all personal information provided. I have read, understood and agree to '
    },
    {
      name: 'fileId',
      factory: function() {
        return '11d13e7c-692b-eb6c-22a0-647b4f3ca94e';
      }
    },
    {
      name: 'version',
      value: '1.0'
    },
    {
      name: 'issuedDate',
      factory: function() {
        return new Date('2019-08-09T00:00:00.0Z');
      }
    },
    {
      name: 'transactionType',
      value: 'AFEX'
    },
    {
      name: 'country',
      value: 'CA'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .CADAFEXTerms.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_AGREEMENT'
        }
      ]
    }
  ]
});
