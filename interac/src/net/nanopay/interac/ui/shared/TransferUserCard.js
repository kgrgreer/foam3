foam.CLASS({
  package: 'net.nanopay.interac.ui.shared',
  name: 'TransferUserCard',
  extends: 'foam.u2.Controller',

  documentation: 'User card used in transfers',

  imports: [
    'mode'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .userContainer {
          box-sizing: border-box;
          border-radius: 2px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          margin-bottom: 20px;

          width: 300px;
          padding: 20px;
        }

        ^ .userRow {
          margin-bottom: 20px;
        }

        ^ .userName {
          display: inline-block;
          margin-bottom: 0 !important;
        }

        ^ .nationalityContainer {
          display: inline-block;
          vertical-align: top;
          float: right;
        }

        ^ .nationalityLabel {
          display: inline-block;
          vertical-align: top;
          margin: 0;
          margin-left: 5px;
        }

        ^ .pDetails {
          opacity: 0.7;
          font-size: 12px;
          line-height: 1.17;
          letter-spacing: 0.2px;
          color: #093649;
        }

        ^ .bold {
          font-weight: bold;
          margin-bottom: 20px;
          letter-spacing: 0.4px;
        }
      */}
    })
  ],

  properties: [
    'user',
    'name_',
    'email_',
    'phone_',
    'flagURL_',
    'address_',
    'nationality_',
    {
      name: 'created_',
      value: false
    },
    'account'
  ],

  methods: [
    function init() {
      this.SUPER();
      this.user$.sub(this.userUpdate);
      this.userUpdate();
    },

    function createView() {
      if ( this.created_ ) return;
      this
        .addClass(this.myClass())
        .start('div').addClass('userContainer')
          .start('div').addClass('userRow')
            .start('p').addClass('bold').addClass('userName').add(this.name_$).end()
            .start('div').addClass('nationalityContainer')
              .start({class: 'foam.u2.tag.Image', data: this.flagURL_$}).end() // TODO: Make it dynamic
              .start('p').addClass('pDetails').addClass('nationalityLabel').add(this.nationality_$).end() // TODO: Make it dyamic.
            .end()
          .end()
          .start('p').addClass('pDetails').add(this.email_$).end()
          .start('p').addClass('pDetails').add(this.phone_$).end()
          .start('p').addClass('pDetails').add(this.address_$).end()
        .end();
      this.created_ = true;
    }
  ],

  listeners: [
    {
      name: 'userUpdate',
      code: function() {
        if ( ! this.user ) return;
        this.name_ = this.user.firstName + ' ' + this.user.lastName;
        if ( this.mode == 'Organization' ) {
          // if organization exists, change name to organization name.
          if ( this.user.organization ) this.name_ = this.user.organization;
        }

        this.email_ = this.user.email;
        this.phone_ = this.user.phone;

        switch( this.user.address.countryId ) {
          case 'CA' :
            this.flagURL_ = 'images/canada.svg';
            this.nationality_ = 'Canada';
            break;
          case 'IN' :
            this.flagURL_ = 'images/india.svg';
            this.nationality_ = 'India';
            break;
        }

        this.address_ = this.user.address.address;
        if ( this.user.address.suite ) this.address_ += ', Suite/Unit ' + this.user.address.suite;
        if ( this.user.address.city ) this.address_ += ', ' + this.user.address.city;
        if ( this.user.address.postalCode ) this.address_ += ', ' + this.user.address.postalCode;
        if ( this.user.address.regionId ) this.address_ += ', ' + this.user.address.regionId;
        this.address_ += ', ' + this.nationality_;



        this.createView();
      }
    }
  ]
});
