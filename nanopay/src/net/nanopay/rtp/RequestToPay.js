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
  package: 'net.nanopay.rtp',
  name: 'RequestToPay',

  imports: [
    'appConfig',
    'userDAO'
  ],

  javaImports: [
    'java.util.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      visibility: 'RO',
      javaFactory: `
        return UUID.randomUUID().toString().replace("-", "");
       `
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'payer',
      tableCellFormatter: function(value) {
        var self = this;
        this.__subSubContext__.userDAO.find(value).then((user)=> {
          user.firstName && user.lastName ? self.add(user.firstName + ' ' + user.lastName) : self.add(user.email);
        });
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.flinks.external.FlinksLoginId',
      targetDAOKey: 'flinksLoginIdDAO',
      name: 'onboardingRequest'
    },
    {
      class: 'Boolean',
      name: 'agreement',
      documentation: 'Agreement to the T&C and PAD agreement'
    },
    {
      class: 'Enum',
      name: 'status',
      of: 'net.nanopay.tx.model.TransactionStatus',
      value: 'PENDING'
    },
    {
      class: 'String',
      name: 'url',
      visibility: 'RO',
      expression: function (appConfig, payerSession, id) {
        return appConfig.url + "/?sessionId=" + payerSession + "#rtpLogin:rtp=" + id;
      }
    },
    {
      class: 'String',
      name: 'purpose',
      factory: function() { return '2020/21 Annual Membership Dues'; }
    },
    {
      class: 'String',
      name: 'payerSession',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'recipientName',
      visibility: 'HIDDEN'
    },
    {
      class: 'Long',
      name: 'amount'
    }
  ]
});