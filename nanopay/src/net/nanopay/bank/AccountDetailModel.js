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
  name: 'AccountDetailModel',

  javaImports: [
    'foam.nanos.iban.ValidationIBAN',
    'foam.nanos.iban.IBANInfo',
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution'
  ],

  documentation: 'Canadian Bank account information.',

  messages: [
    { name: 'ACCOUNT_NUMBER', message: 'AccountNumber' },
    { name: 'IBAN', message: 'Iban' },
    { name: 'INSTITUTION_NUMBER', message: 'InstitutionNumber' },
    { name: 'BRANCH_ID', message: 'BranchId' },
    { name: 'SWIFT_CODE', message: 'SwiftCode' }
  ],

  properties: [
    {
      class: 'String',
      name: 'accountNumber'
    },
    {
      class: 'String',
      name: 'iban'
    },
    {
      class: 'String',
      name: 'institutionNumber'
    },
    {
      class: 'String',
      name: 'branchId'
    },
    {
      class: 'String',
      name: 'swiftCode'
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.addClass()
      .start()
        .start()
          .addClass('bold-label')
          .add(this.PAYER_LABEL)
        .end()
        .start()
          .addClass('bold-label')
          .add(this.accountNumber)
        .end()
      .end()
    }
  ]
});
