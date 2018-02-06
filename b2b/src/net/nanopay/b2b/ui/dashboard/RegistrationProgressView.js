
foam.CLASS({
  package: 'net.nanopay.b2b',
  name: 'RegistrationProgressView',
  extends: 'foam.u2.View',

  documentation: 'View displaying registration progress on dashboard view',

  imports: [ 'user', 'business', 'stack' ],

  properties: [
    'memberState',
    'partnerState'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          text-align: center;
          background-color: rgba(110, 174, 195, 0.1);
          height: 160px;
          margin-left: calc(-50vw + 50%);
          width: 100vw;
          position: relative;
          top: -15;
        }
        ^progress-container{
          padding-top: 45px;
        }
        ^ h4{
          opacity: 0.6;
          font-family: Roboto;
          font-size: 14px;
          line-height: 0.86;
          letter-spacing: 0.2px;
          color: #093649;
        }
        ^dismiss{
          width: 150px;;
          display: inline-block;
          float: right;
          text-align: right;
        }
        ^dismiss h4{
          display: inline-block;
          font-weight: 200px;
          margin: 0;
          cursor: pointer;
        }
        ^dismiss img{
          display: inline-block;
          margin-left: 20px;
          position: relative;
          top: 8;
          width: 25px;
          height: 25px;
        }
        ^registration-container{
          width: 995px;
          margin: auto;
          padding-right: 80px;
        }
        ^ .foam-u2-ActionView{
          display: block;
          z-index: 100;
          opacity: 0.01 !important;
          margin-right: 10px;
          position: absolute;
          height: 100px;
          width: 125px;
        }
      */}
    })
  ],

  methods: [
    function init(){
      this.SUPER();
      self = this;

      if( !this.business.name ){
        return;
      }
      this.business.members.limit(1).select().then(function(a){ 
        self.memberState = a.array.length == 0 
      });

      this.business.partners.dao.limit(1).select().then(function(a){ 
        self.partnerState = a.array.length == 0 
      });
    },

    function initE() {
      self = this;

      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('registration-container'))
          .start().addClass(this.myClass('dismiss'))
            .start('h4').add('Dismiss').end()
            .tag({class: 'foam.u2.tag.Image', data: 'images/cancel-x.png'}).on('click', function(){ self.hide() })
          .end()
          .start().addClass(this.myClass('progress-container'))
            .start({class: 'net.nanopay.b2b.RegistrationCardView', label: 'Verify Email', progressImage: 'images/email-verify.png', completed: this.user.verified, selected: !this.user.verified}).end()
            .start({class: 'net.nanopay.b2b.RegistrationCardView', label: 'Business Profile', progressImage: 'images/profile-card.png', completed: this.business.name, selected: !this.business.name }).add(this.BUSINESS_REGISTRATION).end()
            .start({class: 'net.nanopay.b2b.RegistrationCardView', label: 'Bank Account', progressImage: 'images/bank-card.png', completed: this.business.bankAccount.bankNumber, selected: !this.business.bankAccount.bankNumber && this.business.name}).add(this.BANK_REGISTRATION).end()
            .start({class: 'net.nanopay.b2b.RegistrationCardView', label: 'Assign a Member', progressImage: 'images/member-plus.png', completed: this.propertyState(this.memberState$), selected: this.propertyState(!this.memberState$) }).add(this.MEMBER_CREATE).end()
            .start({class: 'net.nanopay.b2b.RegistrationCardView', label: 'Invite a partner', progressImage: 'images/email-plus.png', completed: this.propertyState(this.partnerState$), selected: this.propertyState(!this.partnerState$) }).add(this.PARTNER_INVITE).end()
            .start({class: 'net.nanopay.b2b.RegistrationCardView', label: 'Sync', progressImage: 'images/sync-grey.png', completed: this.propertyState(this.business.xeroConnect) ,selected: this.propertyState(!this.business.xeroConnect) }).add(this.XERO_SYNC).end()
          .end()
        .end()
    },

    function propertyState(b){
      if(b && this.business.bankAccount.bankNumber){
        return true;
      }
      return false;
    },
  ],

  actions: [
    {
      name: 'businessRegistration',
      code: function(){
        if( this.ctrl.business.name ){
          return;
        }
//        this.ctrl.stack.push({ class: 'net.nanopay.auth.ui.BusinessRegistrationView'})
      }
    },
    {
      name: 'bankRegistration',
      code: function(){
        console.log('TODO Bank Registration View');
      }
    },
    {
      name: 'partnerInvite',
      code: function(){
        console.log('TODO Partner Invite View');
      }
    },
    {
      name: 'memberCreate',
      code: function(){
        console.log('TODO Member Create/Invite View');
      }
    },
    {
      name: 'xeroSync',
      code: function(){
        console.log('TODO Xero Sync');
      }
    }
  ]
});
