foam.CLASS({
  package: 'net.nanopay.partners.ui',
  name: 'PartnersView',
  extends: 'foam.u2.View',

  documentation: 'Partners tab View',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'user',
    'userDAO'
  ],

  properties: [
    'partnerCount',
    'contactCardsView_',
    'contactCardsView',
    {
      class: 'Boolean',
      name: 'connected_button_select',
      value: false
    },
    {
      class: 'Boolean',
      name: 'contacts_button_select',
      value: true
    }
  ],


  requires: [
    'foam.dao.FnSink',
    'foam.nanos.auth.User',
    'net.nanopay.partners.ui.ContactCardView'
  ],

  messages: [
    {
      name: 'placeholderText',
      message: 'Your partners’ business card will be shown up here.'
    }
  ],

  css: `
    ^ {
      background: #EDF0F5;
      width: 100%;
    }
    ^ .partners-container {
      height:70vh;
      margin: 0 auto;
      width: 100%;
      display: block;
      overflow: scroll;
      overflow-x: hidden;
    }
    ^ .button-div {
      width: 1075px;
      height: 40px;
      margin: auto;
      margin-top: 5px;
      margin-left: 10px;
      margin-right: 10px;
      margin-bottom: 30px;
    }
    ^ .button-container {
      width: 1075px;
      height: 120px;
      margin: 0 auto;
      margin-bottom: 20px;
    }
    .invite-div {
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
    ^ .net-nanopay-ui-ActionButton {
      margin-right: 20px;
    }
    ^ .filter-search {
      width: 225px;
      height: 40px;
      border-radius: 2px;
      background-color: #ffffff;
      display: inline-block;
      vertical-align: top;
      border: 0;
      box-shadow:none;
      padding-left: 10px;
      font-size: 14px;
      padding: 10px 10px 10px 31px;
    }
    ^ .searchIcon {
      position: absolute;
      margin-left: 5px;
      margin-top: 8px;
    }
    // ^ .new-invite-button {
    //   background-color: #59AADD;
    //   width: 135px;
    //   height: 40px;
    //   border-radius: 2px;
    //   color: white;
    //   margin-left: 5px;
    //   text-align: center;
    //   vertical-align: top;
    //   display: inline-block;
    //   line-height: 40px;
    //   cursor: pointer;
    // }
    ^ .contacts-button {
      width: 153px;
      height: 40px;
      color: #093649;
      display: inline-block;
      line-height: 40px;
      text-align: center;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      border: solid 1px #1CC2B7;
      cursor: pointer;
    }
    ^ .contacts-button-select {
      background-color: #1CC2B7;
      width: 153px;
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
    ^ .connected-contacts-button {
      width: 109px;
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
    ^ .connected-button-select {
      background-color: #1CC2B7;
      color: white;
    }
    ^ .connected-contacts {
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
    ^ .show {
      margin-top: 75px;
    }
`,

  methods: [
    function initE() {
      var sub = this.user.partners.dao.listen(this.FnSink.create({
        fn: this.onDAOUpdate
      }));
      this.onunload.sub(function() {
        sub.detach();
      });

      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start('div').addClass('floating-action-button')
          .start({
            class: 'foam.u2.tag.Image',
            data: 'images/ic-plus.png'
          }).addClass('plus-icon').end()
        .end()
        .start('div').addClass('button-container')
          .start('div').addClass('button-div')
            .tag({
              class: 'net.nanopay.ui.ActionButton',
              data: {
                image: 'images/ic-filter.png',
                text: 'Filters'
              }
            })
            .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' })
              .addClass('searchIcon')
            .end()
            .start('input').addClass('filter-search')
            .end()
            // .start('div').addClass('invite-div')
            //   .start('div').addClass('new-invite-button')
            //     .add('New Invite')
            //   .end()
            // .end()
          .end()
          .start('div').addClass('button-div')
            .start('div').addClass('contacts-button')
              .add('nanopay Network').enableClass('contacts-button-select',
                this.contacts_button_select$)
              .on('click', this.nanopayNetworkOnClick)
            .end()
            .start('div').addClass('connected-contacts-button')
              .add('Connected').enableClass('connected-button-select',
                this.connected_button_select$)
              .on('click', this.connectedOnClick)
            .end()
            .start('h5').addClass('connected-contacts')
              .add(this.partnerCount$)
            .end()
          .end()
        .end()
        .start('div').addClass('partners-container')
          .start('span', null, this.contactCardsView$)
          .end()
      .end();
    },

    function createContactCardView(data) {
    if ( this.contactCardsView_ ) this.contactCardsView_.remove();
      this.contactCardsView_ = this.ContactCardView.create({
        data: data
      });

      this.contactCardsView.add(this.contactCardsView_);
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.userDAO.where(this.NEQ(this.User.ID, this.user.id))
          .select(this.COUNT()).then(function(p) {
          self.partnerCount = 'Showing ' + p.value.toString() + ' Businesses';
        });

        var partnersData = this.userDAO.where(
          this.NEQ(this.User.ID, this.user.id));
        this.createContactCardView(partnersData);
      }
    },
    {
      name: 'connectedOnClick',
      isFramed: true,
      code: function() {
        var self = this;
        this.user.partners.dao.select(this.COUNT()).then(function(p) {
          self.partnerCount = p.value.toString() + ' Connected Contacts';
        });

        var partnersData = this.user.partners.dao;
        this.createContactCardView(partnersData);
        this.connected_button_select = true;
        this.contacts_button_select = false;
      }
    },

    {
      name: 'nanopayNetworkOnClick',
      isFramed: true,
      code: function() {
        var self = this;
        this.userDAO.where(this.NEQ(this.User.ID, this.user.id))
          .select(this.COUNT()).then(function(p) {
          self.partnerCount = p.value.toString() + ' Businesses';
        });

        var partnersData = this.userDAO.where(
          this.NEQ(this.User.ID, this.user.id));
        this.createContactCardView(partnersData);
        this.connected_button_select = false;
        this.contacts_button_select = true;
      }
    }
  ]
});
