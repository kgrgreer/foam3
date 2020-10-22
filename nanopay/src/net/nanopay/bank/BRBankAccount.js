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

  imports: [
    'notify',
    'stack',
    'subject'
  ],

  requires: [
    'foam.log.LogLevel'
  ],

  javaImports: [
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern',
  ],

  messages: [
    { name: 'ACCOUNT_NUMBER_INVALID', message: 'Account number must be 10 digits long.' },
    { name: 'ACCOUNT_NUMBER_REQUIRED', message: 'Account number required.' },
    { name: 'ACCOUNT_TYPE_REQUIRED', message: 'Account type required.' },
    { name: 'ACCOUNT_HOLDER_REQUIRED', message: 'Account holder required.' },
    { name: 'BANK_ADDED', message: 'Bank Account added successfully!' },
    { name: 'BANK_CODE_INVALID', message: 'Bank code must be 8 letters and/or digits long.' },
    { name: 'BANK_CODE_REQUIRED', message: 'Bank code required.' },
    { name: 'BRANCH_CODE_INVALID', message: 'Branch code must be 5 digits long.' },
    { name: 'BRANCH_CODE_REQUIRED', message: 'Branch code required.' }
  ],

  constants: [
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{10}$")'
    },
    {
      name: 'BANK_CODE_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[A-z0-9a-z]{8}")'
    },
    {
      name: 'BRANCH_CODE_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{5}$")'
    }
  ],

  properties: [
    {
      name: 'denomination',
      value: 'BRL'
    },
    {
      name: 'country',
      value: 'BR',
      visibility: 'RO'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/brazil.png',
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
      class: 'String',
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
      class: 'String',
      name: 'accountOwnerType',
      label: 'Account Holder',
      updateVisibility: 'RO',
      section: 'accountDetails',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Please select',
        choices: [
          ['1', '1st Holder / 1o Titular'],
          ['2', '2nd Holder / 2o Titular']
        ]
      },
      validateObj: function(accountOwnerType) {
        if ( accountOwnerType === '' || accountOwnerType === undefined ) {
          return this.ACCOUNT_HOLDER_REQUIRED;
        }
      }
    },
    {
      class: 'String',
      name: 'iban',
      label: 'IBAN',
      required: true,
      section: 'accountDetails',
      updateVisibility: 'RO'
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    },
    {
      name: 'type',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    async function save(stack_back) {
      try {
        await this.subject.user.accounts.put(this);
        if ( this.stack && stack_back ) this.stack.back();
        this.notify(this.BANK_ADDED, '', this.LogLevel.INFO, true);
      } catch (err) {
        this.notify(err.message, '', this.LogLevel.ERROR, true);
      }
    },
    {
      name: 'validate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        super.validate(x);
        validateBankCode();
        validateBranchCode();
        validateAccountNumber();
      `
    },
    {
      name: 'validateBankCode',
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `     
        String bankCode = this.getBankCode();

        if ( SafetyUtil.isEmpty(bankCode) ) {
          throw new IllegalStateException(this.BANK_CODE_REQUIRED);
        }

        if ( ! BANK_CODE_PATTERN.matcher(bankCode).matches() ) {
          throw new IllegalStateException(this.BANK_CODE_INVALID);
        }
      `
    },
    {
      name: 'validateBranchCode',
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `     
        String branchCode = this.getBranchCode();

        if ( SafetyUtil.isEmpty(branchCode) ) {
          throw new IllegalStateException(this.BRANCH_CODE_REQUIRED);
        }
        if ( ! BRANCH_CODE_PATTERN.matcher(branchCode).matches() ) {
          throw new IllegalStateException(this.BRANCH_CODE_INVALID);
        }
      `
    },
    {
      name: 'validateAccountNumber',
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        String accountNumber = this.getAccountNumber();

        if ( SafetyUtil.isEmpty(accountNumber) ) {
          throw new IllegalStateException(this.ACCOUNT_NUMBER_REQUIRED);
        }
        if ( ! ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches() ) {
          throw new IllegalStateException(this.ACCOUNT_NUMBER_INVALID);
        }
      `
    }
 ]
});
