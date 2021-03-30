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
  name: 'CYBankAccount',
  label: 'Cyprus',
  extends: 'net.nanopay.bank.EUBankAccount',

  mixins: [ 'net.nanopay.bank.BankAccountValidationMixin' ],

  documentation: 'Cyprus bank account information.',

  javaImports: [
    'foam.core.ValidationException',
    'foam.util.SafetyUtil'
  ],

  constants: [
    {
      name: 'INSTITUTION_NUMBER_PATTERN',
      type: 'Regex',
      value: /^\d{3}$/
    },
    {
      name: 'BRANCH_ID_PATTERN',
      type: 'Regex',
      value: /^\d{5}$/
    },
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      value: /^[a-zA-Z0-9]{16}$/
    },
    {
      name: 'ROUTING_CODE_PATTERN',
      type: 'Regex',
      value: /^(\d{3})(\d{5})$/
    }
  ],

  properties: [
    {
      name: 'country',
      value: 'CY',
      visibility: 'RO'
    },
    {
      name: 'denomination',
      section: 'accountInformation',
      gridColumns: 12,
      value: 'EUR',
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/cyprus.svg',
      visibility: 'RO'
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    },
    {
      name: 'bankRoutingCode',
      javaPostSet: `
        if ( ! SafetyUtil.isEmpty(val) ) {
          var matcher = ROUTING_CODE_PATTERN.matcher(val);
          if ( matcher.find() ) {
            var institutionNumber = matcher.group(1);
            var branchId = matcher.group(2);

            // Update institution and branch
            clearInstitution();
            clearBranch();
            setInstitutionNumber(institutionNumber);
            setBranchId(branchId);
          }
        }
      `
    }
  ]
});
