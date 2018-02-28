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
      validateObj: function (accountName) {
        if ( ! accountName ) {
          return 'Please enter account name';
        }

        if ( accountName.length > 70 ) {
          return 'Account name must be less than or equal to 70 characters.';
        }
      }
    },
    {
      class: 'String',
      name: 'institutionNumber',
      label: 'Institution No.',
      validateObj: function(institutionNumber) {
        var instNumRegex = /^[0-9]{3}$/;
        if ( ! institutionNumber ) {
          return 'Please enter institution number.';
        }

        if ( ! instNumRegex.test(institutionNumber) ) {
          return 'Invalid institution number.';
        }
      }
    },
    {
      class: 'String',
      name: 'transitNumber',
      label: 'Transit No.',
      validateObj: function(transitNumber) {
        var transNumRegex = /^[0-9]{5}$/;
        if ( ! transitNumber ) {
          return 'Please enter transit number';
        }

        if ( ! transNumRegex.test(transitNumber) ) {
          return 'Invalid transit number.';
        }
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account No.',
      tableCellFormatter: function(str) {
        this.start()
          .add('***' + str.substring(str.length - 4, str.length))
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{0,7}$/;

        if ( ! accountNumber ) {
          return 'Please enter account number.';
        }

        if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Invalid account number.';
        }
      }
    },
    {
      class: 'String',
      name: 'status',
      tableCellFormatter: function(a) {
        var colour = ( a == 'Verified' ) ? '#2cab70' : '#f33d3d';
        this.start()
          .add(a)
          .style({
            'color': colour,
            'text-transform': 'capitalize'
          })
        .end();
      },
      value: 'Unverified'
    },
    {
      class: 'String',
      name: 'xeroId'
    },
    {
      class: 'String',
      name: 'currencyCode'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Branch',
      name: 'branchId'
    },
    {
      class: 'Long',
      name: 'randomDepositAmount',
      networkTransient: true
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      value: 0
    },
    {
      class: 'Boolean',
      name: 'setAsDefault',
      value: false
    }
  ],

  actions: [
    {
      name: 'run',
      icon: 'images/ic-options-hover.svg',
      code: function() {
        foam.nanos.menu.SubMenuView.create({menu: foam.nanos.menu.Menu.create({id: 'accountSettings'})});
      }
    }
  ]
});
