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
  name: 'SwiftBicCodeTranslation',

  documentation: 'Convert SWIFT/BIC code into bank info.',

  implements: [ 'foam.nanos.ruler.RuleAction' ],

  javaImports: [
    'foam.core.ValidationException',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountValidationService'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        BankAccount account = (BankAccount) obj;
        if ( ! SafetyUtil.isEmpty(account.getSwiftCode()) ) {
          var bankAccountValidationService = (BankAccountValidationService) x.get("bankAccountValidationService");
          try {
            var routingCode = bankAccountValidationService.convertToRoutingCode(x,
              account.getCountry(), account.getSwiftCode());

            if ( ! SafetyUtil.isEmpty(routingCode) ) {
              account.setBankRoutingCode(routingCode);
            } else {
              throw new ValidationException(BankAccount.SWIFT_CODE_INVALID);
            }
          } catch ( RuntimeException e ) {
            throw new ValidationException(BankAccount.SWIFT_CODE_INVALID, e);
          }
        }
      `
    }
  ]
});
