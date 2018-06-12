foam.CLASS({
  package: 'net.nanopay.partners.ui',
  name: 'ContactCard',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.PopupView',
    'net.nanopay.invoice.model.Invoice',
    'foam.comics.DAOCreateControllerView',
    'net.nanopay.invoice.ui.BillDetailView',
    'net.nanopay.invoice.ui.InvoiceDetailView'
  ],

  imports: ['business', 'stack', 'invoiceDAO'],

  properties: [
    'popupMenu_',
    'status'
  ],

  css: `
    ^ {
        display: inline-block;
        background-color: #ffffff;
        padding: 20px 20px 20px 20px;
        margin: 0;
        width: 300px;
        height: 181px;
        display: inline-block;
        margin: 10px; 10px; 10px; 10px;
        position: relative;
        vertical-align: top;
      }
    ^ h5 {
        font-family: 'Roboto';
        font-weight: normal;
        letter-spacing: 0.2px;
        padding-bottom: 4px;
        margin: 0;
        color: #093649;
    } 
    ^ .profilePicture {
        width: 50px;
        height: 50px;
        margin-right: 20px;
        display: inline-block;
    }
    ^ .profilePicture .boxless-for-drag-drop {
      width: 50px;
      height: 50px;
      display: inline-block;
      border: 0px;
      padding: 0px;
     }

    ^ .profilePicture .boxless-for-drag-drop .shopperImage {
        width: 50px;
        height: 50px;
        display: inline-block;
    }
    ^ .contactInfoDiv {
        float: bottom;
        padding-top: 36px;
    }
    ^ .contactInfoDetail {
      height: 14px;
    } 
    ^ .companyInfoDiv {
        display: inline-block;
        height: 40px;
        vertical-align: top
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
        font-size: 12px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
        // margin: 0;
    }
    ^ .companyAddress {
      width: 200px;
      height: 16px;
      font-family: 'Roboto';
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
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
        width: 80px;
        height: 20px;
        float: right;
        color: white;
        border-radius: 100px;
        background-color: #2cab70;
        text-align: center;
        padding-bottom: 0px;
        padding-top: 5px;
    }
    ^ .optionsIcon {
        background-color: white;
        vertical-align: top;
        float: right;
        width: 24px;
        height: 24px;
        cursor: pointer;
    }
    ^ .optionsDropDown {
      padding: 0px;
      z-index: 10000;
      width: 157px;
      height: 60px;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      position: absolute;
    }
    ^ .optionsDropDown > div {
      width: 157px;
      height: 30px;
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
    ^ .optionsDropDown2:after {
      -ms-transform: translate(120px, -46px);
      transform: translate(120px, -46px);
    }
    ^ .optionsDropDown-content {
      text-align: center;
    }
    ^ .bottom-status {
      background: #093649;
      width: 340px;
      height: 30px;
      position: relative;
      top: -15px;
      text-align: left;
      font-weight: 100;
      margin-left: 10px;
    }
    ^ .bottom-status img {
      display: inline-block;
      position: relative;
      top: 3;
      right: 10;
    }
    ^ .bottom-status p {
      display: inline-block;
      color: #093649;
      position: relative;
      top: -7px;
      left: 10;
    }
  `,

  methods: [
    function initE() {
      var i = this.data;
      var self = this;
      // check parters connection status
      i.partnered.dao.find(ctrl.user.id).then(function(res) {
        if ( typeof res !== 'undefined' ) {
          self.status = 'connected';
        }
      });

      this.addClass(this.myClass())
        .start({
          class: 'foam.nanos.auth.ProfilePictureView',
          ProfilePictureImage$: i.businessProfilePicture$,
          placeholderImage: 'images/business-placeholder.png',
          uploadHidden: true,
          boxHidden: true
        }).addClass('profilePicture').end()
        .start('div').addClass('companyInfoDiv')
          .start('h2').addClass('companyName')
            .add(i.businessName ? i.businessName : '  ')
          .end()
          .start('h2').addClass('companyAddress').add(this.getAddress()).end()
          .start('h2').addClass('companyAddress')
            .add(this.getRegionCountry())
          .end()
          .start('h2').addClass('companyAddress')
            .add(i.businessAddress.postalCode ?
              i.businessAddress.postalCode : '  ')
          .end()
        .end()
        .start('span', null, this.popupMenu_$)
          .start({
            class: 'foam.u2.tag.Image',
            data: 'images/ic-options.png'
            }).addClass('optionsIcon').on('click', this.onClick)
          .end()
        .end()
        .start('div').addClass('contactInfoDiv')
          .start('h2').addClass('contactName')
            .add(i.firstName + ' ' + i.lastName).end()
          .start('h5').addClass('contactInfoDetail').add(i.email).end()
          .start('h5').addClass('contactInfoDetail')
            .add(i.businessPhone.number ? i.businessPhone.number : '  ')
          .end()
        .end()
        .start().addClass(this.myClass('bottom-status'))
          .start('h5')
            .add(this.status$).enableClass('connectionIcon', this.status$)
          .end()
        .end();
    },

    function getAddress() {
      var i = this.data.businessAddress;
      if ( i.streetName && i.streetNumber ) {
        if ( i.suite ) {
          var fullAddress = i.suite + ', '
          + i.getAddress() + ', ' + i.city;
          return fullAddress;
        } else {
          var fullAddress = i.getAddress() + ', '
          + i.city;
          return fullAddress;
        }
      } else {
        return '  ';
      }
    },

    function getRegionCountry() {
      var i = this.data.businessAddress;
      if ( i.regionId && i.countryId ) {
        return i.regionId + ', ' + i.countryId;
      } else if ( i.regionId ) {
        return regionId;
      } else if ( i.countryId ) {
        return i.countryId;
      } else {
      return '  ';
    }
  }
],

  listeners: [
    function onClick(evt) {
      if ( this.status === 'connected' ) {
        var p = this.PopupView.create({
          height: 60,
          x: - 110,
          y: - 7,
          padding: 0.01,
        });
        p.addClass('optionsDropDown')
        .start('div').addClass('optionsDropDown-content')
          .add('Create New Invoice')
          .on('click', this.onCreateInvoice)
        .end()
        .start('div').addClass('optionsDropDown-content')
          .add('Create New Bill')
          .on('click', this.onCreateBill)
        .end();
      } else {
        var p = this.PopupView.create({
          height: 30,
          x: - 110,
          y: - 7,
          padding: 0.01,
        });
        // optionsDropDown2 is to set the postion of the transform arrow for connection dropdown
        p.addClass('optionsDropDown').addClass('optionsDropDown2')
        .start('div').addClass('optionsDropDown-content')
          .add('Connect')
          .on('click', this.onClickConnect)
        .end();
      }
      this.popupMenu_.add(p);
    },

    function onCreateInvoice() {
      var view = this.InvoiceDetailView.create({
        userList: this.data.id
      });
      this.stack.push(view);
      self.remove();
    },

    function onCreateBill() {
      var view = this.BillDetailView.create({
        userList: this.data.id
      });
      this.stack.push(view);
      self.remove();
    },

    function onClickConnect() {
    }
  ]
});
