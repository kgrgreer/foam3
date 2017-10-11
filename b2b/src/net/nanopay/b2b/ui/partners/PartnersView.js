foam.CLASS({
  package: 'net.nanopay.b2b.ui.partners',
  name: 'PartnersView',
  extends: 'foam.u2.View',

  documentation: 'Partners tab View.',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
   'business',
   'partnersDAO'
  ],

  properties: [
    'partnerCount'
  ],

  requires: [
    'foam.dao.FnSink',
  ],

  messages: [
    {
      name: 'placeholderText',
      message: 'Your partners’ business card will be shown up here.'
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
         ^ {
            background: #EDF0F5;
            width: 100%;
         }
         ^ .partners-container {
            height: 375px;
            margin: 0 auto;
            width: 100%;
            display: block;
            overflow: scroll;
            overflow-x: hidden;
         }
         ^ .button-container {
            width: 1075px;
            height: 120px;
            margin: 0 auto;
            margin-bottom: 20px;
         }
         .button-div {
            width: 1075px;
            height: 40px;
            margin: auto;
            margin-top: 5px;
            margin-left: 10px;
            margin-right: 10px;
            margin-bottom: 30px;
         }
         .sync-import-div {
            float: right;
            margin-right: 15px;
         }
         .separationDiv {
            height: 20px;
         }
         .inlineDiv {
            display: inline-block;
            margin-right: 30px;
         }
        .filter-search {
            width: 225px;
            height: 40px;
            border-radius: 2px;
            background-color: #ffffff;
            display: inline-block;
            margin-left: 10px;
            vertical-align: top;
            border: 0;
            box-shadow:none;
            padding-left: 10px;
            font-size: 16px;
         }
         .search-icon {
            width: 14px;
            height: 14px;
            border: solid 2px #a4b3b8;
            float: right;
            margin-right: 8px;
         }
         ^ .new-invite-button {
            background-color: #59AADD;
            width: 135px;
            height: 40px;
            border-radius: 2px;
            color: white;
            margin-left: 5px;
            text-align: center;
            vertical-align: top;
            display: inline-block;
            line-height: 40px;
            cursor: pointer;
         }

        .contacts-button {
            background-color: #1CC2B7;
            width: 200px;
            height: 40px;
            color: white;
            display: inline-block;
            line-height: 40px;
            text-align: center;
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
            border: solid 1px #1CC2B7;
            cursor: pointer;
         }

        .pending-contacts-button {
            width: 200px;
            height: 40px;
            color: #093649;
            display: inline-block;
            line-height: 40px;
            text-align: center;
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
            border: solid 1px #1CC2B7;
            cursor: pointer;
         }
         .connected-contacts {
            opacity: 0.6;
            font-family: Roboto;
            font-size: 14px;
            line-height: 12px;
            letter-spacing: 0.2px;
            text-align: left;
            color: #093649;
            float: right;
            margin-right: 15px;
         }
         ^ .floating-action-button {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #1cc2b7;
            box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.19);
            cursor: pointer;
            position: fixed;
            text-align: center;
            position: fixed;
            right: 2%;
            bottom: 8%;
            z-index: 100;
            max-width: 60%;
         }
         ^ .plus-icon {
            width: 24px;
            height: 24px;
            margin-top: 12px;
         }
         ^ .show{
           margin-top: 75px;
         }
      */}
    })
  ],
  
  methods: [
    function initE() {
      var sub = this.partnersDAO.listen(this.FnSink.create({ fn: this.onDAOUpdate }));
      this.onunload.sub(function(){ sub.detach(); });

      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start('div').addClass('floating-action-button')
          .start({class:'foam.u2.tag.Image', data: 'images/ic-plus.png'}).addClass('plus-icon').end()
        .end()
        .start('div').addClass('button-container')
          .start('div').addClass('button-div')
            .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-filter.png', text: 'Filters'}})
            .start('input').addClass('filter-search').end()
            .start('div').addClass('sync-import-div')
              .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-sync-s.png', text: 'Sync'}})
              .start('div').addClass('new-invite-button').add('New Invite').end()
            .end()
          .end()
          .start('div').addClass('button-div')
            .start('div').addClass('contacts-button').add('Connected Contacts').end()
            .start('div').addClass('pending-contacts-button').add('Pending Contacts').end()
            .start('h5').addClass('connected-contacts').add(this.partnerCount$,' Connected Contacts').end()
          .end()
        .end()
        .start('div').addClass('partners-container')
          .tag({ class: 'net.nanopay.b2b.ContactCardView', data: this.partnersDAO })
          .tag({ class: 'net.nanopay.b2b.ui.shared.Placeholder', dao: this.partnersDAO, message: this.placeholderText, image: 'images/ic-partners.png' })
        .end()
    }
  ],

  listeners:[
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;

        this.partnersDAO.select(this.COUNT()).then(function(p){
          self.partnerCount = p.value;
        })
      }
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.b2b',
  name: 'ActionButton',
  extends: 'foam.u2.View',

  documentation: 'View for displaying buttons on the Partners page such as Filters and Sync',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
            font-family: Roboto;
            width: 75px;
            height: 40px;
            border-radius: 2px;
            background-color: rgba(164, 179, 184, 0.1);
            box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
            display: inline-block;
            cursor: pointer;
        }
        ^ .button-image {
            padding-top: 10px;
            padding-bottom: 10px;
            padding-left: 5px;
            width: 20px;
            height: 20px;
            display: inline-block;
        }
        ^ .button-text {
            width: 31px;
            display: inline-block;
            font-family: 'Roboto';
            font-size: 11px;
            color: #093649;
            padding-left: 9px;
            font-weight: 300;
            line-height: 20px;
            letter-spacing: 0.2px;
            position: relative;
            top: -16px;
        }
      */}
    })
  ],
  
  methods: [
    function initE() {
      this
        .addClass(this.myClass())
          .start({class:'foam.u2.tag.Image', data: this.data.image}).addClass('button-image').end()
          .start('h6').addClass('button-text').add(this.data.text).end()
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.b2b',
  name: 'ContactCard',
  extends: 'foam.u2.View',

  requires: ['foam.u2.PopupView', 'net.nanopay.b2b.model.Invoice', 'foam.comics.DAOCreateControllerView'],

  imports: [ 'business', 'stack', 'invoiceDAO' ],

  properties: [
    'popupMenu_'
  ],

    axioms: [
      foam.u2.CSS.create({
        code: function CSS() {/*
            ^ {
              display: inline-block;
            }
            ^ h5 {
                font-family: 'Roboto';
                font-size: 12px;
                font-weight: normal;
                letter-spacing: 0.2px;
                padding-bottom: 4px;
                margin: 0;
                color: #093649;
            } 
              ^ .cardContainer {
                  background-color: #ffffff;
                  padding: 20px 20px 20px 20px;
                  margin: 0;
                  width: 300px;
                  display: inline-block;
                  margin: 10px; 10px; 10px; 10px;
                  position: relative;
              }
              ^ .profilePicture{
                  width: 40px;
                  height: 40px;
                  margin-right: 20px;
                  display: inline-block;
              }
              ^ .contactInfoDiv {
                  float: bottom;
                  padding-top: 22px;
                  display:inline-block;
              }
              ^ .companyInfoDiv {
                  display: inline-block;
                  height: 40px;
              }
              ^ .contactName {
                  font-family: 'Roboto';
                  font-size: 14px;
                  font-weight: bold;
                  letter-spacing: 0.2px;
                  color: #093649;
                  padding-bottom: 10px;
                  margin: 0;
              }
              ^ .companyName {
                  width: 200px;
                  height: 16px;
                  font-family: 'Roboto';
                  font-size: 14px;
                  font-weight: 300;
                  letter-spacing: 0.2px;
                  text-align: left;
                  color: #093649;
                  margin: 0;
              }
              ^ .vendor {
                  width: 200px;
                  height: 12px;
                  opacity: 0.6;
                  font-family: 'Roboto';
                  font-size: 14px;
                  line-height: 0.86;
                  letter-spacing: 0.2px;
                  text-align: left;
                  color: #093649;
                  padding-top: 15px;
                  margin: 0;
              }
              ^ .connectionIcon {
                  width: 24px;
                  height: 24px;
                  float: right;
              }
              ^ .optionsIcon {
                  vertical-align: top;
                  float: right;
                  width: 24px;
                  height: 24px;
                  cursor: pointer;
              }
              ^ .optionsDropDown {
                padding: 0;
                z-index: 10000;
                width: 157px;
                height: 60px;
                background: white;
                opacity: 1;
                box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
                position: absolute;
              }
              ^ .optionsDropDown > div {
                width: 139px;
                height: 30px;
                padding-left: 18px;
                font-size: 14px;
                font-weight: 300;
                letter-spacing: 0.2px;
                color: #093649;
                line-height: 30px;
              }
              ^ .optionsDropDown > div:hover {
                background-color: #59aadd;
                color: white;
                cursor: pointer;
              }
              ^ .optionsDropDown::after {
                content: ' ';
                position: absolute;
                height: 0;
                width: 0;
                border: 8px solid transparent;
                border-bottom-color: white;
                -ms-transform: translate(120px, -76px);
                transform: translate(120px, -76px);
              }
              ^bottom-status{
                background: #093649;
                width: 340px;
                height: 30px;
                position: relative;
                top: -15px;
                text-align: left;
                font-weight: 100;
                margin-left: 10px;
              }
              ^bottom-status img{
                display: inline-block;
                position: relative;
                top: 3;
                right: 10;
              }
              ^bottom-status p{
                display: inline-block;
                color: #ffffff;
                position: relative;
                top: -7px;
                left: 10;
              }
          */}
      })
    ],

   methods: [
     function initE() {
       var i = this.data;
       var contactEmail = i.defaultContact.replace(/\s+/g, '').toLowerCase() + '@' + i.name.replace(/\s+/g, '').toLowerCase() + '.com';
          this.addClass(this.myClass()).start('div').addClass('cardContainer')
          .start({class:'foam.u2.tag.Image', data: i.profileImageURL}).addClass('profilePicture').end()
          .start('div').addClass('companyInfoDiv')
            .start('h2').addClass('companyName').add(i.name).end()
            .start('h2').addClass('vendor').add('Vendor').end()
          .end()
          .start('span', null, this.popupMenu_$)
            .start({class:'foam.u2.tag.Image', data: 'images/ic-options.png'}).addClass('optionsIcon')
            .end()
          .on('click', this.onClick)
          .end()
          .start('div').addClass('contactInfoDiv')
            .start('h2').addClass('contactName').add(i.defaultContact).end()
            .start('h5').add(contactEmail).end()
            .start('h5').add('012-345-6789').end()
          .end()
        .end()
        .start().addClass(this.myClass('bottom-status'))
          .start('p').add('Vendor').end()//Make dependant on partner status
          .start({class:'foam.u2.tag.Image', data: 'images/ic-connection.png'}).addClass('connectionIcon').end()
        .end();
     }
   ],

  listeners: [
    function onClick(evt) {
      var p = this.PopupView.create({
        width: 157,
        height: 60,
        x: -100,
        y: -9
      })
      p.addClass('optionsDropDown')
        .start('div').add('Create New Invoice')
          .on('click', this.onCreateInvoice)
        .end()
        .start('div').add('Create New Bill')
          .on('click', this.onCreateBill)
        .end()
      this.popupMenu_.add(p)
    },

    function onCreateInvoice() {
      var self = this;
      var view = foam.u2.ListCreateController.CreateController.create(
        null,
        this.__context__.createSubContext({
          detailView: net.nanopay.b2b.ui.InvoiceDetailView,
          back: this.stack.back.bind(this.stack),
          dao: this.invoiceDAO,
          factory: function() {
            return self.Invoice.create({fromBusinessId: self.data.id, fromBusinessName: self.data.name, toBusinessId: self.business.id, toBusinessName: self.business.name});
          }
        }));
      this.stack.push(view);
      self.remove();
    },

    function onCreateBill() {
      var self = this;
      var view = foam.u2.ListCreateController.CreateController.create(
        null,
        this.__context__.createSubContext({
          detailView: net.nanopay.b2b.ui.BillDetailView,
          back: this.stack.back.bind(this.stack),
          dao: this.invoiceDAO,
          factory: function() {
            return self.Invoice.create({toBusinessId: self.data.id, toBusinessName: self.data.name, fromBusinessId: self.business.id, fromBusinessName: self.business.name});
          }
        }));
        this.stack.push(view);
        self.remove();
    }
  ]
});

foam.CLASS({
   package: 'net.nanopay.b2b',
   name: 'ContactCardView',
   extends: 'foam.u2.View',

   documentation: 'View for displaying Contact Card',

   axioms: [
     foam.u2.CSS.create({
       code: function CSS() {/*
         ^ {
           margin: auto;
           border-radius: 2px;
           width: 1100px;
           height: 160px;
           padding-left: 25px;
         }
       */}
     })
   ],

   methods: [
     function initE() {
       this
        .select(this.data, function(partner) {
          this.addClass(this.myClass())
          .tag({class: 'net.nanopay.b2b.ContactCard'}, {data: partner});
        })
     }
   ]
 });