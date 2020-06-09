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
  package: 'net.nanopay.account',
  name: 'DigitalAccountInfo',
  ids: ['accountId'],
  imports: [ 'addCommas'],

  properties: [
    {
      class: 'Long',
      name: 'accountId',
    }, 
    {
      class: 'Long',
      name: 'balance',
      tableCellFormatter: function(amount, X) {        
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      class: 'String',
      name: 'owner',
    }, 
    {
      class: 'String',
      name: 'currency',
    }, 
    {
      class: 'Long',
      name: 'transactionsRecieved',
      label: 'Recieved #'
    }, 
    {
      class: 'Long',
      name: 'transactionsSent',
      label: 'Sent #'

    },
    {
      class: 'Double',
      name: 'transactionsSumRecieved',
      label: 'Recieved Amount',
      tableCellFormatter: function(amount, X) {        
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }

    }, 
    {
      class: 'Double',
      name: 'transactionsSumSent',
      label: 'Sent Amount',
      tableCellFormatter: function(amount, X) {        
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }

    },
  ]
});