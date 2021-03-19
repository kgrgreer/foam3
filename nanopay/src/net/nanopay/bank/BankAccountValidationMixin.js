/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  name: 'BankAccountValidationMixin',

  documentation: 'Bank account validation mixin to validate accountNumber, institutionNumber and branchId.',

  javaImports: [
    'foam.core.ValidationException',
    'foam.nanos.iban.ValidationIBAN',
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern'
  ],

  properties: [
    {
      name: 'institutionNumber',
      section: 'accountInformation',
      createVisibility: function() {
        return foam.u2.DisplayMode[this.INSTITUTION_NUMBER_PATTERN ? 'RW' : 'HIDDEN'];
      },
      updateVisibility: 'RO',
      validateObj: function(institutionNumber, iban, swiftCode) {
        if ( ! this.INSTITUTION_NUMBER_PATTERN ) {
          return;
        }

        if ( ! this.checkIban(iban) && ! this.checkSwiftCode(swiftCode) ) {
          if (  institutionNumber === '' ) {
            return this.INSTITUTION_NUMBER_REQUIRED;
          } else if ( ! this.INSTITUTION_NUMBER_PATTERN.test(institutionNumber) ) {
            return this.INSTITUTION_NUMBER_INVALID;
          }
        }
      }
    },
    {
      name: 'branchId',
      section: 'accountInformation',
      createVisibility: function() {
        return foam.u2.DisplayMode[this.BRANCH_ID_PATTERN ? 'RW' : 'HIDDEN'];
      },
      updateVisibility: 'RO',
      validateObj: function(branchId, iban, swiftCode) {
        if ( ! this.BRANCH_ID_PATTERN ) {
          return;
        }

        if ( ! this.checkIban(iban) && ! this.checkSwiftCode(swiftCode) ) {
          if ( branchId === '' ) {
            return this.BRANCH_ID_REQUIRED;
          } else if ( ! this.BRANCH_ID_PATTERN.test(branchId) ) {
            return this.BRANCH_ID_INVALID;
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
        if ( ! this.ACCOUNT_NUMBER_PATTERN ) {
          return;
        }

        if ( ! this.checkIban(iban) ) {
          if ( accountNumber === '' ) {
            return this.ACCOUNT_NUMBER_REQUIRED;
          } else if ( ! this.ACCOUNT_NUMBER_PATTERN.test(accountNumber) ) {
            return this.ACCOUNT_NUMBER_INVALID;
          }
        }
      }
    },
  ],

  methods: [
    {
      flags: ['js'],
      name: 'checkIban',
      code: function(iban) {
        return iban && this.ValidationIBAN.create().validate(iban) === 'passed';
      }
    },
    {
      flags: ['js'],
      name: 'checkSwiftCode',
      code: function(swiftCode) {
        return swiftCode && this.SWIFT_CODE_PATTERN.test(swiftCode);
      }
    },
    {
      name: 'validate',
      javaCode: `
        super.validate(x);

        if ( SafetyUtil.isEmpty(getIban()) ) {
          validateAccountNumber();
          validateInstitutionNumber();
          validateBranchId();
        } else {
          validateIban(x);
        }
      `
    },
    {
      name: 'validateIban',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        if ( ! getCountry().equals(getIban().substring(0, 2)) ) {
          throw new foam.core.ValidationException(IBAN_COUNTRY_MISMATCHED);
        }

        var vban = new ValidationIBAN(x);
        vban.validate(getIban());
      `
    },
    {
      name: 'validateAccountNumber',
      javaCode: `
        var accountNumber = getAccountNumber();
        if ( SafetyUtil.isEmpty(accountNumber) ) {
          throw new ValidationException(ACCOUNT_NUMBER_REQUIRED);
        }

        var pattern = getPattern("ACCOUNT_NUMBER_PATTERN");
        if ( pattern != null && ! pattern.matcher(accountNumber).matches() ) {
          throw new ValidationException(ACCOUNT_NUMBER_INVALID);
        }
      `
    },
    {
      name: 'validateInstitutionNumber',
      javaCode: `
        if ( SafetyUtil.isEmpty(getSwiftCode()) ) {
          var pattern = getPattern("INSTITUTION_NUMBER_PATTERN");
          if ( pattern != null ) {
            var institutionNumber = getInstitutionNumber();
            if ( SafetyUtil.isEmpty(institutionNumber) ) {
              throw new ValidationException(INSTITUTION_NUMBER_REQUIRED);
            }
            if ( ! pattern.matcher(institutionNumber).matches() ) {
              throw new ValidationException(INSTITUTION_NUMBER_INVALID);
            }
          }
        }
      `
    },
    {
      name: 'validateBranchId',
      javaCode: `
        if ( SafetyUtil.isEmpty(getSwiftCode()) ) {
          var pattern = getPattern("BRANCH_ID_PATTERN");
          if ( pattern != null ) {
            var branchId = getBranchId();
            if ( SafetyUtil.isEmpty(branchId) ) {
              throw new ValidationException(BRANCH_ID_REQUIRED);
            }
            if ( ! pattern.matcher(branchId).matches() ) {
              throw new ValidationException(BRANCH_ID_INVALID);
            }
          }
        }
      `
    },
    {
      name: 'getPattern',
      type: 'Regex',
      args: [
        { name: 'name', type: 'String' }
      ],
      javaCode: `
        try {
          var field = getClass().getDeclaredField(name);
          return (Pattern) field.get(this);
        } catch (NoSuchFieldException | IllegalAccessException e) {
          // Pattern not found
          return null;
        }
      `
    }
  ]
});
