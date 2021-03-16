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
  name: 'CABankAccount',
  label: 'Canada',
  extends: 'net.nanopay.bank.BankAccount',

  imports: [
    'notify',
    'padCaptureDAO',
    'stack',
    'subject'
  ],

  requires: [
    'foam.log.LogLevel'
  ],

  javaImports: [
    'foam.nanos.iban.ValidationIBAN',
    'foam.nanos.iban.IBANInfo',
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
    },
    {
      name: 'ROUTING_CODE_PATTERN',
      type: 'Regex',
      value: /^0(\d{3})(\d{5})$/
    }
  ],

  sections: [
    {
      name: 'clientAccountInformation',
      title: function() {
        return this.clientAccountInformationTitle;
      },
      properties: [
        {
          name: 'denomination',
          order: 10,
          gridColumns: 12
        },
        {
          name: 'name',
          order: 20,
          gridColumns: 12
        },
        {
          name: 'flagImage',
          order: 30,
          gridColumns: 12
        },
        {
          name: 'country',
          order: 40,
          gridColumns: 12
        },
        {
          name: 'voidChequeImage',
          order: 50,
          gridColumns: 12
        },
        {
          name: 'branchId',
          order: 60,
          gridColumns: 4
        },
        {
          name: 'institutionNumber',
          order: 70,
          gridColumns: 3
        },
        {
          name: 'accountNumber',
          order: 80,
          gridColumns: 5
        },
        {
          name: 'swiftCode',
          order: 90,
          gridColumns: 12
        }
      ],
      order: 110
    },
    {
      name: 'pad',
      title: `Connect using a void check`,
      subTitle: `Connect to your account without signing in to online banking.
          Please ensure your details are entered properly.`,
      isAvailable: function(forContact) {
        return ! forContact;
      },
      order: 120
    }
  ],

  messages: [
    { name: 'TRANSIT_NUMBER_REQUIRED', message: 'Transit number required' },
    { name: 'TRANSIT_NUMBER_FORMAT', message: 'Transit number must contain numbers' },
    { name: 'TRANSIT_NUMBER_FIVE', message: 'Transit number must be 5 digits long' },
    { name: 'ACCOUNT_NUMBER_REQUIRED', message: 'Account number required' },
    { name: 'ACCOUNT_NUMBER_INVALID', message: 'Account number must be between 5 and 12 digits long' },
    { name: 'INSTITUTION_NUMBER_REQUIRED', message: 'Institution required' },
    { name: 'INSTITUTION_NUMBER_THREE', message: 'Institution must be 3 digits long' },
    { name: 'ADD_SUCCESSFUL', message: 'Bank Account successfully added' },
    { name: 'REQUIRED', message: 'Required' }
  ],

  properties: [
    {
      name: 'accountNumber',
      label: 'Account',
      updateVisibility: 'RO',
      section: 'accountInformation',
      order: 50,
      gridColumns: 6,
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      },
      postSet: function(o, n) {
        this.padCapture.accountNumber = n;
      },
      validateObj: function(accountNumber) {
        if ( accountNumber === '' ) {
          return this.REQUIRED;
        }
        var accNumberRegex = /^[0-9]{5,12}$/;
        if ( ! accNumberRegex.test(accountNumber) ) {
          return this.ACCOUNT_NUMBER_INVALID;
        }
      },
    },
    {
      name: 'iban',
      visibility: 'HIDDEN',
      required: false,
      validateObj: function(iban) {
      },
      javaGetter: `
        StringBuilder iban = new StringBuilder();
        iban.append(getInstitutionNumber());
        iban.append(getAccountNumber());
        iban.append(getBranchId());
        return iban.toString();
      `
    },
    {
      name: 'country',
      value: 'CA',
      visibility: 'RO'
    },
    {
      name: 'flagImage',
      section: 'accountInformation',
      label: '',
      value: 'images/flags/cad.png',
      visibility: 'RO'
    },
    {
      name: 'institutionNumber',
      label: 'Institution',
      documentation: `Provides backward compatibilty for mobile call flow.
          BankAccountInstitutionDAO will lookup the institutionNumber and set the institution property.`,
      updateVisibility: 'RO',
      createVisibility: 'RW',
      section: 'accountInformation',
      order: 120,
      gridColumns: 6,
      storageTransient: true,
      view: {
        class: 'foam.u2.tag.Input',
        maxLength: 3,
        onKey: true
      },
      validateObj: function(institutionNumber) {
        if ( institutionNumber === '' ) {
          return this.REQUIRED;
        }
        var instNumberRegex = /^[0-9]{3}$/;
        if ( ! instNumberRegex.test(institutionNumber) ) {
          return this.INSTITUTION_NUMBER_THREE;
        }
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      postSet: function(o, n) {
        this.padCapture.institutionNumber = n;
      },
    },
    {
      name: 'branchId',
      type: 'String',
      label: 'Transit',
      section: 'accountInformation',
      order: 130,
      gridColumns: 6,
      updateVisibility: 'RO',
      createVisibility: 'RW',
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        return /^\d+$/.test(n) ? n : o;
      },
      postSet: function(o, n) {
        this.padCapture.branchId = n;
      },
      validateObj: function(branchId, branch) {
        if ( branch ) {
          return;
        }
        if ( branchId === '' ) {
          return this.REQUIRED;
        } else if ( ! /^\d+$/.test(branchId) ) {
          return this.TRANSIT_NUMBER_FORMAT;
        } else if ( branchId.length !== 5 ) {
          return this.TRANSIT_NUMBER_FIVE;
        }
      }
    },
    {
      name: 'swiftCode',
      label: 'SWIFT/BIC',
      updateVisibility: 'RO',
      section: 'accountInformation',
      order: 150,
      gridColumns: 6,
      validateObj: function(swiftCode) {
      }
    },
    {
      name: 'denomination',
      value: 'CAD',
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'summary',
      transient: true,
      documentation: `
        Used to display a lot of information in a visually compact way in table
        views of BankAccounts.
      `,
      tableCellFormatter: function(_, obj) {
        this.start().style({'display': 'flex'})
          .add(obj.slot((accountNumber) => {
              if ( accountNumber ) {
                return this.E()
                  .start('span').style({ 'font-weight' : '500', 'white-space': 'pre' })
                    .add(`${obj.cls_.getAxiomByName('accountNumber').label} `)
                  .end()
                  .start('span').add(`${obj.mask(accountNumber)} |`).end();
              }
          }))
          .add(obj.slot((branch, branchDAO) => {
            return branchDAO.find(branch).then((result) => {
              if ( result ) {
                return this.E()
                  .start('span').style({ 'font-weight': '500', 'white-space': 'pre' })
                    .add(` ${obj.cls_.getAxiomByName('branch').label} `)
                  .end()
                  .start('span').add(`${result.branchId} |`).end();
              }
              return this.E(); // Prevents infinitely trying to recreate it if null/undefined is returned
            });
          }))
          .add(obj.slot((institution, institutionDAO) => {
            return institutionDAO.find(institution).then((result) => {
              if ( result && ! net.nanopay.bank.USBankAccount.isInstance(obj) ) {
                return this.E()
                  .start('span').style({ 'font-weight': '500', 'white-space': 'pre' })
                    .add(` ${obj.cls_.getAxiomByName('institution').label} `)
                  .end()
                  .start('span').add(`${result.name}`).end();
              }
              return this.E(); // Prevents infinitely trying to recreate it if null/undefined is returned
            });
          }))
        .end();
      }
    },
    {
      name: 'voidChequeImage',
      class: 'String',
      label: '',
      value: 'images/Canada-Check3.svg',
      section: 'accountInformation',
      order: 210,
      createVisibility: 'RO',
      updateVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN',
      transient: true,
      view: function(_, X) {
        return {
          class: 'foam.u2.tag.Image',
          displayWidth: '100%'
        };
      },
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.CAPadCapture',
      name: 'padCapture',
      section: 'pad',
      transient: true,
      label: '',
      updateVisibility: 'HIDDEN',
      autoValidate: true,
      factory: function() {
        return net.nanopay.model.CAPadCapture.create({
          country: this.country,
          firstName: this.subject.realUser.firstName,
          lastName: this.subject.realUser.lastName,
          companyName: this.subject.user.organization || this.subject.user.businessName,
          address: this.subject.user.address
        }, this);
      },
      view: function(_, X) {
        return foam.u2.MultiView.create({
          views: [
            {
              class: 'foam.u2.view.FObjectView',
              of: 'net.nanopay.model.CAPadCapture',
              classIsFinal: true
            },
            {
              // displays ca bank account capabilities
              class: 'foam.nanos.crunch.ui.CapableView',
              capableObj: X.data.padCapture
            }
          ]
        }, X);
      }
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
    }
  ],
  methods: [
    async function save(stack_back) {
      try {
        await this.padCaptureDAO.put(this.padCapture);
        this.address = this.padCapture.address;
        await this.subject.user.accounts.put(this);
        if ( this.stack && stack_back ) this.stack.back();
        this.notify(this.ADD_SUCCESSFUL, '', this.LogLevel.INFO, true);
      } catch (error) {
        this.notify(error.message, '', this.LogLevel.ERROR, true);
      }
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
        if ( SafetyUtil.isEmpty(getSwiftCode()) ) {
          validateInstitutionNumber(x);
          validateBranchId(x);
        }
      `
    },
    {
      name: 'validateAccountNumber',
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
      String accountNumber = this.getAccountNumber();

      if ( SafetyUtil.isEmpty(accountNumber) ) {
        throw new IllegalStateException(this.ACCOUNT_NUMBER_REQUIRED);
      }
      if ( ! ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches() ) {
        throw new IllegalStateException(this.ACCOUNT_NUMBER_INVALID);
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
        throw new IllegalStateException(this.INSTITUTION_NUMBER_REQUIRED);
      }
      if ( ! INSTITUTION_NUMBER_PATTERN.matcher(institutionNumber).matches() ) {
        throw new IllegalStateException(this.INSTITUTION_NUMBER_THREE);
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
        throw new IllegalStateException(this.TRANSIT_NUMBER_REQUIRED);
      }
      if ( ! BRANCH_ID_PATTERN.matcher(branchId).matches() ) {
        throw new IllegalStateException(this.TRANSIT_NUMBER_FIVE);
      }
      `
    },
    {
      name: 'getRoutingCode',
      type: 'String',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        // REVIEW: CA routing code = "0" + branch(5 digits) + institution(3 digits)
        var code = new StringBuilder();
        code.append('0')
            .append(getBranchCode(x))
            .append(getBankCode(x));
        return code.length() > 1 ? code.toString() : getBankRoutingCode();
      `
    }
  ]
});
