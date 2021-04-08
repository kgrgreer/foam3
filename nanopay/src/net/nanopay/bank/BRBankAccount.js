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
  label: 'Brazil',
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
    'foam.nanos.iban.IBANInfo',
    'foam.nanos.iban.ValidationIBAN',
    'foam.util.SafetyUtil',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.fx.afex.IsIbanResponse',
    'java.util.regex.Pattern',
    'foam.core.ValidationException'
  ],

  messages: [
    { name: 'ACCOUNT_NUMBER_INVALID', message: 'Account number must be between 3 and 12 digits long' },
    { name: 'ACCOUNT_NUMBER_REQUIRED', message: 'Account number required' },
    { name: 'ACCOUNT_TYPE_REQUIRED', message: 'Account type required' },
    { name: 'ACCOUNT_HOLDER_REQUIRED', message: 'Account holder required' },
    { name: 'BANK_ADDED', message: 'Bank Account successfully added' },
    { name: 'INSTITUTION_NUMBER_INVALID', message: 'Institution must be between 3 and 8 digits long' },
    { name: 'INSTITUTION_NUMBER_REQUIRED', message: 'Institution required' },
    { name: 'BRANCH_ID_INVALID', message: 'Branch must be between 1 and 6 digits long' },
    { name: 'BRANCH_ID_REQUIRED', message: 'Branch required' },
    { name: 'HOLDER1', message: 'Individual' },
    { name: 'HOLDER2', message: 'Joint' },
    { name: 'CURRENT', message: 'Checking' },
    { name: 'SAVINGS', message: 'Savings' },
    { name: 'PLEASE_SELECT', message: 'Please select' }
  ],

  constants: [
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      factory: function() { return /^[0-9]{3,10}$/; }
    },
    {
      name: 'INSTITUTION_NUMBER_PATTERN',
      type: 'Regex',
      factory: function() { return /^[0-9]{3,8}$/; }
    },
    {
      name: 'BRANCH_ID_PATTERN',
      type: 'Regex',
      factory: function() { return /^[0-9]{1,6}$/; }
    }
  ],

  sections: [
    {
      name: 'clientAccountInformation',
      title: function() {
        return this.clientAccountInformationTitle;
      },
      properties: [
        {
          name: 'denomination',
          order: 10,
          gridColumns: 12
        },
        {
          name: 'name',
          order: 20,
          gridColumns: 12
        },
        {
          name: 'flagImage',
          order: 30,
          gridColumns: 12
        },
        {
          name: 'country',
          order: 40,
          gridColumns: 12
        },
        {
          name: 'branchId',
          order: 50,
          gridColumns: 12
        },
        {
          name: 'institutionNumber',
          order: 60,
          gridColumns: 12
        },
        {
          name: 'accountNumber',
          order: 70,
          gridColumns: 12
        },
        {
          name: 'accountType',
          order: 80,
          gridColumns: 12
        },
        {
          name: 'accountOwnerType',
          order: 90,
          gridColumns: 12
        }
      ],
      order: 110
    },
  ],

  properties: [
    {
      name: 'denomination',
      readPermissionRequired: true,
      value: 'BRL',
      order: 1
    },
    {
      name: 'name',
      order: 2
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
        if ( institutionNumber === '' ) {
          return this.INSTITUTION_NUMBER_REQUIRED;
        } else if ( ! this.INSTITUTION_NUMBER_PATTERN.test(institutionNumber) ) {
          return this.INSTITUTION_NUMBER_INVALID;
        }
      }
    },
    {
      name: 'branchId',
      section: 'accountInformation',
      updateVisibility: 'RO',
      validateObj: function(branchId) {
        if ( branchId === '' ) {
          return this.BRANCH_ID_REQUIRED;
        } else if ( ! this.BRANCH_ID_PATTERN.test(branchId) ) {
          return this.BRANCH_ID_INVALID;
        }
      }
    },
    {
      name: 'accountNumber',
      section: 'accountInformation',
      updateVisibility: 'RO',
      preSet: function(o, n) {
        return /^[\d\w]*$/.test(n) ? n : o;
      },
      tableCellFormatter: function(str, obj) {
        if ( ! str ) return;
        var displayAccountNumber = obj.mask(str);
        this.start()
          .add(displayAccountNumber);
        this.tooltip = displayAccountNumber;
      },
      validateObj: function(accountNumber) {
        if ( accountNumber === '' ) {
          return this.ACCOUNT_NUMBER_REQUIRED;
        } else if ( ! this.ACCOUNT_NUMBER_PATTERN.test(accountNumber) ) {
          return this.ACCOUNT_NUMBER_INVALID;
        }
      }
    },
    {
      class: 'String',
      name: 'accountType',
      updateVisibility: 'RO',
      section: 'accountInformation',
      order: 60,
      gridColumns: 6,
      factory: function() {
        return this.CURRENT;
      },
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
      order: 20,
      gridColumns: 6,
      factory: function() {
        return this.HOLDER1;
      },
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
      name: 'desc',
      visibility: 'HIDDEN'
    },
    {
      name: 'type',
      visibility: 'HIDDEN'
    },
    {
      name: 'swiftCode',
      visibility: 'HIDDEN',
      validateObj: function(swiftCode) {
      }
    },
    {
      name: 'iban',
      visibility: 'HIDDEN',
      validateObj: function(iban) {},
      javaPostSet: `
        ValidationIBAN vban = new ValidationIBAN(getX());
        IBANInfo info = vban.parse(val);
        if ( info != null ) {
          setAccountNumber(info.getAccountNumber());
          setBranchId(info.getBranch());
          setInstitutionNumber(info.getBankCode());
          setAccountType(info.getAccountType());
          setAccountOwnerType(info.getOwnerAccountNumber());
        }
      `
    },
    {
      name: 'bankRoutingCode',
      javaPostSet: `
        if ( val != null && INSTITUTION_NUMBER_PATTERN.matcher(val).matches() ) {
          clearInstitution();
          setInstitutionNumber(val);
        }
      `
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
      javaThrows: ['ValidationException'],
      javaCode: `
        super.validate(x);

        validateAccountNumber();

        if ( SafetyUtil.isEmpty(getSwiftCode()) ) {
          validateInstitutionNumber();
          validateBranchId();
          if ( SafetyUtil.isEmpty(this.getAccountType()) ) {
            throw new ValidationException(this.ACCOUNT_TYPE_REQUIRED);
          }
          if ( SafetyUtil.isEmpty(this.getAccountOwnerType()) ) {
            throw new ValidationException(this.ACCOUNT_HOLDER_REQUIRED);
          }
        }
      `
    },
    {
      name: 'validateInstitutionNumber',
      type: 'Void',
      javaThrows: ['ValidationException'],
      javaCode: `
        String institutionNumber = this.getInstitutionNumber();

        if ( SafetyUtil.isEmpty(institutionNumber) ) {
          throw new ValidationException(this.INSTITUTION_NUMBER_REQUIRED);
        }

        if ( ! INSTITUTION_NUMBER_PATTERN.matcher(institutionNumber).matches() ) {
          throw new ValidationException(this.INSTITUTION_NUMBER_INVALID);
        }
      `
    },
    {
      name: 'validateBranchId',
      type: 'Void',
      javaThrows: ['ValidationException'],
      javaCode: `
        String branchId = this.getBranchId();

        if ( SafetyUtil.isEmpty(branchId) ) {
          throw new ValidationException(this.BRANCH_ID_REQUIRED);
        }
        if ( ! BRANCH_ID_PATTERN.matcher(branchId).matches() ) {
          throw new ValidationException(this.BRANCH_ID_INVALID);
        }
      `
    },
    {
      name: 'validateAccountNumber',
      type: 'Void',
      javaThrows: ['ValidationException'],
      javaCode: `
        String accountNumber = this.getAccountNumber();

        if ( SafetyUtil.isEmpty(accountNumber) ) {
          throw new ValidationException(this.ACCOUNT_NUMBER_REQUIRED);
        }
        if ( ! ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches() ) {
          throw new ValidationException(this.ACCOUNT_NUMBER_INVALID);
        }
      `
    },
    {
      /* temporary swift not used on BR Bank Account*/
      name: 'validateSwiftCode',
      type: 'Void',
      javaThrows: ['ValidationException'],
      javaCode: `
        String swiftCode = this.getSwiftCode();

        if ( SafetyUtil.isEmpty(swiftCode) ) {
          throw new ValidationException(this.SWIFT_CODE_REQUIRED);
        }
        if ( ! SWIFT_CODE_PATTERN.matcher(swiftCode).matches() ) {
          throw new ValidationException(this.SWIFT_CODE_INVALID);
        }
      `
    }
 ]
});
