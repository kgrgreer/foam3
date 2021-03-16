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
  name: 'ATBankAccount',
  label: 'Austria',
  extends: 'net.nanopay.bank.EUBankAccount',

  documentation: 'Austrian bank account information.',

  javaImports: [
    'foam.core.ValidationException',
    'foam.util.SafetyUtil'
  ],

  constants: [
    {
      name: 'BRANCH_ID_PATTERN',
      type: 'Regex',
      value: /^\d{5}$/
    },
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      value: /^\d{11}$/
    }
  ],

  properties: [
    {
      name: 'country',
      value: 'AT',
      visibility: 'RO'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/austria.svg',
      visibility: 'RO'
    },
    {
      name: 'denomination',
      section: 'accountInformation',
      gridColumns: 12,
      value: 'EUR',
    },
    {
      name: 'institutionNumber',
      updateVisibility: 'RO',
      validateObj: function(institutionNumber, iban) {
        var regex = /^[A-z0-9a-z]{5}$/;

        if ( iban )
          var ibanMsg = this.ValidationIBAN.create({}).validate(iban);

        if ( iban === '' || (iban && ibanMsg != 'passed') ) {
          if ( institutionNumber === '' ) {
            return this.INSTITUTION_NUMBER_REQUIRED;
          } else if ( ! regex.test(institutionNumber) ) {
            return this.INSTITUTION_NUMBER_INVALID;
          }
        }
      }
    },
    {
      name: 'accountNumber',
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
      validateObj: function(accountNumber, iban) {
        if ( iban )
          var ibanMsg = this.ValidationIBAN.create({}).validate(iban);

        if ( ! iban || (iban && ibanMsg != 'passed') ) {
          if ( accountNumber === '' ) {
            return this.ACCOUNT_NUMBER_REQUIRED;
          } else if ( ! ACCOUNT_NUMBER_PATTERN.test(accountNumber) ) {
            return this.ACCOUNT_NUMBER_INVALID;
          }
        }
      }
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    },
    {
      name: 'branchId',
      visibility: 'HIDDEN'
    },
    {
      name: 'bankRoutingCode',
      javaPostSet: `
        if ( val != null && BRANCH_ID_PATTERN.matcher(val).matches() ) {
          clearBranch();
          setBranchId(val);
        }
      `
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        super.validate(x);

        var accountNumber = this.getAccountNumber();
        if ( SafetyUtil.isEmpty(accountNumber) ) {
          throw new ValidationException(this.ACCOUNT_NUMBER_REQUIRED);
        }
        if ( ! ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches() ) {
          throw new ValidationException(this.ACCOUNT_NUMBER_INVALID);
        }

        if ( SafetyUtil.isEmpty(getSwiftCode()) ) {
          var branchId = this.getBranchId();
          if ( SafetyUtil.isEmpty(branchId) ) {
            throw new ValidationException(this.BRANCH_ID_REQUIRED);
          }
          if ( ! BRANCH_ID_PATTERN.matcher(branchId).matches() ) {
            throw new ValidationException(this.BRANCH_ID_INVALID);
          }
        }
      `
    }
  ]
});
