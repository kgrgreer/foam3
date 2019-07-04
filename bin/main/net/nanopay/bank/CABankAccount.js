foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'CABankAccount',
  extends: 'net.nanopay.bank.BankAccount',

  javaImports: [
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution'
  ],

  documentation: 'Canadian Bank account information.',

  constants: [
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{5,12}$")'
    },
    {
      name: 'BRANCH_ID_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{5}$")'
    },
    {
      name: 'INSTITUTION_NUMBER_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{3}$")'
    }
  ],

  properties: [
    {
      name: 'branch',
      label: 'Transit No.'
    },
    {
      name: 'branchId',
      label: 'Transit No.',
      visibility: 'FINAL',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '12345',
        maxLength: 5,
        onKey: true
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        return /^\d+$/.test(n) ? n : o;
      },
      validateObj: function(branchId, branch) {
        if ( branch ) {
          return;
        }
        if ( branchId === '' ) {
          return 'Transit number required';
        } else if ( ! /^\d+$/.test(branchId) ) {
          return 'Transit number must contain only digits.';
        } else if ( branchId.length !== 5 ) {
          return 'Transit number must be 5 digits.';
        }
      }
    },
    {
      documentation: 'Provides backward compatibilty for mobile call flow.  BankAccountInstitutionDAO will lookup the institutionNumber and set the institution property.',
      class: 'String',
      name: 'institutionNumber',
      label: 'Inst. No.',
      storageTransient: true,
      hidden: true,
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '123',
        maxLength: 3,
        onKey: true
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      validateObj: function(institutionNumber, institution) {
        if ( institution ) {
          return;
        }
        if ( institutionNumber === '' ) {
          return 'Institution number required';
        } else if ( ! RegExp('^[0-9]{3}$').test(institutionNumber) ) {
          return 'Invalid institution number.';
        }
      }
    },
    {
      name: 'accountNumber',
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{5,12}$/;

        if ( accountNumber === '' ) {
          return 'Please enter an account number.';
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Account number must be between 5 and 12 digits long.';
        }
      }
    },
    {
      name: 'country',
      value: 'CA'
    },
    {
      name: 'flagImage',
      value: 'images/flags/cad.png'
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
        validateInstitutionNumber(x);
        validateBranchId(x);
      `
    },
    {
      name: 'validateAccountNumber',
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
      String accountNumber = this.getAccountNumber();

      if ( SafetyUtil.isEmpty(accountNumber) ) {
        throw new IllegalStateException("Please enter an account number.");
      }
      if ( ! ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches() ) {
        throw new IllegalStateException("Account number must be between 5 and 12 digits long.");
      }
      `
    },
    {
      name: 'validateInstitutionNumber',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
      Branch branch = this.findBranch(x);
      if ( branch != null &&
          branch.getInstitution() > 0 ) {
        return;
      }

      Institution institution = this.findInstitution(x);

      // no validation when the institution is attached.
      if ( institution != null ) {
        return;
      }

      // when the institutionNumber is provided and not the institution
      String institutionNumber = this.getInstitutionNumber();
      if ( SafetyUtil.isEmpty(institutionNumber) ) {
        throw new IllegalStateException("Please enter an institution number.");
      }
      if ( ! INSTITUTION_NUMBER_PATTERN.matcher(institutionNumber).matches() ) {
        throw new IllegalStateException("Please enter a valid institution number.");
      }
      `
    },
    {
      name: 'validateBranchId',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
      Branch branch = this.findBranch(x);

      // no validation when the branch is attached.
      if (branch != null) {
        return;
      }
      // when the branchId is provided and not the branch
      String branchId = this.getBranchId();
      if ( SafetyUtil.isEmpty(branchId) ) {
        throw new IllegalStateException("Please enter a transit number.");
      }
      if ( ! BRANCH_ID_PATTERN.matcher(branchId).matches() ) {
        throw new IllegalStateException("Transit number must be 5 digits long.");
      }
      `
    }
  ]
});
