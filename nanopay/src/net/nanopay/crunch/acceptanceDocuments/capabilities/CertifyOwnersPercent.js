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
  name: 'CertifyOwnersPercent',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'CERTIFY_OWNER_PERCENTAGE', message: 'You must certify that all beneficial owners with 25% or more ownership have been listed.' },
    { name: 'TITLE_MSG', message: 'any beneficial owners with 25% or more ownership have been listed and the information included about them is accurate.' }
  ],

  properties: [
    {
      name: 'checkboxText',
      factory: function() {
        return this.I_CERTIFY;
      }
    },
    {
        name: 'title',
        factory: function() {
          return this.TITLE_MSG;
        }
    },
    {
      name: 'link',
      factory: function() {
        return '/service/httpFileService/488eedba-b34a-4b61-9f6d-1c501f13dcc5?sessionId=' + localStorage['defaultSession'];
      }
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .CertifyOwnersPercent.AGREEMENT, true);
          },
          errorMessage: 'CERTIFY_OWNER_PERCENTAGE'
        }
      ]
    }
  ]
});
