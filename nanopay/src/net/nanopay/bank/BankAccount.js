foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'Base class/model of all BankAccounts',

  tableColumns: [
    'actionsMenu',
    'name',
    'status',
  ],

  // relationships: branch (Branch)

  properties: [
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account No.',
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
      of: 'net.nanopay.bank.BankAccountStatus',
      name: 'status',
      tableCellFormatter: function(a) {
        var colour = ( a === net.nanopay.bank.BankAccountStatus.VERIFIED )
            ? '#2cab70'
            : '#f33d3d';
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
      name: 'denomination',
      aliases: ['currencyCode', 'currency'],
      value: 'CAD'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.payment.Institution',
      name: 'institution',
      label: 'Institution'
    },
    {
      documentation: 'Provides backward compatibilty for mobile call flow.  BankAccountInstitutionDAO will lookup the institutionNumber and set the institution property.',
      class: 'String',
      name: 'institutionNumber',
      storageTransient: true,
      hidden: true,
    },
    {
      class: 'Long',
      name: 'randomDepositAmount',
      networkTransient: true
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      value: 0,
      visibility: foam.u2.Visibility.RO
    }
  ],

  actions: [
    {
      name: 'run',
      icon: 'images/ic-options-hover.svg',
      code: function() {
        foam.nanos.menu.SubMenuView.create({
          menu: foam.nanos.menu.Menu.create({ id: 'accountSettings' })
        });
      }
    }
  ]
});
