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
  package: 'net.nanopay.bank.ruler',
  name: 'BankInfoToIbanAndSwiftCodeTranslation',

  documentation: 'Convert domestic bank info to Iban and SWIFT/BIC code.',

  implements: [ 'foam.nanos.ruler.RuleAction' ],

  javaImports: [
    'foam.core.ValidationException',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountValidationService',
    'java.util.*'
  ],

  messages: [
    { name: 'BANK_ACCOUNT_VALIDATION_FAILED', message: 'Bank Account Validation Failed' }
  ],

  properties: [
    {
      class: 'List',
      name: 'allowedCodes',
      javaFactory: `
        ArrayList arr = new ArrayList();
        arr.add("02ba");
        return arr;
      `,
      documentation: `the codes returned from services such as Accuity with status other than PASSED that
        pass bank validaiton despite the status`,
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        var account = (BankAccount) obj;
        var bankAccountValidationService = (BankAccountValidationService) x.get("bankAccountValidationService");
        try {
          var nationalId = account.getRoutingCode_();
          if ( SafetyUtil.isEmpty(nationalId) ) {
            nationalId = account.getSwiftCode();
          }

          var ret = bankAccountValidationService.convertToIbanAndSwiftCode(x,
            account.getCountry(), nationalId, account.getCheckDigitNumber(), getAllowedCodes());
          account.setIban(ret[0]);
          account.setSwiftCode(ret[1]);
        } catch ( RuntimeException e ) {
          throw new ValidationException(BANK_ACCOUNT_VALIDATION_FAILED, e);
        }
      `
    }
  ]
});
