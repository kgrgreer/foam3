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
    'foam.nanos.auth.Address',
    'net.nanopay.payment.PaymentProviderCorridor'
  ],

  imports: [
    'branchDAO',
    'capabilityDAO',
    'countryDAO',
    'institutionDAO',
    'paymentProviderCorridorDAO'
  ],

  javaImports: [
    'foam.core.Currency',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.List',
    'net.nanopay.account.Account',
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
    }
  ],

  sections: [
    {
      name: 'pad',
      permissionRequired: true,
      isAvailable: function(forContact) {
        return ! forContact;
      }
    }
  ],

  messages: [
    { name: 'BANK_ACCOUNT_LABEL', message: 'Bank Account' },
    { name: 'ACCOUNT_NUMBER_REQUIRED', message: 'Account number required' },
    { name: 'ACCOUNT_NUMBER_INVALID', message: 'Account number invalid' },
    { name: 'NICKNAME_REQUIRED', message: 'Nickname required' },
    { name: 'BANK_CODE_REQUIRED', message: 'Bank code required' },
    { name: 'BANK_CODE_INVALID', message: 'Bank code invalid' },
    { name: 'SORT_CODE_REQUIRED', message: 'Sort code required' },
    { name: 'SORT_CODE_INVALID', message: 'Sort code invalid' },
    { name: 'CHECK_DIGIT_REQUIRED', message: 'Check digit required' },
    { name: 'CHECK_DIGIT_INVALID', message: 'Check digit invalid' },
    { name: 'BRANCH_CODE_REQUIRED', message: 'Branch code required' },
    { name: 'BRANCH_CODE_INVALID', message: 'Branch code invalid' },
    { name: 'SWIFT_CODE_REQUIRED', message: 'SWIFT/BIC code required' },
    { name: 'SWIFT_CODE_INVALID', message: 'SWIFT/BIC code invalid' },
  ],

  properties: [
    {
      class: 'String',
      name: 'accountNumber',
      documentation: 'The account number of the bank account.',
      label: 'Account No.',
      updateVisibility: 'RO',
      section: 'accountDetails',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '1234567',
        onKey: true
      },
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
      tableCellFormatter: function(str) {
        if ( ! str ) return;
        var displayAccountNumber = '***' + str.substring(str.length - 4, str.length);
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
      name: 'summary',
      networkTransient: false,
      tableCellFormatter: function(_, obj) {
        this.start()
        .start()
          .add(obj.slot((accountNumber) => {
              if ( accountNumber ) {
                return this.E()
                  .start('span').style({ 'font-weight' : '500', 'white-space': 'pre' }).add(` ${obj.cls_.getAxiomByName('accountNumber').label} `).end()
                  .start('span').add(`*** ${accountNumber.substring(accountNumber.length - 4, accountNumber.length)}`).end();
              }
          }))
        .end();
      },
      javaFactory: `
        return "***" + getAccountNumber().substring(Math.max(getAccountNumber().length() - 4, 0));
      `
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.bank.BankAccountStatus',
      name: 'status',
      documentation: 'Tracks the status of the bank account.',
      tableWidth: 82,
      section: 'administration',
      writePermissionRequired: true,
      tableCellFormatter: function(a) {
        var backgroundColour = 'transparent';
        var colour = '#545d87';
        var label = a.label;
        switch ( a ) {
          case net.nanopay.bank.BankAccountStatus.VERIFIED :
            colour = '#2cab70';
            backgroundColour = colour;
            label = 'Active';
            break;
          case net.nanopay.bank.BankAccountStatus.DISABLED :
            colour = '#f91c1c';
            backgroundColour = colour;
            label = a.label;
            break;
          case net.nanopay.bank.BankAccountStatus.UNVERIFIED :
            label = 'Pending';
            break;
        }
        this.start()
          .start()
            .style({
              'display': 'inline-block',
              'vertical-align': 'middle',
              'box-sizing': 'border-box',
              'width': '6px',
              'height': '6px',
              'margin-right': '6px',
              'background-color': backgroundColour,
              'border': '1px solid',
              'border-color': colour,
              'border-radius': '6px'
            })
          .end()
          .start()
            .style({
              'display': 'inline-block',
              'vertical-align': 'middle',
              'font-size': '11px',
              'color': colour,
              'text-transform': 'capitalize',
              'line-height': '11px'
            })
            .add(label)
          .end()
        .end();
      }
    },
    { // REVIEW: remove
      class: 'String',
      name: 'institutionNumber',
      section: 'administration',
    },
    { // REVIEW: remove
      class: 'String',
      name: 'branchId',
      section: 'administration',
    },
    {
      class: 'Long',
      name: 'randomDepositAmount',
      documentation:`A small financial sum deposited into a bank account to test
        onboarding onto our system.`,
      section: 'administration',
      networkTransient: true
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      documentation: `Defines the number of times it is attempted to verify
        ownership of the bank account.`,
      value: 0,
      section: 'administration',
      writePermissionRequired: true
    },
    {
      class: 'DateTime',
      name: 'microVerificationTimestamp',
      documentation: 'The date and time of when ownership of the bank account is verified.',
      section: 'administration',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      documentation: `The name of the country associated with the bank account.
        This should be set by the child class.
      `,
      section: 'accountDetails',
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
      section: 'accountDetails',
      visibility: 'RO',
      view: function(_, X) {
        return {
          class: 'foam.u2.tag.Image',
          displayWidth: '44px',
          displayHeight: '30px'
        };
      },
      tableCellFormatter: function(value, obj, axiom) {
        this.start('img').attr('src', value).end();
      }
    },
    {
      class: 'String',
      name: 'integrationId',
      documentation:`A unique identifier for a bank account within the
        client's accounting software.`,
      section: 'administration'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: `User pad authorization address.`,
      // section: 'pad',
      // Note: To be removed
      factory: function() {
        return this.Address.create();
      },
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'bankAddress',
      documentation: `Returns the bank account address from the Address model.`,
      // section: 'pad',
      factory: function() {
        return this.Address.create();
      },
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'availableCurrencies',
      documentation: `Contains list of available currencies to receive or send in selected account country`,
      visibility: 'HIDDEN',
      section: 'accountDetails',
      expression: function(user, currencyDAO, forContact) {
        let propInfo = forContact ? this.PaymentProviderCorridor.TARGET_COUNTRY : this.PaymentProviderCorridor.SOURCE_COUNTRY;
        let propInfoCurrency = forContact ? this.PaymentProviderCorridor.TARGET_CURRENCIES : this.PaymentProviderCorridor.SOURCE_CURRENCIES;
        return this.PromisedDAO.create({
          of: 'foam.core.Currency',
          promise: this.paymentProviderCorridorDAO.where(this.AND(
              this.EQ(propInfo, this.country),
              this.INSTANCE_OF(this.PaymentProviderCorridor)
            ))
            .select(this.MAP(propInfoCurrency))
            .then((sink) => {
              return currencyDAO.where(
                this.IN(this.Currency.ID, sink.delegate.array.flat())
              );
            })
        });
      }
    },
    {
      class: 'Boolean',
      name: 'forContact',
      documentation: `Flag for whether bank account is owned by a contact.
          Required for visibility property expressions.`
    },
    {
      name: 'denomination',
      updateVisibility: 'RO',
      writePermissionRequired: false,
      gridColumns: 12,
      section: 'accountDetails',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          data$: X.data.denomination$,
          sections: [
            {
              heading: 'Available Currencies',
              dao$: X.data.availableCurrencies$
            }
          ]
        };
      }
    },
    {
      name: 'name',
      label: 'Nickname',
      order: 4,
      validateObj: function(name) {
        if ( name === '' || ! name ) {
          return this.NICKNAME_REQUIRED;
        }
      }
    },
    {
      class: 'String',
      name: 'iban',
      label: 'IBAN',
      required: true,
      section: 'accountDetails',
      documentation: `Standard international numbering system developed to
          identify an overseas bank account.`,
      createVisibility: 'RW',
      updateVisibility: 'RW',
      readVisibility: 'RO',
    },
    {
      class: 'String',
      name: 'bankCode',
      label: 'Bank Code',
      documentation: `International bank code that identifies banks worldwide. BIC/SWIFT`,
      updateVisibility: 'RO',
      section: 'accountDetails'
    },
    {
      name: 'securityPromoteInfo',
      label: '',
      section: 'accountDetails',
      view: { class: 'net.nanopay.ui.DataSecurityBanner' }
    },
    {
      class: 'String',
      name: 'verifiedBy'
    }
  ],
  methods: [
    function toSummary() {
      return `${ this.name } ${ this.country } ${ this.BANK_ACCOUNT_LABEL } (${this.denomination})`;
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
        var numericCode = this.replaceChars(this.bankCode) + "0".repeat(requiredDigits >= 0 ? requiredDigits : 0) + this.accountNumber + this.replaceChars(this.country) + '00';
        while ( numericCode.length > 10 ) {
          var part = numericCode.substring(0, 10);
          numericCode = (part % 97) + numericCode.substring(10);
        }
        var checkSum = (98 - numericCode % 97).toString();
        return checkSum.length == 1 ? "0" + checkSum : checkSum;
      },
      javaCode: `
        int requiredDigits = 10 - getAccountNumber().length();
        String numericCode = replaceChars(getBankCode() + "0".repeat(requiredDigits >= 0 ? requiredDigits : 0) + getAccountNumber() + replaceChars(getCountry()) + "00");
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
        return getBankCode();
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
        return "";
      `
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
      `
    },
    {
      name: 'validateAmount',
      javaCode: `
        //NOP
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
