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

  mixins: [ 'net.nanopay.bank.BankAccountValidationMixin' ],

  documentation: 'Portugal bank account information.',

  javaImports: [
    'foam.core.ValidationException',
    'foam.util.SafetyUtil',
    'java.util.Arrays'
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
      value: /^\d{11,13}$/
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
    },
    {
      class: 'String',
      name: 'checkDigitNumber',
      javaFactory: `
        if ( getAccountNumber().length() == 13 ) return getAccountNumber();

        if ( getInstitutionNumber() == "" || getBranchId() == "" ) return getAccountNumber() + "00";

        String accNumber = getAccountNumber().substring(0, 11);
        int[] factorList = new int[] { 73, 17, 89, 38, 62, 45, 53, 15, 50, 5, 49, 34, 81, 76, 27, 90, 9, 30, 3 };
        String bankDataConcat = getInstitutionNumber().concat(getBranchId()).concat(accNumber);
        int[] bankDataArr = Arrays.stream(bankDataConcat.split("")).mapToInt(Integer::parseInt).toArray();
        int sum = 0;
        for ( int i = 0; i < factorList.length; i++ ) {
          sum += factorList[i] * bankDataArr[i];
        }
        int temp = sum/97;
        int checkDigit = 98 - ( sum - temp * 97 );
        return accNumber.concat(Integer.toString(checkDigit));
      `
    }
  ]
});
