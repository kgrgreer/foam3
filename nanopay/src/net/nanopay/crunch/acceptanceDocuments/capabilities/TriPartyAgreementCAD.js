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
  name: 'TriPartyAgreementCAD',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'ACKNOWLEDGE_AGREEMENT', message: 'Must acknowledge the agreement above' }
  ],

  properties: [
    {
      name: 'title',
      value: 'Tri-Party Agreement for Ablii Payment Services - Canada Agreement'
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
      name: 'fileId',
      factory: function() {
        return '327697bc-08af-4cf7-f10d-0d0607060137';
      }
    },
    {
      name: 'checkboxText',
      value: 'I acknowledge that I have read and accept the above '
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
              .TriPartyAgreementCAD.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_AGREEMENT'
        }
      ]
    }
  ]
});
