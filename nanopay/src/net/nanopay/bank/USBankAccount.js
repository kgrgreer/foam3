foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'USBankAccount',
  label: 'US Bank Account',
  extends: 'net.nanopay.bank.BankAccount',

  imports: [
    'notify',
    'padCaptureDAO',
    'plaidService',
    'stack',
    'user'
  ],

  javaImports: [
    'foam.util.SafetyUtil',
    'net.nanopay.model.Branch',
    'java.util.regex.Pattern'
  ],

  documentation: 'US Bank account information.',

  sections: [
    {
      name: 'accountDetails',
      title: function(forContact) {
        return forContact ? this.SECTION_DETAILS_TITLE_CONTACT : this.SECTION_DETAILS_TITLE_VOID;
      },
      subTitle: `Connect to the account without signing in to online banking.
          Please ensure the details are entered properly.`
    },
    {
      name: 'pad',
      title: `Connect using a void check`,
      subTitle: `Connect to your account without signing in to online banking. 
          Please ensure your details are entered properly.`,
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
    }
  ],

  messages: [
    { name: 'DROP_ZONE_TITLE', message: 'DRAG & DROP YOUR VOID CHECK OR STATEMENT HERE' },
    { name: 'ROUTING_NUMBER_REQUIRED', message: 'Routing number required.' },
    { name: 'ROUTING_NUMBER_INVALID', message: 'Routing number must be 9 digits long.' },
    { name: 'ACCOUNT_NUMBER_REQUIRED', message: 'Account number required.' },
    { name: 'ACCOUNT_NUMBER_INVALID', message: 'Account number must be between 6 and 17 digits long.' },
    { name: 'IMAGE_REQUIRED', message: 'Please attach a void check or a 3 month bank statement.' },
    { name: 'ADD_SUCCESSFUL', message: 'Bank Account added successfully!' },
    { name: 'SECTION_DETAILS_TITLE_CONTACT', message: 'Add contact bank account' },
    { name: 'SECTION_DETAILS_TITLE_VOID', message: 'Connect using a void check' }
  ],

  properties: [
    {
      name: 'country',
      value: 'US',
      createVisibility: 'HIDDEN'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/us.png',
      createVisibility: 'HIDDEN'
    },
    {
      name: 'denomination',
      value: 'USD'
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    },
    { // REVIEW: remove
      class: 'String',
      name: 'institutionNumber',
      hidden: true
    },
    {
      name: 'voidChequeImage',
      class: 'String',
      label: '',
      value: 'images/USA-Check.png',
      section: 'accountDetails',
      visibility: 'RO',
      transient: true,
      view: function(_, X) {
        return {
          class: 'foam.u2.tag.Image'
        };
      }
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'voidCheckImage',
      documentation: 'void check image for this bank account',
    },
    {
      name: 'branchId',
      label: 'ACH Routing Number',
      section: 'accountDetails',
      updateVisibility: 'RO',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '123456789',
        maxLength: 9,
        onKey: true
      },
      gridColumns: 6,
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      postSet: function(o, n) {
        this.padCapture.branchId = n;
      },
      validateObj: function(branchId) {
        var accNumberRegex = /^[0-9]{9}$/;

        if ( branchId === '' ) {
          return this.ROUTING_NUMBER_REQUIRED;
        } else if ( ! accNumberRegex.test(branchId) ) {
          return this.ROUTING_NUMBER_INVALID;
        }
      }
    },
    {
      name: 'accountNumber',
      label: 'ACH Account Number',
      updateVisibility: 'RO',
      postSet: function(o, n) {
        this.padCapture.accountNumber = n;
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{6,17}$/;

        if ( accountNumber === '' ) {
          return this.ACCOUNT_NUMBER_REQUIRED;
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return this.ACCOUNT_NUMBER_INVALID;
        }
      },
      gridColumns: 6
    },
    {
      name: 'branch',
      //visibility: 'HIDDEN'
      updateVisibility: 'RO',
      label: 'Routing No.',
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
      section: 'accountDetails',
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
          .add(obj.slot((branch, branchDAO) => {
            return branchDAO.find(branch).then((result) => {
              if ( result ) {
                return this.E()
                  .start('span').style({ 'font-weight': '500', 'white-space': 'pre' }).add(` ${obj.cls_.getAxiomByName('branch').label}`).end()
                  .start('span').add(` ${result.branchId} |`).end();
              }
            });
          }))
        .end()

        .start()
          .add(obj.slot((accountNumber) => {
              if ( accountNumber ) {
                return this.E()
                  .start('span').style({ 'font-weight' : '500', 'white-space': 'pre' }).add(` ${obj.cls_.getAxiomByName('accountNumber').label} `).end()
                  .start('span').add(`*** ${accountNumber.substring(accountNumber.length - 4, accountNumber.length)}`).end();
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
      section: 'accountDetails',
      documentation: 'Supporting documents to verify bank account',
      validateObj: function(supportingDocuments, plaidResponseItem) {
        if ( supportingDocuments.length === 0 && ! plaidResponseItem ) {
          return this.IMAGE_REQUIRED;
        }
      },
      view: function(_, X) {
        return {
          class: 'net.nanopay.sme.ui.fileDropZone.FileDropZone',
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
      storageTransient: true,
      label: '',
      updateVisibility: 'HIDDEN',
      factory: function() {
        return net.nanopay.model.USPadCapture.create({
          country: this.country,
          firstName: this.agent.firstName,
          lastName: this.agent.lastName,
          companyName: this.user.businessName,
          address: this.user.address
        }, this);
      },
      view: function(_, X) {
        return foam.u2.view.FObjectView.create({
          of: net.nanopay.model.USPadCapture
        }, X);
      }
    }
  ],

  methods: [
    async function save() {
      try {
        await this.padCaptureDAO.put(this.padCapture);
      } catch (e) {
        this.notify(e, 'error');
        return;
      }
      if ( this.plaidResponseItem ) {
        let responseItem = this.plaidResponseItem;
        this.plaidResponseItem = null; // avoids stack call recursion.
        try {
          let response = await this.plaidService.saveAccount(null, responseItem);
          if ( response.plaidError ) {
            let message = error.display_message !== '' ? error.display_message : error.error_code;
            this.notify(message, 'error');
          }
          if ( this.stack ) this.stack.back();
        } catch (e) {
          this.notify(e.message, 'error');
        }
      } else {
        try {
          this.address = this.padCapture.address;
          await this.user.accounts.put(this);
          if ( this.stack ) this.stack.back();
          this.notify(this.ADD_SUCCESSFUL);
        } catch (error) {
          this.notify(error.message, 'error');
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
        String branchId = this.getBranchId();
        String accountNumber = this.getAccountNumber();
        
        if ( SafetyUtil.isEmpty(branchId) ) {
          throw new IllegalStateException(this.ROUTING_NUMBER_REQUIRED);
        }
        if ( ! BRANCH_ID_PATTERN.matcher(branchId).matches() ) {
          throw new IllegalStateException(this.ROUTING_NUMBER_INVALID);
        }

        if ( SafetyUtil.isEmpty(accountNumber) ) {
          throw new IllegalStateException(this.ACCOUNT_NUMBER_REQUIRED);
        }
        if ( ! ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches() ) {
          throw new IllegalStateException(this.ACCOUNT_NUMBER_INVALID);
        }
      `
    },
    {
      name: 'getBankCode',
      type: 'String',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        return "";
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
        return getBranchId();
      `
    },
 ]
});
