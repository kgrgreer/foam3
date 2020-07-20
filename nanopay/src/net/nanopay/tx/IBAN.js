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
  package: 'net.nanopay.tx',
  name: 'IBAN',
  documentation: 'model of the IBAN',

  properties: [
    {
      name: 'id',
      class: 'String',
      required: true,
    },
    {
      name: 'bankAccount',
      class: 'Reference',
      of: 'net.nanopay.bank.BankAccount',
      targetDAOKey: 'accountDAO',
      documentation: 'The bank account that this IBAN redirects money too. should be in the same tree as assigned account.'
    },
    {
      class: 'Reference',
      of: 'foam.core.Unit',
      name: 'denomination',
      targetDAOKey: 'currencyDAO',
      //maybe should be tied to bankAccount currency?
    },
    {
      name: 'assignedAccount',
      class: 'Reference',
      of: 'net.nanopay.account.DigitalAccount',
      targetDAOKey: 'accountDAO',
      documentation: 'The virtual account this IBAN is assigned to'
    },
    {
      name: 'isAvailable',
      class: 'Boolean',
      expression: function (assignedAccount) {
        return (assignedAccount == null);
      },
      storageTransient: true,
      visibility: 'RO'
    },
  ]
});
