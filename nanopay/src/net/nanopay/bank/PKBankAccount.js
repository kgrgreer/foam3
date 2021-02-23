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
  name: 'PKBankAccount',
  label: 'Pakistan',
  extends: 'net.nanopay.bank.BankAccount',

    javaImports: [
      'foam.util.SafetyUtil',
      'java.util.regex.Pattern',
      'net.nanopay.model.Branch',
      'foam.dao.DAO',
      'static foam.mlang.MLang.EQ',
      'net.nanopay.payment.Institution'
    ],

    documentation: 'Pakistan Bank account information.',

    constants: [
      {
        name: 'IBAN_PATTERN',
        type: 'Regex',
        javaValue: 'Pattern.compile("^[A-Z]{2}[0-9]{2}[0-9a-zA-Z]{4}[0-9]{16}$")'
      },
      {
        name: 'SWIFT_CODE_PATTERN',
        type: 'Regex',
        javaValue: 'Pattern.compile("^[0-9a-zA-Z]{4}$")'
      },
      {
        name: 'ACCOUNT_NUMBER_PATTERN',
        type: 'Regex',
        javaValue: 'Pattern.compile("^[0-9]{16}$")'
      },
    ],

    properties: [
      {
        name: 'country',
        value: 'PK',
        visibility: 'RO'
      },
      {
        name: 'flagImage',
        value: 'images/flags/unknown.png',
        visibility: 'RO'
      },
      {
        name: 'denomination',
        value: 'PKR'
      },
      {
        name: 'institutionNumber',
        hidden: true
      },
      {
        name: 'branchId',
        hidden: true
      },
      {
        name: 'accountNumber',
        label: 'International Bank Account No.',
        tableCellFormatter: function(str) {
          this.start()
            .add(str.substring(0, 4) + ' ' + str.substring(4, 8) + ' **** '.repeat(3) + str.substring(str.length - 4, str.length));
        },
        adapt: function(_, v) {
            return v.replace(/\s/g, '').toUpperCase();
        },
      },
    ],

    methods: [
      // calculate Pakistan IBAN from swift code and account number
      // see https://www.ibantest.com/en/how-is-the-iban-check-digit-calculated for calculation
      // see SO/IEC 7064:2003 standard for checksum generation algorithm
       async function calculateIban() {
          if ( this.institution == undefined || this.institution == '' || this.accountNumber == undefined || this.accountNumber == '' ) {
            return '';
          }
          var bank = await this.institutionDAO.find(this.institution);
          if ( bank == null ) {
            return '';
          }
          var swiftCode = bank.swiftCode.substring(0,4);
          // calculate checksum: replace any letters in national bank code with digits: 'A' is 10, 'B' is 11, ...
          var bankCode = swiftCode.replace(/./g, function(c) {
            var a = 'A'.charCodeAt(0);
            var z = 'Z'.charCodeAt(0);
            var code = c.charCodeAt(0);
            return (a <= code && code <= z) ? code - a + 10 : parseInt(c);
          });
          // calculate checksum: combine national bank code, account number, and digits representation of "PK00" ("252000"), mod 97, and the result is substracted from 98
          var calcChecksum = function(divident) {
            while ( divident.length > 10 ) {
                var part = divident.substring(0, 10);
                divident = (part % 97) +  divident.substring(10);
            }
            return 98 - divident % 97;
          };
          var checksum = calcChecksum(bankCode + this.accountNumber + '252000');
          // generate IBAN
          return 'PK' + checksum + swiftCode + this.accountNumber;
      },
      {
        name: 'validate',
        args: [
          {
            name: 'x', type: 'Context'
          }
        ],
        type: 'Void',
        javaThrows: ['IllegalStateException'],
        javaCode: `
          super.validate(x);
          validateAccountNumber();
          validateSwiftCode();
          validateNationalIban();
        `
      },
      {
        name: 'validateNationalIban',
        type: 'Void',
        javaThrows: ['IllegalStateException'],
        javaCode: `
        String iban = this.getAccountNumber();

        // is empty
        if ( SafetyUtil.isEmpty(iban) ) {
          throw new IllegalStateException("Please enter a IBAN.");
        }
        if ( ! IBAN_PATTERN.matcher(iban).matches() ) {
          throw new IllegalStateException("Please enter a valid IBAN.");
        }
        `
      },
      {
        name: 'validateSwiftCode',
        javaThrows: ['IllegalStateException'],
        javaCode: `
        long institutionId = this.getInstitution();
        DAO institutionDAO = (DAO) getX().get("institutionDAO");
        Institution institution = (Institution) institutionDAO.find(EQ(Institution.ID,institutionId));
        String swiftCode = institution.getSwiftCode().substring(0,4);
        // is empty
        if ( SafetyUtil.isEmpty(swiftCode) ) {
          throw new IllegalStateException("Please enter a Swift code.");
        }
        if ( ! SWIFT_CODE_PATTERN.matcher(swiftCode).matches() ) {
          throw new IllegalStateException("Please enter a valid Swift code.");
        }
        `
      },
      {
        name: 'validateAccountNumber',
        type: 'Void',
        javaThrows: ['IllegalStateException'],
        javaCode: `
        String accountNumber = this.getAccountNumber();

        // is empty
        if ( SafetyUtil.isEmpty(accountNumber) ) {
          throw new IllegalStateException("Please enter an account number.");
        }
        if ( ! ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches() ) {
          throw new IllegalStateException("Please enter a valid account number.");
        }
        `
      }
    ]
  });
