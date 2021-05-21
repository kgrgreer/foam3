/**
 * NANOPAY CONFIDENTIAL
 *
 * 2020 nanopay Corporation
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
  package: 'net.nanopay.tx',
  name: 'RequestMoney',
  ids: [ 'requestId' ],

  properties: [
    {
      name: 'requestId',
      documentation: 'Unique ID for each Request Money request.',
      class: 'String',
    },
    {
      name: 'requestAmount',
      documentation: 'Request Amount in CAD',
      class: 'Long'
    },
    {
      name: 'requestExpiryDate',
      class: 'DateTime',
      documentation: 'Request Expiry Date in UTC.',
    },
    {
      name: 'senderMemo',
      class: 'String',
      documentation: 'Message to Recipient'
    },
    {
      name: 'requesterName',
      class: 'String',
    },
    {
      name: 'requesterEmail',
      class: 'String',
    },
    {
     name: 'fiAccountId',
     class: 'String',
     documentation: 'Unique FI Identifier for Requester’s Account.'
    },
    {
      name: 'custAccount',
      class: 'String',
      documentation: `Requester account number. Canadian bank account format is aaa-bbbbb-cccccccccccccccccccc ‘aaa’ is the Financial Institution Identifier ‘bbbbb’ is the Transit Number ‘cccccccc...’ is the Account Number. Maximum length = 30.`
    },
    {
      name: 'returnUrl',
      class: 'String',
      documentation: 'If present the Responder’s browser is redirected to the Return URL after the Responder fulfills the Request Money request',
    }
  ]
});
