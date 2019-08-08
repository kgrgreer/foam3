foam.CLASS({
  package: 'net.nanopay.partners.ui',
  name: 'PartnersView',
  extends: 'foam.u2.View',

  documentation: 'Partners tab View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.User',
    'net.nanopay.auth.PublicUserInfo',
    'foam.nanos.auth.UserUserJunction'
  ],

  exports: [
    'as data',
    'filter',
    'filteredData',
  ],

  imports: [
    'user',
    'publicUserDAO as userDAO',
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
    ^ .contacts-button {
      width: 153px;
      height: 40px;
      color: /*%BLACK%*/ #1e1f21;
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
      color: /*%BLACK%*/ #1e1f21;
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
      color: /*%BLACK%*/ #1e1f21;
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
    ^ .show {
      margin-top: 75px;
    }
    ^ .foam-u2-ActionView-partnersModal{
      float: right;
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        return this.userDAO.limit(50).where(
            this.AND(
                this.NEQ(this.User.ID, this.user.id),
                this.EQ(this.User.GROUP, 'business')));
      }
    },
    {
      class: 'String',
      name: 'filter',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Search',
        onKey: true
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredData',
      expression: function(data, filter) {
        var self = this;
        var rtn;
        if ( data.of.id === this.PublicUserInfo.id ) {
          rtn = data.where(
            this.OR(
              this.CONTAINS_IC(this.PublicUserInfo.BUSINESS_NAME, filter),
              this.CONTAINS_IC(this.PublicUserInfo.FIRST_NAME, filter),
              this.CONTAINS_IC(this.PublicUserInfo.LAST_NAME, filter),
              this.CONTAINS_IC(this.PublicUserInfo.EMAIL, filter)));
        } else if ( data.of.id === this.User.id ) {
          rtn = data.where(
            this.OR(
              this.CONTAINS_IC(this.User.BUSINESS_NAME, filter),
              this.CONTAINS_IC(this.User.FIRST_NAME, filter),
              this.CONTAINS_IC(this.User.LAST_NAME, filter),
              this.CONTAINS_IC(this.User.EMAIL, filter)));
        } else {
          throw Error('Unsupported DAO model');
        }
        rtn.select(this.COUNT()).then(function(queryResult) {
          var count = queryResult.value;
          self.partnerCount = self.connected_button_select
              ? `${count} Connected Contacts`
              : `Showing ${count} Businesses`;
        });
        return rtn;
      },
      view: { class: 'net.nanopay.partners.ui.ContactCardView' }
    },
    'partnerCount',
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

  messages: [
    {
      name: 'PlaceholderText',
      message: 'Your partners’ business card will show up here.'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .addClass('button-container')
          .start()
            .addClass('button-div')
            .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' })
              .addClass('searchIcon')
            .end()
            .start(this.FILTER).addClass('filter-search').end()
            .startContext({ data: this })
              .start(this.PARTNERS_MODAL).addClass('blue-button').end()
            .endContext()
          .end()
          .start()
            .addClass('button-div')
            .start()
              .addClass('contacts-button')
              .add('nanopay Network')
              .enableClass(
                  'contacts-button-select',
                  this.contacts_button_select$)
              .on('click', this.nanopayNetworkOnClick)
            .end()
            .start()
              .addClass('connected-contacts-button')
              .add('Connected')
              .enableClass(
                  'connected-button-select',
                  this.connected_button_select$)
              .on('click', this.connectedOnClick)
            .end()
            .start('h5')
              .addClass('connected-contacts')
              .add(this.partnerCount$)
            .end()
          .end()
        .end()
        .start()
          .addClass('partners-container')
          .add(this.FILTERED_DATA)
        .end();
    }
  ],

  listeners: [
    {
      name: 'connectedOnClick',
      isFramed: true,
      code: function() {
        var self = this;

        // We have to do some work here to convert the UserUserJunction objects
        // into PublicUserInfo objects so that the `filteredDAO` expression
        // above has something to query properly.
        var mdao = foam.dao.MDAO.create({ of: this.PublicUserInfo });
        this.user.partners.junctionDAO
          .where(this.EQ(this.UserUserJunction.TARGET_ID, this.user.id))
          .select()
          .then(function(objs) {
            objs.array.map(function(obj) {
              mdao.put(obj.partnerInfo);
            });
            self.data = mdao.limit(50);
          })
          .catch(function(err) {
            console.log(`Couldn't get partners from junctionDAO`);
            console.log(err);
          });
        this.connected_button_select = true;
        this.contacts_button_select = false;
      }
    },
    {
      name: 'nanopayNetworkOnClick',
      isFramed: true,
      code: function() {
        this.data = this.userDAO.limit(50).where(
            this.AND(
                this.NEQ(this.User.ID, this.user.id),
                this.EQ(this.User.GROUP, 'business')));
        this.connected_button_select = false;
        this.contacts_button_select = true;
      }
    }
  ],
  
  actions: [
    {
      name: 'partnersModal',
      label: 'New Invite',
      code: function(X) {
        this.add(foam.u2.dialog.Popup.create(undefined, X).tag({ class: 'net.nanopay.partners.ui.modal.PartnerInviteModal' }));
      }
    }
  ]
});
