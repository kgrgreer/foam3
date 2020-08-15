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
  package: 'net.nanopay.bank',
  name: 'BRBankAccount',
  label: 'Brazilian Bank Account',
  extends: 'net.nanopay.bank.BankAccount',

  documentation: 'Brazilian bank account information.',

  messages: [
    { name: 'ACCOUNT_TYPE_REQUIRED', message: 'Account type required.' },
    { name: 'ACCOUNT_HOLDER_REQUIRED', message: 'Account holder required.' }
  ],

  properties: [
    {
      name: 'country',
      value: 'BR',
      visibility: 'RO'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/brazil.svg',
      visibility: 'RO'
    },
    {
      name: 'bankCode',
      label: 'Bank Code',
      updateVisibility: 'RO',
      validateObj: function(bankCode) {
        var regex = /^[A-z0-9a-z]{8}$/;

        if ( bankCode === '' ) {
          return this.BANK_CODE_REQUIRED;
        } else if ( ! regex.test(bankCode) ) {
          return this.BANK_CODE_INVALID;
        }
      }
    },
    {
      class: 'String',
      name: 'branchCode',
      label: 'Branch Code',
      section: 'accountDetails',
      updateVisibility: 'RO',
      validateObj: function(branchCode) {
        var regex = /^[0-9]{5}$/;

        if ( branchCode === '' ) {
          return this.BRANCH_CODE_REQUIRED;
        } else if ( ! regex.test(branchCode) ) {
          return this.BRANCH_CODE_INVALID;
        }
      }
    },
    {
      name: 'accountNumber',
      label: 'Account No.',
      updateVisibility: 'RO',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '1234567890',
        onKey: true
      },
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
      tableCellFormatter: function(str) {
        if ( ! str ) return;
        var displayAccountNumber = '***' + str.substring(str.length - 4, str.length)
        this.start()
          .add(displayAccountNumber);
        this.tooltip = displayAccountNumber;
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{10}$/;

        if ( accountNumber === '' ) {
          return this.ACCOUNT_NUMBER_REQUIRED;
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return this.ACCOUNT_NUMBER_INVALID;
        }
      }
    },
    {
      name: 'accountType',
      label: 'Account Type',
      updateVisibility: 'RO',
      section: 'accountDetails',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Please select',
        choices: [
          ['c', 'Corrente / Current'],
          ['p', 'Poupança / Savings']
        ]
      },
      validateObj: function(accountType) {
        if ( accountType === '' || accountType === undefined ) {
          return this.ACCOUNT_TYPE_REQUIRED;
        }
      }
    },
    {
      name: 'accountOwnerType',
      label: 'Account Holder',
      updateVisibility: 'RO',
      section: 'accountDetails',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Please select',
        choices: [
          ['1', '1st Holder / 1o Titular'],
          ['2', '2nd Holder / 2o Titular'],
          ['3', '1st Holder / 1o Titular'],
          ['4', '2nd Holder / 2o Titular'],
          ['5', '1st Holder / 1o Titular']
        ]
      },
      validateObj: function(accountOwnerType) {
        if ( accountOwnerType === '' || accountOwnerType === undefined ) {
          return this.ACCOUNT_HOLDER_REQUIRED;
        }
      }
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    },
    {
      name: 'type',
      visibility: 'HIDDEN'
    }
  ]
});
