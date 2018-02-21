foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BankSubMenuAction',
  documentation: 'Action for Table Row options pop up.',

  properties: [ 
    'popupOrigin'
  ],

  methods: [
    function toE(args, X) {
      var optionsIcon = foam.u2.ViewSpec.createView({ class: 'foam.u2.tag.Image', data: 'images/ic-options.svg' }, args, this.popupOrigin$, X);
      return optionsIcon;
    }
  ]
});

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
      label: 'Account Name'
    },
    {
      class: 'String',
      name: 'institutionNumber',
      label: 'Institution No.'
    },
    {
      class: 'String',
      name: 'transitNumber',
      label: 'Transit No.'
    },
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account No.',
      tableCellFormatter: function(str) {
        this.start()
          .add('***' + str.substring(str.length - 4, str.length))
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
      class: 'Int',
      name: 'randomDepositAmount',
      factory: function() {
        var randomAmountInCents = 1 + Math.floor(Math.random() * 99);

        return randomAmountInCents;
      },
      hidden: true
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
    },
    {
      class: 'net.nanopay.model.BankSubMenuAction',
      name: 'actionsMenu',
      label: '',
      code: function(X) {
        var self = this;
        var p = foam.u2.PopupView.create({
          width: 152,
          x: -130,
          y: -7
        });

        p.start('div').add('Set As Default')
        .end()
        .start('div').add('Verify Account')
        .end()
        .start('div').add('Delete Account')
        .end();

        //self.popupOrigin.add(p);
        
        console.log('actionsMenu');
      }
    }
  ]
});
