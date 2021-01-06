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
  name: 'INBankAccount',
  label: 'India',
  extends: 'net.nanopay.bank.BankAccount',

  javaImports: [
    'foam.nanos.iban.IBANInfo',
    'foam.nanos.iban.ValidationIBAN',
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern'
  ],

  imports: [
    'purposeCodeDAO'
  ],

  documentation: 'Indian Bank account information.',

  constants: [
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{8,20}$")'
    }
  ],

  properties: [
    {
      name: 'country',
      value: 'IN',
      visibility: 'RO'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/india.png',
      visibility: 'RO'
    },
    {
      name: 'desc',
    },
    {
      name: 'denomination',
      value: 'INR'
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
      class: 'String',
      name: 'rbiLink',
      label: '',
      value: 'https://www.rbi.org.in/Scripts/IFSCMICRDetails.aspx',
      section: 'accountInformation',
      view: {
        class: 'net.nanopay.sme.ui.Link',
        data: this.value,
        text: 'Search IFSC code here',
        isExternal: false
      },
    },
    {
      class: 'String',
      name: 'ifscCode',
      label: 'IFSC Code',
      updateVisibility: 'RO',
      validationPredicates: [
        {
          args: ['ifscCode'],
          predicateFactory: function(e) {
            return e.REG_EXP(net.nanopay.bank.INBankAccount.IFSC_CODE, /^\w{11}$/);
          },
          errorString: 'IFSC Code must be 11 digits long.'
        },
        {
          args: ['ifscCode'],
          predicateFactory: function(e) {
            return e.REG_EXP(net.nanopay.bank.INBankAccount.IFSC_CODE, /^[A-Za-z]{4}0[A-z0-9a-z]{6}$/);
          },
          errorString: 'IFSC Code must be in the following format four letters, 0, 6 numbers. eg: ABCD0123456.'
        }
      ],
      section: 'accountInformation'
    },
    {
      class: 'String',
      name: 'beneAccountType',
      label: 'Account type',
      section: 'accountInformation',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Please select',
        choices: [
          ['CURRENT', 'Current'],
          ['SAVING', 'Savings']
        ]
      },
      validationPredicates: [
        {
          args: ['beneAccountType'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.bank.INBankAccount.BENE_ACCOUNT_TYPE, '');
          },
          errorString: 'Please select an Account Type.'
        }
      ],
    },
    {
      name: 'accountNumber',
      label: 'Bank Account No.',
      updateVisibility: 'RO',
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
      view: {
        class: 'foam.u2.view.StringView',
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^\w{8,20}$/;

        if ( accountNumber === '' ) {
          return 'Please enter a Bank Account No.';
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Indian Bank Account No must be between 8 and 20 digits.';
        }
      },
    },
    {
      name: 'accountRelationship',
      class: 'Reference',
      of: 'net.nanopay.tx.AccountRelationship',
      label: 'Relationship with the contact',
      visibility: 'HIDDEN'
    },
    {
      name: 'purposeCode',
      class: 'Reference',
      of: 'net.nanopay.tx.PurposeCode',
      label: 'Purpose of Transfer',
      visibility: 'HIDDEN'
    },
    {
      name: 'iban',
      required: false,
      visibility: 'HIDDEN'
    },
    {
      name: 'swiftCode',
      required: false,
      visibility: 'HIDDEN'
    }
  ],

  methods: [
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
