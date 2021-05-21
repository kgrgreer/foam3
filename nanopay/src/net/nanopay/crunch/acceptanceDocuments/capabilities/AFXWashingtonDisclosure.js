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
  name: 'AFXWashingtonDisclosure',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'ACKNOWLEDGE_DISCLOSURE', message: 'Must acknowledge the Disclosure' }
  ],

  properties: [
    {
      name: 'title',
      value: 'AFX Washington Disclosure'
    },
    {
      name: 'checkboxText',
      value: 'I agree to '
    },
    {
      name: 'country',
      value: 'US'
    },
    {
      name: 'state',
      value: 'WA'
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
              .AFXWashingtonDisclosure.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_DISCLOSURE'
        }
      ]
    }
  ]
});
