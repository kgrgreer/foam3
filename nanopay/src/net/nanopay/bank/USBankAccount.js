foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'USBankAccount',
  extends: 'net.nanopay.bank.BankAccount',

  javaImports: [
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern'
  ],

  documentation: 'US Bank account information.'

});
