foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BankAccount',

  documentation: 'Bank account information.',

  tableColumns: ['accountName', 'institutionNumber', 'transitNumber', 'accountNumber', 'status', 'actionsMenu'],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'accountName',
      label: 'Account Name',
      documentation: 'Name of the bank account.',
      validateObj: function (accountName) {
        if ( accountName.length > 70 ) {
          return 'Account name cannot exceed 70 characters.';
        }
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.payment.Institution',
      name: 'institutionId',
      documentation: 'Reference to bank institute.',
      label: 'Institution'
    },
    {
      // TODO: deprecate and replace with institutionId
      class: 'String',
      name: 'institutionNumber',
      label: 'Institution No.',
      documentation: 'Institute identifier.',
      validateObj: function(institutionNumber) {
        var instNumRegex = /^[0-9]{3}$/;

        if ( ! instNumRegex.test(institutionNumber) ) {
          return 'Invalid institution number.';
        }
      }
    },
    {
      class: 'String',
      name: 'transitNumber',
      label: 'Transit No.',
      documentation: 'Branch/Transit identifier.',
      validateObj: function(transitNumber) {
        var transNumRegex = /^[0-9]{5}$/;

        if ( ! transNumRegex.test(transitNumber) ) {
          return 'Invalid transit number.';
        }
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account No.',
      documentation: 'Reference number/identifier of bank account used by issuing institute.',
      tableCellFormatter: function(str) {
        this.start()
          .add('***' + str.substring(str.length - 4, str.length));
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Invalid account number.';
        }
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.model.BankAccountStatus',
      name: 'status',
      documentation: 'Status indicating verfication. Dictates capabilities of bank accounts in the system.',
      tableCellFormatter: function(a) {
        var colour = ( a === net.nanopay.model.BankAccountStatus.VERIFIED ) ?
            '#2cab70' : '#f33d3d';
        this.start()
          .add(a.label)
          .style({
            'color': colour,
            'text-transform': 'capitalize'
          })
        .end();
      }
    },
    {
      class: 'String',
      name: 'xeroId'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'currencyCode',
      documentation: 'Currency bank uses account.'
    },
    {
      class: 'Long',
      name: 'randomDepositAmount',
      documentation: 'Random amount deposited to bank account.' +
          ' Used in the verification process',
      networkTransient: true
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      documentation: 'Tracks amount of verfiication attempts.',
      value: 0
    },
    {
      class: 'Boolean',
      name: 'setAsDefault',
      documentation: 'Determines user\' primary account. Transactions default to this account.',
      value: false
    }
  ],

  actions: [
    {
      name: 'run',
      icon: 'images/ic-options-hover.svg',
      code: function() {
        foam.nanos.menu.SubMenuView.create({
          menu: foam.nanos.menu.Menu.create({
            id: 'accountSettings'
          })
        });
      }
    }
  ]
});
