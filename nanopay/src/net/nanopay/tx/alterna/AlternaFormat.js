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
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaFormat',

  documentation: 'Cashout and Cashin CSV Format for alterna.',

  properties: [
    {
      class: 'String',
      name: 'padType'
    },
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'transitNumber',
      validateObj: function(transitNumber) {
        var transNumRegex = /^[0-9]{5}$/;
        if ( ! transitNumber ) {
          return 'Please enter transit number';
        }

        if ( ! transNumRegex.test(transitNumber) ) {
          return 'Invalid transit number.';
        }
      }
    },
    {
      class: 'String',
      name: 'bankNumber',
      validateObj: function(bankNumber) {
        var instNumRegex = /^[0-9]{3}$/;
        if ( ! bankNumber ) {
          return 'Please enter institution number.';
        }

        if ( ! instNumRegex.test(bankNumber) ) {
          return 'Invalid institution number.';
        }
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{0,7}$/;
        if ( ! accountNumber ) {
          return 'Please enter account number.';
        }

        if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Invalid account number.';
        }
      }
    },
    {
      class: 'String',
      name: 'amountDollar'
    },
    {
      class: 'String',
      name: 'txnType'
    },
    {
      class: 'String',
      name: 'txnCode',
      value: '729'
    },
    {
      class: 'String',
      name: 'processDate'
    },
    {
      class: 'String',
      name: 'reference'
    }
  ]
});
