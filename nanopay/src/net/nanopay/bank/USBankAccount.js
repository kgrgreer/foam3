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
  name: 'USBankAccount',
  label: 'United States',
  extends: 'net.nanopay.bank.BankAccount',

  imports: [
    'notify',
    'padCaptureDAO',
    'plaidService',
    'stack',
    'subject'
  ],

  requires: [
    'foam.log.LogLevel'
  ],

  javaImports: [
    'foam.nanos.iban.IBANInfo',
    'foam.nanos.iban.ValidationIBAN',
    'foam.util.SafetyUtil',
    'net.nanopay.model.Branch',
    'java.util.regex.Pattern'
  ],

  documentation: 'US Bank account information.',

  sections: [
    {
      name: 'clientAccountInformation',
      title: function() {
        return this.clientAccountInformationTitle;
      },
      subTitle: function() {
        return ' ';
      },
      properties: [
        {
          name: 'instruction',
          order: 01,
          gridColumns: 12
        },
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
          name: 'branchId',
          order: 60,
          gridColumns: 6
        },
        {
          name: 'accountNumber',
          order: 70,
          gridColumns: 6
        },
        {
          name: 'swiftCode',
          order: 80,
          gridColumns: 12
        },
        {
          name: 'supportingDocuments',
          order: 90,
          gridColumns: 12
        }
      ]
    },
    {
      name: 'pad',
      title: function() {
        return this.plaidResponseItem ?
          this.SECTION_DETAILS_TITLE_PLAID :
          this.SECTION_DETAILS_TITLE_VOID;
      },
      subTitle: function() {
        return this.plaidResponseItem ?
          this.SECTION_DETAILS_SUBTITLE_PLAID :
          this.SECTION_DETAILS_SUBTITLE_VOID;
      },
      isAvailable: function(forContact) {
        return ! forContact;
      }
    }
  ],

  constants: [
    {
      name: 'BRANCH_ID_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{9}$")'
    },
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{6,17}$")'
    },
    {
      name: 'ROUTING_CODE_PATTERN',
      type: 'Regex',
      value: /^[0-9]{9}$/
    }
  ],

  messages: [
    { name: 'DROP_ZONE_TITLE', message: 'DRAG & DROP YOUR VOID CHECK OR STATEMENT HERE' },
    { name: 'ROUTING_NUMBER_REQUIRED', message: 'Routing number required' },
    { name: 'ROUTING_NUMBER_INVALID', message: 'Routing number must be 9 digits long' },
    { name: 'ACCOUNT_NUMBER_REQUIRED', message: 'Account number required' },
    { name: 'ACCOUNT_NUMBER_INVALID', message: 'Account number must be between 6 and 17 digits long' },
    { name: 'IMAGE_REQUIRED', message: 'Please attach a void check or a 3 month bank statement' },
    { name: 'ADD_SUCCESSFUL', message: 'Bank Account successfully added' },
    { name: 'SECTION_DETAILS_TITLE_VOID', message: 'Connect using a void check' },
    { name: 'SECTION_DETAILS_SUBTITLE_VOID', message: 'Connect to your account without signing in to online banking. Please ensure your details are entered properly.' },
    { name: 'SECTION_DETAILS_TITLE_PLAID', message: 'Finish adding your bank account' },
    { name: 'SECTION_DETAILS_SUBTITLE_PLAID', message: 'Please confirm some banking details to securely interact with your account.' },
    { name: 'ACH_ROUTING_NUMBER_INSTRUCTION', message: 'Important to note: Not all ABA routing numbers are ACH routing numbers, it might be different for some banks, best to validate this information with the bank.' }
  ],

  properties: [
    {
      name: 'country',
      value: 'US',
      visibility: 'RO'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/us.png',
      visibility: 'RO'
    },
    {
      name: 'denomination',
      value: 'USD'
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    },
    {
      name: 'instruction',
      class: 'String',
      label: '',
      view: function(_, X) {
        return {
          class: 'foam.u2.dialog.InlineNotificationMessage',
          message: X.data.ACH_ROUTING_NUMBER_INSTRUCTION,
          isWarning: true
        };
      },
      section: 'accountInformation',
      visibility: 'RO',
      transient: true
    },
    {
      name: 'iban',
      visibility: 'HIDDEN',
      required: false,
      validateObj: function(iban) {
      },
      javaGetter: `
        StringBuilder iban = new StringBuilder();
        iban.append(getBranchId());
        iban.append(getAccountNumber());
        return iban.toString();
      `
    },
    {
      name: 'institutionNumber',
      hidden: true
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'voidCheckImage',
      documentation: 'void check image for this bank account',
      visibility: function(forContact) {
        return forContact ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      }
    },
    {
      name: 'branchId',
      label: 'ACH Routing Number',
      section: 'accountInformation',
      updateVisibility: 'RO',
      gridColumns: 6,
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      postSet: function(o, n) {
        this.padCapture.branchId = n;
      },
      validateObj: function(branchId, swiftCode) {
        if ( this.SWIFT_CODE_PATTERN && this.SWIFT_CODE_PATTERN.test(swiftCode) )
          return;

        if ( branchId === '' ) return this.ROUTING_NUMBER_REQUIRED;

        if ( ! this.ROUTING_CODE_PATTERN.test(branchId) ) {
          return this.ROUTING_NUMBER_INVALID;
        }
      }
    },
    {
      name: 'accountNumber',
      label: 'Account Number',
      section: 'accountInformation',
      updateVisibility: 'RO',
      postSet: function(o, n) {
        this.padCapture.accountNumber = n;
      },
      validateObj: function(accountNumber) {
        if ( accountNumber === '' ) return this.ACCOUNT_NUMBER_REQUIRED;

        var accNumberRegex = /^[0-9]{6,17}$/;
        if ( ! accNumberRegex.test(accountNumber) ) {
          return this.ACCOUNT_NUMBER_INVALID;
        }
      },
      gridColumns: 6
    },
    {
      name: 'swiftCode',
      label: 'SWIFT/BIC',
      updateVisibility: 'RO',
      section: 'accountInformation',
      order: 150,
      gridColumns: 6,
      validateObj: function(branchId, swiftCode) {
        if ( this.ROUTING_CODE_PATTERN && this.ROUTING_CODE_PATTERN.test(branchId) )
          return;

        if ( swiftCode === '' ) return this.SWIFT_CODE_REQUIRED;

        if ( ! this.SWIFT_CODE_PATTERN.test(swiftCode) ) {
          return this.SWIFT_CODE_INVALID;
        }
      }
    },
    // {
    //   name: 'institution',
    //   visibility: 'HIDDEN'
    // },
    // {
    //   name: 'institutionNumber',
    //   visibility: 'HIDDEN',
    //   value: 'US0000000'
    // },
    {
      class: 'FObjectProperty',
      name: 'plaidResponseItem',
      storageTransient: true,
      section: 'pad',
      visibility: 'HIDDEN'
    },
    {
      //REVIEW: Set by Plaid, not read
      class: 'String',
      name: 'wireRouting',
      documentation: 'The ACH wire routing number for the account, if available.',
      section: 'accountInformation',
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
        this.start()
          .add(obj.slot((accountNumber) => {
              if ( accountNumber ) {
                return this.E()
                  .start('span').style({ 'font-weight' : '500', 'white-space': 'pre' }).add(` ${obj.cls_.getAxiomByName('accountNumber').label} `).end()
                  .start('span').add(obj.mask(accountNumber)).end();
              }
          }))
        .end();
      }
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'supportingDocuments',
      label: `Please upload either an image of a void check or a bank statement from within
          the past 3 months to verify ownership of this bank account.`,
      section: 'accountInformation',
      documentation: 'Supporting documents to verify bank account',
      validateObj: function(supportingDocuments, plaidResponseItem, forContact) {
        if ( supportingDocuments.length === 0 && ! plaidResponseItem && ! forContact ) {
          return this.IMAGE_REQUIRED;
        }
      },
      visibility: function(forContact) {
        return forContact ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      view: function(_, X) {
        return {
          class: 'foam.nanos.fs.fileDropZone.FileDropZone',
          files$: X.data.supportingDocuments$,
          title: X.data.DROP_ZONE_TITLE,
          supportedFormats: {
            'image/jpg': 'JPG',
            'image/jpeg': 'JPEG',
            'image/png': 'PNG',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
            'application/msword': 'DOC',
            'application/pdf': 'PDF'
          }
        };
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.USPadCapture',
      name: 'padCapture',
      section: 'pad',
      transient: true,
      label: '',
      updateVisibility: 'HIDDEN',
      autoValidate: false,
      factory: function() {
        return net.nanopay.model.USPadCapture.create({
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
              of: 'net.nanopay.model.USPadCapture',
              classIsFinal: true
            },
            {
              // displays us bank account capabilities
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
        if ( val != null && BRANCH_ID_PATTERN.matcher(val).matches()
          && ( SafetyUtil.isEmpty(getBranchId())
          || ! BRANCH_ID_PATTERN.matcher(getBranchId()).matches() )) {
          setBranchId(val);
        }
      `
    },
    // NOTE: branch property needs to be after bankRoutingCode to prevent it
    // from being cleared when bankRoutingCode is set.
    {
      name: 'branch',
      //visibility: 'HIDDEN'
      updateVisibility: 'RO',
      label: 'Routing No.',
    }
  ],

  methods: [
    async function save(stack_back) {
      try {
        await this.padCaptureDAO.put(this.padCapture);
      } catch (e) {
        this.notify(e, '', this.LogLevel.ERROR, true);
        return;
      }
      if ( this.plaidResponseItem ) {
        let responseItem = this.plaidResponseItem;
        this.plaidResponseItem = null; // avoids stack call recursion.
        try {
          let response = await this.plaidService.saveAccount(null, responseItem);
          if ( response.plaidError ) {
            let message = error.display_message !== '' ? error.display_message : error.error_code;
            this.notify(message, '', this.LogLevel.ERROR, true);
          }
          if ( this.stack && stack_back ) this.stack.back();
        } catch (e) {
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        }
      } else {
        try {
          this.address = this.padCapture.address;
          await this.subject.user.accounts.put(this);
          if ( this.stack ) this.stack.back();
          this.notify(this.ADD_SUCCESSFUL, '', this.LogLevel.INFO, true);
        } catch (error) {
          this.notify(error.message, '', this.LogLevel.ERROR, true);
        }
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
        String accountNumber = this.getAccountNumber();

        if ( SafetyUtil.isEmpty(accountNumber) ) {
          throw new IllegalStateException(this.ACCOUNT_NUMBER_REQUIRED);
        }
        if ( ! ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches() ) {
          throw new IllegalStateException(this.ACCOUNT_NUMBER_INVALID);
        }

        if ( SafetyUtil.isEmpty(getSwiftCode()) ) {
          String branchId = this.getBranchId();
          if ( SafetyUtil.isEmpty(branchId) ) {
            throw new IllegalStateException(this.ROUTING_NUMBER_REQUIRED);
          }
          if ( ! BRANCH_ID_PATTERN.matcher(branchId).matches() ) {
            throw new IllegalStateException(this.ROUTING_NUMBER_INVALID);
          }
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
        var branchCode = getBranchCode(x);
        return ! branchCode.isBlank() ? branchCode : getBankRoutingCode();
      `
    }
 ]
});
