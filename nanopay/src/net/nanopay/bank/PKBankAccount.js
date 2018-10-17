foam.CLASS({
    package: 'net.nanopay.bank',
    name: 'PKBankAccount',
    extends: 'net.nanopay.bank.BankAccount',
  
    javaImports: [
      'foam.util.SafetyUtil',
      'java.util.regex.Pattern'
    ],
  
    documentation: 'Pakistan Bank account information.',
  
    constants: [
      {
        name: 'IBAN_PATTERN',
        type: 'Pattern',
        value: 'Pattern.compile("^[A-Z]{2}[0-9]{2}[0-9a-zA-Z]{4}[0-9]{16}$")'
      },
      {
        name: 'NATIONAL_BANK_CODE_PATTERN',
        type: 'Pattern',
        value: 'Pattern.compile("^[0-9a-zA-Z]{4}$")'
      },
      {
        name: 'ACCOUNT_NUMBER_PATTERN',
        type: 'Pattern',
        value: 'Pattern.compile("^[0-9]{16}$")'
      }
    ],

    properties: [
      {
        class: 'String',
        name: 'iban',
        label: 'International Bank Account No.',
        tableCellFormatter: function(str) {
          this.start()
            .add(str.substring(0, 4) + ' ' + str.substring(4, 8) + ' **** '.repeat(3) + str.substring(str.length - 4, str.length));
        },
        // factory to calculate Pakistan IBAN from national bank code and account number
        // see https://www.ibantest.com/en/how-is-the-iban-check-digit-calculated for calculation
        // see SO/IEC 7064:2003 standard for checksum generation algorithm
        factory: function() {
          if (this.nationalBankCode == undefined || this.nationalBankCode == "" || this.accountNumber == undefined || this.accountNumber == "") {
              return "";
          }
          // calculate checksum: replace any letters in national bank code with digits: 'A' is 10, 'B' is 11, ...
          var bankCode = this.nationalBankCode.replace(/./g, function(c) {
            var a = "A".charCodeAt(0);
            var z = "Z".charCodeAt(0);
            var code = c.charCodeAt(0);
            return (a <= code && code <= z) ? code - a + 10 : parseInt(c);
          });
          // calculate checksum: combine national bank code, account number, and digits representation of "PK00" ("252000"), mod 97, and the result is substracted from 98
          var calcChecksum = function(divident) {
            while (divident.length > 10) {
                var part = divident.substring(0, 10);
                divident = (part % 97) +  divident.substring(10);          
            }
            return 98 - divident % 97;
          };
          var checksum = calcChecksum(bankCode + this.accountNumber + "252000");
          // generate IBAN
          return "PK" + checksum + this.nationalBankCode + this.accountNumber;
        },
        adapt: function(_, v) {
            return v.replace(/\s/g, '').toUpperCase();
        },
      },
      {
        class: 'String',
        name: 'nationalBankCode',
        label: 'National Bank Code',
        adapt: function(_, v) {
          return v.toUpperCase();
        }
      }
    ],
  
    methods: [
      {
        name: 'validate',
        args: [
          {
            name: 'x', javaType: 'foam.core.X'
          }
        ],
        javaReturns: 'void',
        javaThrows: ['IllegalStateException'],
        javaCode: `
          super.validate(x);
          validateNationalIban();
          validateNationalBankCode();
          validateAccountNumber();
        `
      },
      {
        name: 'validateNationalIban',
        javaReturns: 'void',
        javaThrows: ['IllegalStateException'],
        javaCode: `
        String iban = this.getIban();
  
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
        name: 'validateNationalBankCode',
        javaReturns: 'void',
        javaThrows: ['IllegalStateException'],
        javaCode: `
        String nationalBankCode = this.getNationalBankCode();
  
        // is empty
        if ( SafetyUtil.isEmpty(nationalBankCode) ) {
          throw new IllegalStateException("Please enter a national bank code.");
        }
        if ( ! NATIONAL_BANK_CODE_PATTERN.matcher(nationalBankCode).matches() ) {
          throw new IllegalStateException("Please enter a valid national bank code.");
        }
        `
      },
      {
        name: 'validateAccountNumber',
        javaReturns: 'void',
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
  
