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
  label: 'Brazil Bank',
  extends: 'net.nanopay.bank.BankAccount',

  documentation: 'Brazilian bank account information.',

  implements: [
    'foam.core.Validatable'
  ],

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

  sections: [
    {
      name: 'accountInformation',
      title: function() {
        return this.SECTION_ACCOUNT_INFORMATION_TITLE;
      }
    }
  ],

  messages: [
    { name: 'ACCOUNT_NUMBER_INVALID', message: 'Account number must be 10 digits long' },
    { name: 'ACCOUNT_NUMBER_REQUIRED', message: 'Account number required' },
    { name: 'ACCOUNT_TYPE_REQUIRED', message: 'Account type required' },
    { name: 'ACCOUNT_HOLDER_REQUIRED', message: 'Account holder required' },
    { name: 'BANK_ADDED', message: 'Bank Account successfully added' },
    { name: 'INSTITUTION_NUMBER_INVALID', message: 'Institution number must be 8 letters and/or digits long' },
    { name: 'INSTITUTION_NUMBER_REQUIRED', message: 'Institution number required' },
    { name: 'BRANCH_ID_INVALID', message: 'Branch id must be 5 digits long' },
    { name: 'BRANCH_ID_REQUIRED', message: 'Branch id required' },
    { name: 'HOLDER1', message: '1st Holder' },
    { name: 'HOLDER2', message: '2nd Holder' },
    { name: 'CURRENT', message: 'Current' },
    { name: 'SAVINGS', message: 'Savings' },
    { name: 'PLEASE_SELECT', message: 'Please select' },
    { name: 'SECTION_ACCOUNT_INFORMATION_TITLE', message: 'Add account' }
  ],

  constants: [
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{10}$")'
    },
    {
      name: 'INSTITUTION_NUMBER_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[A-z0-9a-z]{8}")'
    },
    {
      name: 'BRANCH_ID_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{5}$")'
    },
    {
      name: 'SWIFT_CODE_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[A-z0-9a-z]{8,11}$")'
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
      name: 'institutionNumber',
      updateVisibility: 'RO',
      section: 'accountInformation',
      validateObj: function(institutionNumber) {
        var regex = /^[A-z0-9a-z]{8}$/;

        if ( institutionNumber === '' ) {
          return this.INSTITUTION_NUMBER_REQUIRED;
        } else if ( ! regex.test(institutionNumber) ) {
          return this.INSTITUTION_NUMBER_INVALID;
        }
      }
    },
    {
      name: 'branchId',
      section: 'accountInformation',
      updateVisibility: 'RO',
      validateObj: function(branchId) {
        var regex = /^[0-9]{5}$/;

        if ( branchId === '' ) {
          return this.BRANCH_ID_REQUIRED;
        } else if ( ! regex.test(branchId) ) {
          return this.BRANCH_ID_INVALID;
        }
      }
    },
    {
      name: 'accountNumber',
      updateVisibility: 'RO',
      view: {
        class: 'foam.u2.view.StringView'
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
      updateVisibility: 'RO',
      section: 'accountInformation',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          placeholder: X.data.PLEASE_SELECT,
          choices: [
            ['c', X.data.CURRENT],
            ['p', X.data.SAVINGS]
          ]
        };
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
      label: 'Account holder',
      updateVisibility: 'RO',
      section: 'accountInformation',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          placeholder: X.data.PLEASE_SELECT,
          choices: [
            ['1', X.data.HOLDER1],
            ['2', X.data.HOLDER2]
          ]
        };
      },
      validateObj: function(accountOwnerType) {
        if ( accountOwnerType === '' || accountOwnerType === undefined ) {
          return this.ACCOUNT_HOLDER_REQUIRED;
        }
      }
    },
    {
      name: 'iban',
      label: 'International Bank Account Number (IBAN)',
      required: true,
      section: 'accountInformation',
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
        validateInstitutionNumber();
        validateBranchId();
        validateAccountNumber();
        validateSwiftCodeAndIban();
        if ( getOwner() == 0 ) {
          setOwner(((foam.nanos.auth.Subject) x.get("subject")).getUser().getId());
        }
      `
    },
    {
      name: 'validateInstitutionNumber',
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        String institutionNumber = this.getInstitutionNumber();

        if ( SafetyUtil.isEmpty(institutionNumber) ) {
          throw new IllegalStateException(this.INSTITUTION_NUMBER_REQUIRED);
        }

        if ( ! INSTITUTION_NUMBER_PATTERN.matcher(institutionNumber).matches() ) {
          throw new IllegalStateException(this.INSTITUTION_NUMBER_INVALID);
        }
      `
    },
    {
      name: 'validateBranchId',
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        String branchId = this.getBranchId();

        if ( SafetyUtil.isEmpty(branchId) ) {
          throw new IllegalStateException(this.BRANCH_ID_REQUIRED);
        }
        if ( ! BRANCH_ID_PATTERN.matcher(branchId).matches() ) {
          throw new IllegalStateException(this.BRANCH_ID_INVALID);
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
    },
    {
      name: 'validateSwiftCodeAndIban',
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        String swiftCode = this.getSwiftCode();
        String iban = this.getIban();

        if ( SafetyUtil.isEmpty(swiftCode) && SafetyUtil.isEmpty(iban) ) {
          throw new IllegalStateException(this.SWIFT_CODE_OR_IBAN_REQUIRED);
        }
        if ( ! SafetyUtil.isEmpty(swiftCode) && ! SWIFT_CODE_PATTERN.matcher(swiftCode).matches() ) {
          throw new IllegalStateException(this.SWIFT_CODE_INVALID);
        }
      `
    }
 ]
});
