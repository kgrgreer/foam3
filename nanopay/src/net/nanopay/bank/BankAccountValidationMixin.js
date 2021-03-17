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
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern'
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        super.validate(x);

        validateAccountNumber();
        validateInstitutionNumber();
        validateBranchId();
      `
    },
    {
      name: 'validateAccountNumber',
      javaCode: `
        var accountNumber = this.getAccountNumber();
        if ( SafetyUtil.isEmpty(accountNumber) ) {
          throw new ValidationException(this.ACCOUNT_NUMBER_REQUIRED);
        }

        try {
          var pattern = (Pattern) getClass().getDeclaredField("ACCOUNT_NUMBER_PATTERN").get(this);
          if ( ! pattern.matcher(accountNumber).matches() ) {
            throw new ValidationException(this.ACCOUNT_NUMBER_INVALID);
          }
        } catch (NoSuchFieldException | IllegalAccessException e) {
          // No accountNumber validation
        }
      `
    },
    {
      name: 'validateInstitutionNumber',
      javaCode: `
        if ( SafetyUtil.isEmpty(getSwiftCode()) ) {
          try {
            var pattern = (Pattern) getClass().getDeclaredField("INSTITUTION_NUMBER_PATTERN").get(this);
            var institutionNumber = this.getInstitutionNumber();
            if ( SafetyUtil.isEmpty(institutionNumber) ) {
              throw new ValidationException(this.INSTITUTION_NUMBER_REQUIRED);
            }
            if ( ! pattern.matcher(institutionNumber).matches() ) {
              throw new ValidationException(this.INSTITUTION_NUMBER_INVALID);
            }
          } catch (NoSuchFieldException | IllegalAccessException e) {
            // No institutionNumber validation
          }
        }
      `
    },
    {
      name: 'validateBranchId',
      javaCode: `
        if ( SafetyUtil.isEmpty(getSwiftCode()) ) {
          try {
            var pattern = (Pattern) getClass().getDeclaredField("BRANCH_ID_PATTERN").get(this);
            var branchId = this.getBranchId();
            if ( SafetyUtil.isEmpty(branchId) ) {
              throw new ValidationException(this.BRANCH_ID_REQUIRED);
            }
            if ( ! pattern.matcher(branchId).matches() ) {
              throw new ValidationException(this.BRANCH_ID_INVALID);
            }
          } catch (NoSuchFieldException | IllegalAccessException e) {
            // No branchId validation
          }
        }
      `
    }
  ]
});
