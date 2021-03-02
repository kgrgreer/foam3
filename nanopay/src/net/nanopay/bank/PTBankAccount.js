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
  name: 'PTBankAccount',
  label: 'Portugal',
  extends: 'net.nanopay.bank.EUBankAccount',

  documentation: 'Portugal bank account information.',

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  constants: [
    {
      name: 'BRANCH_ID_PATTERN',
      type: 'Regex',
      value: /^\d{4}$/
    },
    {
      name: 'INSTITUTION_NUMBER_PATTERN',
      type: 'Regex',
      value: /^\d{4}$/
    },
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      value: /^\d{11}$/
    },
    {
      name: 'ROUTING_CODE_PATTERN',
      type: 'Regex',
      value: /^(\d{4})(\d{4})$/
    }
  ],

  properties: [
    {
      name: 'country',
      value: 'PT',
      visibility: 'RO'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/portugal.svg',
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
        if ( iban )
          var ibanMsg = this.ValidationIBAN.create({}).validate(iban);

        if ( ! iban || (iban && ibanMsg != 'passed') ) {
          if ( institutionNumber === '' ) {
            return this.INSTITUTION_NUMBER_REQUIRED;
          } else if ( ! this.INSTITUTION_NUMBER_PATTERN.test(institutionNumber) ) {
            return this.INSTITUTION_NUMBER_INVALID;
          }
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
      tableCellFormatter: function(str) {
        if ( ! str ) return;
        var displayAccountNumber = '***' + str.substring(str.length - 3);
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
          } else if ( ! this.ACCOUNT_NUMBER_PATTERN.test(accountNumber) ) {
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
    }
  ],

  methods: [
    {
      name: 'setRoutingCode',
      javaCode: `
        if ( ! SafetyUtil.isEmpty(routingCode) ) {
          try {
            var matcher = ROUTING_CODE_PATTERN.matcher(routingCode);
            if ( matcher.find() ) {
              var institutionNumber = matcher.group(1);
              var branchId = matcher.group(2);

              // Reset institution and branch
              clearInstitution();
              clearBranch();
              setInstitutionNumber(institutionNumber);
              setBranchId(branchId);
              return true;
            }
          } catch ( RuntimeException e ) { /* ignore */ }
        }
        return false;
      `
    },
  ]
});
