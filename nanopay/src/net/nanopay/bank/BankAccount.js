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
  name: 'BankAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'The base model for creating and managing all bank accounts.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.core.Currency',
    'foam.dao.PromisedDAO',
    'foam.dao.PurgeRecordCmd',
    'foam.nanos.auth.Address',
    'foam.nanos.iban.ValidationIBAN',
    'foam.u2.ControllerMode',
    'foam.u2.dialog.Popup',

    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.payment.PaymentProviderCorridor',
    'net.nanopay.sme.ui.SMEModal'
  ],

  imports: [
    'capabilityDAO',
    'countryDAO',
    'sourceCorridorDAO',
    'targetCorridorDAO'
  ],

  javaImports: [
    'foam.core.Currency',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.iban.IBANInfo',
    'foam.nanos.iban.ValidationIBAN',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.List',
    'java.util.regex.Pattern',
    'net.nanopay.account.Account',
    'net.nanopay.contacts.PersonalContact',
    'static foam.mlang.MLang.*'
  ],

  tableColumns: [
    'name',
    'summary',
    'flagImage',
    'balance',
    'homeBalance'
  ],

  // relationships: branch (Branch)
  constants: [
    {
      name: 'ACCOUNT_NAME_MAX_LENGTH',
      type: 'Integer',
      value: 70
    },
    {
      name: 'SWIFT_CODE_PATTERN',
      type: 'Regex',
      factory: function() { return /^[A-z0-9a-z]{8,11}$/; }
    }
  ],

  sections: [
    {
      name: 'complianceInformation',
      permissionRequired: true,
      order: 30
    },
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
          name: 'branchId',
          order: 50,
          gridColumns: 12
        },
        {
          name: 'institutionNumber',
          order: 60,
          gridColumns: 12
        },
        {
          name: 'accountNumber',
          order: 70,
          gridColumns: 12
        },
        {
          name: 'swiftCode',
          order: 80,
          gridColumns: 12
        },
        {
          name: 'iban',
          order: 90,
          gridColumns: 12
        }
      ]
    },
    {
      name: 'pad',
      permissionRequired: true,
      isAvailable: function(forContact) {
        return ! forContact;
      },
      order: 110
    },
    {
      name: 'contextMenuActions'
    }
  ],

  messages: [
    { name: 'BANK_ACCOUNT_LABEL', message: 'Bank Account' },
    { name: 'ACCOUNT_NUMBER_REQUIRED', message: 'Account number required' },
    { name: 'ACCOUNT_NUMBER_INVALID', message: 'Account number invalid' },
    { name: 'NICKNAME_REQUIRED', message: 'Nickname required' },
    { name: 'INSTITUTION_NUMBER_REQUIRED', message: 'Institution required' },
    { name: 'INSTITUTION_NUMBER_INVALID', message: 'Institution invalid' },
    { name: 'CHECK_DIGIT_REQUIRED', message: 'Check digit required' },
    { name: 'CHECK_DIGIT_INVALID', message: 'Check digit invalid' },
    { name: 'BRANCH_ID_REQUIRED', message: 'Branch required' },
    { name: 'BRANCH_ID_INVALID', message: 'Branch invalid' },
    { name: 'SWIFT_CODE_REQUIRED', message: 'SWIFT/BIC code required' },
    { name: 'SWIFT_CODE_INVALID', message: 'SWIFT/BIC code invalid' },
    { name: 'SWIFT_CODE_VALIDATION_FAILED', message: 'SWIFT/BIC code validation failed' },
    { name: 'IBAN_REQUIRED', message: 'IBAN required' },
    { name: 'IBAN_INVALID', message: 'IBAN invalid' },
    { name: 'IBAN_INVALIDATION_FAILED', message: 'IBAN validation failed' },
    { name: 'IBAN_COUNTRY_MISMATCHED', message: 'IBAN country code mismatched' },
    { name: 'AVAILABLE_CURRENCIES_MSG', message: 'Available Currencies' },
    { name: 'DELETE_DEFAULT', message: 'Unable to delete default accounts. Please select a new default account if one exists.' },
    { name: 'UNABLE_TO_DELETE', message: 'Error deleting account: ' },
    { name: 'SUCCESSFULLY_DELETED', message: 'Bank account deleted' },
    { name: 'IS_DEFAULT_ACCOUNT', message: 'is now your default bank account. Funds will be automatically transferred to and from this account.' },
    { name: 'UNABLE_TO_DEFAULT', message: 'Unable to set non verified bank accounts as default' },
    { name: 'STATUS_ACTIVE', message: 'Active' },
    { name: 'STATUS_PENDING', message: 'Pending' },
    { name: 'STATUS_DISABLED', message: 'Disabled' },
    { name: 'CLIENT_ACCOUNT_INFORMATION_DEFAULT_TITLE', message: 'Client Account Information' }
  ],

  css: `
    .bank-account-popup .net-nanopay-sme-ui-SMEModal-inner {
      width: 515px;
      height: 500px;
    }
    .bank-account-popup .net-nanopay-sme-ui-SMEModal-content {
      overflow: auto !important;
      padding: 30px;
    }
    .bank-account-detail-popup .net-nanopay-sme-ui-SMEModal-inner {
      max-height: 100vh;
      overflow: auto;
    }
  `,

  properties: [
    {
      name: 'id',
      updateVisibility: 'RO'
    },
    {
      name: 'name',
      label: 'Nickname',
      section: 'accountInformation',
      order: 40,
      gridColumns: 6,
      tableWidth: 168,
      validateObj: function(name) {
        if ( name === '' || ! name ) {
          return this.NICKNAME_REQUIRED;
        }
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      documentation: 'The account number of the bank account.',
      updateVisibility: 'RO',
      section: 'accountInformation',
      order: 50,
      gridColumns: 6,
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      },
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
      tableCellFormatter: function(str, obj) {
        if ( ! str ) return;
        var displayAccountNumber = obj.mask(str);
        this.start()
          .add(displayAccountNumber);
        this.tooltip = displayAccountNumber;
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( accountNumber === '' ) {
          return this.ACCOUNT_NUMBER_REQUIRED;
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return this.ACCOUNT_NUMBER_INVALID;
        }
      }
    },
    {
      class: 'String',
      name: 'iban',
      label: 'International Bank Account Number (IBAN)',
      updateVisibility: 'RO',
      section: 'accountInformation',
      order: 80,
      gridColumns: 6,
      documentation: `Standard international numbering system developed to
          identify a bank account.`,
      validateObj: function(iban, accountNumber, country) {
        if ( this.ACCOUNT_NUMBER_PATTERN && this.ACCOUNT_NUMBER_PATTERN.test(accountNumber) )
          return;

        if ( ! iban )
          return this.IBAN_REQUIRED;

        if ( iban && country !== iban.substring(0, 2) )
          return this.IBAN_COUNTRY_MISMATCHED;

        var ibanMsg = this.ValidationIBAN.create({}).validate(iban);

        if ( ibanMsg && ibanMsg != 'passed')
          return ibanMsg;
      },
      javaValidateObj: `
      net.nanopay.bank.BankAccount account = (net.nanopay.bank.BankAccount) obj;
      foam.nanos.iban.ValidationIBAN vban = new foam.nanos.iban.ValidationIBAN(x);
      vban.validate(account.getIban());
      foam.nanos.iban.IBANInfo info = vban.parse(account.getIban());
      if ( info != null &&
           ! account.getCountry().equals(info.getCountry())) {
        throw new foam.core.ValidationException(IBAN_COUNTRY_MISMATCHED);
      }
      `,
      javaPostSet: `
        ValidationIBAN vban = new ValidationIBAN(getX());
        IBANInfo info = vban.parse(val);
        if ( info != null ) {
          setAccountNumber(info.getAccountNumber());
          setBranchId(info.getBranch());
          setInstitutionNumber(info.getBankCode());
        }
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'bankAddress',
      section: 'accountInformation',
      order: 90,
      visibility: 'HIDDEN',
      documentation: `Returns the bank account address from the Address model.`,
      // section: 'pad',
      factory: function() {
        return this.Address.create();
      },
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      documentation: `The name of the country associated with the bank account.
        This should be set by the child class.
      `,
      section: 'accountInformation',
      order: 100,
      gridColumns: 6,
      visibility: 'RO',
      view: {
        class: 'foam.u2.view.ReferencePropertyView',
        readView: { class: 'foam.u2.view.StringView' }
      }
    },
    {
      class: 'URL',
      name: 'flagImage',
      label: 'Country', // To set table column heading
      documentation: `A URL link to an image of the country's flag. Used for
        display purposes. This should be set by the child class.
      `,
      tableWidth: 91,
      section: 'accountInformation',
      order: 105,
      gridColumns: 6,
      visibility: 'RO',
      view: function(_, X) {
        return {
          class: 'foam.u2.tag.Image',
          displayWidth: '44px',
          displayHeight: '30px'
        };
      },
      tableCellFormatter: function(value, obj, axiom) {
        this.start('img')
          .attr('src', value)
          .attr('width', 34)
          .attr('height', 20)
        .end();
      }
    },
    {
      class: 'String',
      name: 'institutionNumber',
      label: 'Institution',
      section: 'accountInformation',
      order: 120,
      gridColumns: 6,
      documentation: `International bank code that identifies banks worldwide. BIC/SWIFT`,
      updateVisibility: 'RO',
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      },
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
    },
    {
      class: 'String',
      name: 'branchId',
      label: 'Branch',
      section: 'accountInformation',
      order: 130,
      gridColumns: 6,
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      },
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
    },
    {
      class: 'String',
      name: 'swiftCode',
      label: 'SWIFT/BIC',
      updateVisibility: 'RO',
      section: 'accountInformation',
      order: 150,
      gridColumns: 6,
      validateObj: function(swiftCode, iban, institutionNumber, branchId) {
        if ( (this.INSTITUTION_NUMBER_PATTERN || this.BRANCH_ID_PATTERN)
          && (! this.INSTITUTION_NUMBER_PATTERN || this.INSTITUTION_NUMBER_PATTERN.test(institutionNumber))
          && (! this.BRANCH_ID_PATTERN || this.BRANCH_ID_PATTERN.test(branchId))
        ) {
          return;
        }

        if ( iban )
          var ibanMsg = this.ValidationIBAN.create({}).validate(iban);

        if ( ! iban || (iban && ibanMsg != 'passed') ) {
          if ( ! swiftCode || swiftCode === '' ) {
            return this.SWIFT_CODE_REQUIRED;
          } else if ( ! this.SWIFT_CODE_PATTERN.test(swiftCode) ) {
            return this.SWIFT_CODE_INVALID;
          }
        }
      }
    },
    {
      name: 'denomination',
      label: 'Currency',
      updateVisibility: 'RO',
      writePermissionRequired: false,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ModeAltView',
          readView: { class: 'foam.u2.view.ReferenceView' },
          writeView: {
            class: 'foam.u2.view.RichChoiceView',
            data$: X.data.denomination$,
            sections: [
              {
                heading: X.data.AVAILABLE_CURRENCIES_MSG,
                dao$: X.data.availableCurrencies$
              }
            ]
          }
        };
      }
    },
    {
      name: 'summary',
      updateVisibility: 'RO',
      networkTransient: false,
      tableCellFormatter: function(_, obj) {
        this.start()
        .start()
          .add(obj.slot((accountNumber) => {
              if ( accountNumber ) {
                return this.E()
                  .start('span').style({ 'font-weight' : '500', 'white-space': 'pre' }).add(` ${obj.cls_.getAxiomByName('accountNumber').label} `).end()
                  .start('span').add(obj.mask(accountNumber)).end();
              }
          }))
        .end();
      },
      javaFactory: `
        return BankAccount.mask(getAccountNumber());
      `
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.bank.BankAccountStatus',
      name: 'status',
      documentation: 'Tracks the status of the bank account.',
      tableWidth: 82,
      section: 'operationsInformation',
      order: 10,
      gridColumns: 6,
      writePermissionRequired: true,
      tableCellFormatter: function(a) {
        var backgroundColour = 'transparent';
        var colour = a.color;
        var label = a.label;
        switch ( a ) {
          case net.nanopay.bank.BankAccountStatus.VERIFIED :
            backgroundColour = colour;
            label = net.nanopay.bank.BankAccount.STATUS_ACTIVE;
            break;
          case net.nanopay.bank.BankAccountStatus.DISABLED :
            backgroundColour = colour;
            label = net.nanopay.bank.BankAccount.STATUS_DISABLED;
            break;
          case net.nanopay.bank.BankAccountStatus.UNVERIFIED :
            label = net.nanopay.bank.BankAccount.STATUS_PENDING;
            break;
        }
        this.start().style({ color : colour }).add(label).end();
      }
    },
    {
      class: 'Long',
      name: 'randomDepositAmount',
      documentation:`A small financial sum deposited into a bank account to test
        onboarding onto our system.`,
      section: 'operationsInformation',
      order: 30,
      gridColumns: 6,
      networkTransient: true
    },
    {
      class: 'DateTime',
      name: 'microVerificationTimestamp',
      documentation: 'The date and time of when ownership of the bank account is verified.',
      section: 'operationsInformation',
      order: 40,
      gridColumns: 6
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      documentation: `Defines the number of times it is attempted to verify
        ownership of the bank account.`,
      value: 0,
      section: 'operationsInformation',
      order: 50,
      gridColumns: 6,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'verifiedBy',
      section: 'operationsInformation',
      order: 60,
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      section: 'ownerInformation',
      order: 20,
      documentation: `User pad authorization address.`,
      // section: 'pad',
      // Note: To be removed
      factory: function() {
        return this.Address.create();
      },
    },
    {
      class: 'Boolean',
      name: 'forContact',
      section: 'ownerInformation',
      order: 40,
      gridColumns: 6,
      documentation: `Flag for whether bank account is owned by a contact.
          Required for visibility property expressions.`,
      javaFactory: `
        return findOwner(foam.core.XLocator.get()) instanceof PersonalContact;
      `
    },
    {
      class: 'String',
      name: 'integrationId',
      documentation:`A unique identifier for a bank account within the
        client's accounting software.`,
      section: 'systemInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'availableCurrencies',
      documentation: `Contains list of available currencies to receive or send in selected account country`,
      visibility: 'HIDDEN',
      section: 'accountInformation',
      expression: function(user, currencyDAO, forContact) {
        let propInfo = forContact ? this.PaymentProviderCorridor.TARGET_COUNTRY : this.PaymentProviderCorridor.SOURCE_COUNTRY;
        let propInfoCurrency = forContact ? this.PaymentProviderCorridor.TARGET_CURRENCIES : this.PaymentProviderCorridor.SOURCE_CURRENCIES;
        let dao = forContact ? this.targetCorridorDAO : this.sourceCorridorDAO;
        return this.PromisedDAO.create({
          of: 'foam.core.Currency',
          promise: dao.where(this.AND(
              this.EQ(propInfo, this.country),
              this.INSTANCE_OF(this.PaymentProviderCorridor)
            ))
            .select(this.MAP(propInfoCurrency))
            .then((sink) => {
              let currencies = sink.delegate.array ? sink.delegate.array : [];
              currencies.push(this.denomination);
              return currencyDAO.where(
                this.IN(this.Currency.ID, currencies.flat())
              );
            })
        });
      }
    },
    {
      class: 'String',
      name: 'ownerType',
      flags: ['js'],
      tableCellFormatter: function(_, obj) {
        obj.owner$find.then((user) => {
          this.add(user.cls_.name);
        });
      },
      visibility: 'HIDDEN'
    },
    {
      name: 'clientAccountInformationTitle',
      transient: true,
      visibility: 'HIDDEN',
      factory: function() {
        return this.CLIENT_ACCOUNT_INFORMATION_DEFAULT_TITLE;
      }
    },
    {
      class: 'String',
      name: 'bankRoutingCode',
      documentation: 'Bank routing code aka. national ID used to clear funds and/or route payments domestically.',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'checkDigitNumber',
      visibility: 'HIDDEN',
      documentation: `check digit is to be used in IBAN translation and calculated based on account number,
        institution and branchId. Different countries specify different rules => to be overwritten in subclass.
        This is NOT check digit only, this property returns the final formatted number. E.g. for some countries its
        branch + accountNumber + checkDigit, for others its accountNumber + checkDigit.`,
      javaFactory: `return getAccountNumber();`
    }
  ],

  actions: [
    {
      name: 'verifyAccount',
      section: 'contextMenuActions',
      isAvailable: function() {
        return this.cls_.id == this.CABankAccount.id;
      },
      isEnabled: function() {
        return this.status === this.BankAccountStatus.UNVERIFIED;
      },
      code: function(X) {
        X.ctrl.add(this.Popup.create().tag({
          class: 'net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm',
          bank: this
        }));
      }
    }
    {
      name: 'setAsDefault',
      section: 'contextMenuActions',
      isEnabled: function() {
        return ! this.isDefault
      },
      code: function(X) {
        this.isDefault = true;
        this.subject.user.accounts.put(this).then(() =>{
          this.notify(`${ this.name } ${ this.IS_DEFAULT_ACCOUNT }`, '', this.LogLevel.INFO, true);
        }).catch((err) => {
          this.isDefault = false;
          this.notify(this.UNABLE_TO_DEFAULT, '', this.LogLevel.ERROR, true);
        });

        this.purgeCachedDAOs();
      }
    }
  ],

  static: [
    {
      name: 'mask',
      documentation: `
        Use this method instead of obfusicate if specific mask format is required.
        Currently formats str using ***### format. Update this method or
        use obfusicate if format changes.
      `,
      code: function(str) {
        return str ? `***${str.substring(str.length - 3)}` : '';
      },
      type: 'String',
      args: [
        { name: 'str', type: 'String' }
      ],
      javaCode: `
        return str == null ? "" : "***" + str.substring(str.length() - Math.min(str.length(), 3));
      `
    }
  ],

  methods: [
    function toSummary() {
      return `${ this.name } ${ this.country } ${ this.BANK_ACCOUNT_LABEL } (${this.denomination})`;
    },
    {
      name: 'obfuscate',
      documentation: ``,
      code: function(str, start, end) {
        var obfuscatedString = str;
        var count = 0;
        for ( let i = 0; i < str.length; i++ ) {
          if ( count == end ) {
            break;
          }
          if ( str[i] != ' ' ) {
            if ( count >= start - 1 ) {
              obfuscatedString = obfuscatedString.substring(0, i) + '*' + obfuscatedString.substring(i + 1);
            }
            count++;
          }
        }
        return obfuscatedString;
      },
      type: 'String',
      args: [
        { name: 'str', type: 'String' },
        { name: 'start', type: 'Long' },
        { name: 'end', type: 'Long' }
      ],
      javaCode: `
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (char c : str.toCharArray()) {
          if ( c != ' ' ) {
            if ( count >= start - 1 && count <= end - 1 ) {
              c = '*';
            }
            count++;
          }
          sb.append(c);
        }
        return sb.toString();
      `
    },
    {
      name: 'calcCheckSum',
      type: 'String',
      documentation: `
        Calculates check digits for IBAN number. Some countries may not share the same calculation.
        Calculation based on following document https://www.bpfi.ie/wp-content/uploads/2014/08/MOD-97-Final-May-2013-4.pdf
      `,
      code: function() {
        var requiredDigits = 10 - this.accountNumber.length;
        var numericCode = this.replaceChars(this.institutionNumber) + "0".repeat(requiredDigits >= 0 ? requiredDigits : 0) + this.accountNumber + this.replaceChars(this.country) + '00';
        while ( numericCode.length > 10 ) {
          var part = numericCode.substring(0, 10);
          numericCode = (part % 97) + numericCode.substring(10);
        }
        var checkSum = (98 - numericCode % 97).toString();
        return checkSum.length == 1 ? "0" + checkSum : checkSum;
      },
      javaCode: `
        int requiredDigits = 10 - getAccountNumber().length();
        String numericCode = replaceChars(getInstitutionNumber() + "0".repeat(requiredDigits >= 0 ? requiredDigits : 0) + getAccountNumber() + replaceChars(getCountry()) + "00");
        while ( numericCode.length() > 10 ) {
          long part = Long.parseLong(numericCode.substring(0, 10));
          numericCode = Long.toString(part % 97) + numericCode.substring(10);
        }
        String checkSum = Long.toString(98 - Long.parseLong(numericCode) % 97);
        return checkSum.length() == 1 ? "0" + checkSum : checkSum;
      `
    },
    {
      name: 'replaceChars',
      documentation: `Replace string with ascii related int.`,
      code: function(str) {
        return str.replace(/./g, function(c) {
          var a = 'A'.charCodeAt(0);
          var z = 'Z'.charCodeAt(0);
          var code = c.charCodeAt(0);
          return (a <= code && code <= z) ? code - a + 10 : parseInt(c);
        });
      },
      type: 'String',
      args: [
        { name: 'str', type: 'String'}
      ],
      javaCode: `
        StringBuilder sb = new StringBuilder();
        for (char c : str.toCharArray()) {
          int a = 'A';
          int z = 'Z';
          int code = c;
          if ( a <= code && code <= z ) {
              sb.append((int) code - a  + 10) ;
          } else {
            sb.append(c);
          }
        }
        return sb.toString();
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
        return getInstitutionNumber();
      `
    },
    {
      name: 'getBranchCode',
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
    {
      name: 'getRoutingCode',
      type: 'String',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      documentation: 'Get routing code from bank and branch codes. Only applicable when the bank account is saved. Otherwise, use getRoutingCode_() instead.',
      javaCode: `
        // Use bank and branch codes if present and fallback to bankRoutingCode.
        // The bankRoutingCode could be of the bank head office instead of the
        // specific branch especially when it was converted from a SWIFT/BIC.
        var code = new StringBuilder();
        code.append(getBankCode(x))
            .append(getBranchCode(x));
        return code.length() > 0 ? code.toString() : getBankRoutingCode();
      `
    },
    {
      name: 'getRoutingCode_',
      type: 'String',
      documentation: 'Get routing code from transient bank and branch codes before the bank account is saved.',
      javaCode: `
        var code = new StringBuilder();
        code.append(getInstitutionNumber())
            .append(getBranchId());
        return code.length() > 0 ? code.toString() : getBankRoutingCode();
      `
    },
    function purgeCachedDAOs() {
      this.__subContext__.accountDAO.cmd_(this, foam.dao.CachingDAO.PURGE);
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
        User owner = findOwner(x);
        if ( owner == null ) throw new RuntimeException("Owner with id " + getOwner() + " doesn't exist");

        String name = this.getName();
        if ( ((DAO)x.get("currencyDAO")).find(this.getDenomination()) == null ) {
          throw new RuntimeException("Please select a Currency");
        }
        if ( SafetyUtil.isEmpty(name) ) {
          throw new IllegalStateException("Please enter an account name.");
        }
        // length
        if ( name.length() > ACCOUNT_NAME_MAX_LENGTH ) {
          throw new IllegalStateException("Account name must be less than or equal to 70 characters.");
        }

        //To-do : IBAN validation
      `
    },
    {
      name: 'validateAmount',
      javaCode: `
        //NOP
      `
    },
    {
      name: 'getApiAccountNumber',
      type: 'String',
      javaCode: `
        return getAccountNumber();
      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public BankAccount findDefault(X x, User user, String currency) {
            BankAccount bankAccount = null;
            Logger logger = (Logger) x.get("logger");
              // Select currency of user's country
              String denomination = currency;
              if ( SafetyUtil.isEmpty(denomination) ) {
                denomination = "CAD";
                Address address = user.getAddress();
                if ( address != null && address.getCountryId() != null ) {
                  String country = address.getCountryId();
                  DAO currencyDAO = (DAO) x.get("currencyDAO");
                  List currencies = ((ArraySink) currencyDAO
                      .where(
                          EQ(Currency.COUNTRY, country)
                      ).limit(2)
                      .select(new ArraySink())).getArray();
                  if ( currencies.size() == 1 ) {
                    denomination = ((Currency) currencies.get(0)).getId();
                  } else if ( currencies.size() > 1 ) {
                    logger.warning(BankAccount.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
                  }
                }
              }
              bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO"))
                .find(
                  AND(
                    EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
                    EQ(Account.DELETED, false),
                    EQ(BankAccount.OWNER, user.getId()),
                    INSTANCE_OF(BankAccount.class),
                    EQ(Account.DENOMINATION, denomination),
                    EQ(Account.IS_DEFAULT, true)
                  )
                );
            return bankAccount;
          }
        `);
      }
    }
  ]
});
