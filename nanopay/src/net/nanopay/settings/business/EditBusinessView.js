/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'EditBusinessView',
  extends: 'foam.u2.View',

  documentation: 'Edit business view.',

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'net.nanopay.retail.model.Business'
  ],

  imports: [
    'addressDAO',
    'businessSectorDAO',
    'businessTypeDAO',
    'countryDAO',
    'notify',
    'regionDAO',
    'stack',
    'user',
    'userDAO'
  ],

  exports: [
    'as view'
  ],

  css: `
    ^{
      width: 100%;
      margin: auto;
      background-color: /*%GREY5%*/ #f5f7fa;
    }
    ^ .settingsBar {
      width: 100%;
      height: 40px;
      line-height: 40px;
      background-color: #FFFFFF;
      margin-bottom: 20px;
    }
    ^ .settingsBarContainer {
      width: 992px;
      margin: auto;
    }
    ^ .foam-u2-ActionView {
      opacity: 0.6;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
      padding: 0;
      padding-left: 30px;
      display: inline-block;
      cursor: pointer;
      margin: 0;
      border: none;
      background: transparent;
      outline: none;
      line-height: 40px;
    }
    ^ .foam-u2-ActionView-personalProfile {
      padding-left: 0;
    }
    ^ .foam-u2-ActionView:hover {
      background: white;
      opacity: 1;
    }
    ^ .editBusinessContainer {
      width: 992px;
      margin: auto;
    }
    ^ h2{
      opacity: 0.6;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-bottom: 50px;
    }
    ^registration-container{
      background: white;
      padding: 4px 25px;
      margin-bottom: 20px;
    }
    ^ h3{
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
    }
    ^ img{
      display: inline-block;
    }
    ^upload-button{
      display: inline-block;
      width: 135px;
      height: 40px;
      border-radius: 2px;
      background: white;
      border: solid 1px #59a5d5;
      color: #59a5d5;
      position: relative;
      top: -35;
      right: -40;
      font-size: 14px;
      cursor: pointer;
      outline: 0;
    }
    ^ p{
      font-size: 10px;
      color: /*%BLACK%*/ #1e1f21;
      font-weight: 300;
      display: inline-block;
      position: relative;
      right: 100;
    }
    ^ input{
      width: 100%;
      height: 40px;
      margin-top: 7px;
      padding: 10px;
    }
    ^ label{
      font-weight: 300;
      font-size: 14px;
      color: /*%BLACK%*/ #1e1f21;
    }
    .input-container{
      width: 46%;
      display: inline-block;
      margin-bottom: 20px;
      margin-right: 15px;
    }
    .input-container-quarter{
      width: 13%;
      display: inline-block;
      margin-bottom: 20px;
      margin-right: 15px;
    }
    .input-container-third{
      width: 30%;
      display: inline-block;
      margin-bottom: 20px;
      margin-right: 15px;
    }
    .dropdown{
      width: 200px;
      height: 200px;
      background: black;
    }
    ^ .foam-u2-tag-Select{
      width: 100%;
      background: white;
      border: 1px solid lightgrey;
      margin-top: 5px;
    }
    ^ .foam-u2-ActionView-saveBusiness{
      width: 100%;
      height: 40px;
      background: #59aadd;
      margin-bottom: 15px;
      outline: 0;
      border: 0;
      font-size: 14px;
      color: white;
      cursor: pointer;
      opacity: 1;
    }
    ^ .foam-u2-ActionView-saveBusiness:hover {
      background-color: #59aadd;
    }
    ^ .foam-u2-ActionView-closeButton {
      width: 24px;
      height: 35px;
      margin: 0;
      cursor: pointer;
      display: inline-block;
      float: right;
      outline: 0;
      border: none;
      background: transparent;
      box-shadow: none;
      padding-top: 15px;
      margin-right: 15px;
    }
    ^ .foam-u2-ActionView-closeButton:hover {
      background: transparent;
      background-color: transparent;
    }
    ^ .input-companytype-width select {
      width: 100% !important;
    }

    ^ .input-businesssector-width select {
      width: 100% !important;
    }
    ^ .input-businesssector-width select {
      width: 100% !important;
    }
    ^ .business-image-container {
      padding-bottom: 20px;
    }
  `,

  properties:[
    {
      name: 'dragActive',
      value: false
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.data = this.user;

      this
        .addClass(this.myClass())
        .on('dragover', this.onDragOver)
        .on('drop', this.onDropOut)
        .start()
          .start('div').addClass('editBusinessContainer')
            .start('h2').add('Edit Business profile').end()
            .start(this.CLOSE_BUTTON).end()
            .start().addClass(this.myClass('registration-container'))
              .start('h3').add('Business information').end()
              .start().addClass('business-image-container')
              .tag({
                class: 'foam.nanos.auth.ProfilePictureView',
                data$: this.user.businessProfilePicture$,
                placeholderImage: 'images/business-placeholder.png',
                uploadHidden: false,
                dragActive$: this.dragActive$
              })
              .end()
              .start().addClass('input-container')
                .start('label').add('Business Name *').end()
                .start(this.User.BUSINESS_NAME).end()
              .end()
              .start().addClass('input-container').addClass('input-companytype-width')
                .start('label').add('Business Type').end()
                .start(this.User.BUSINESS_TYPE_ID).end()
              .end()
              .start().addClass('input-container').addClass('input-businesssector-width')
                .start('label').add('Business Sector').end()
                .start(this.User.BUSINESS_SECTOR_ID).end()
              .end()
              .start().addClass('input-container')
                .start('label').add('Website').end()
                .start(this.User.WEBSITE).end()
              .end()
              .start().addClass('input-container')
                .start('label').add('Business Identification No. *').end()
                .start(this.User.BUSINESS_REGISTRATION_NUMBER).end()
              .end()
              .start().addClass('input-container')
                .start('label').add('Issuing Authority *').end()
                .start(this.User.BUSINESS_REGISTRATION_AUTHORITY).end()
              .end()
              .start('h3').add('Business Address *').end()
              .tag(this.User.BUSINESS_ADDRESS, {showVerified: false,showType: false})
              .start(this.SAVE_BUSINESS).addClass('foam-u2-ActionView-saveBusiness').end()
            .end()
          .end()
        .end()
    }
  ],

  messages: [
    { name: 'noInformation', message: 'Please fill out all necessary fields before proceeding.' },
    { name: 'invalidPostal', message: 'Invalid postal code entry.' },
    { name: 'structAddress', message: 'Enter street number and name for structured address.' },
    { name: 'nonStructAddress', message: 'Enter an address' },
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'images/cancel-x.png',
      code: function (X) {
        X.stack.back();
      }
    },
    {
      name: 'saveBusiness',
      label: 'Save',
      code: function(X) {
        var view = X.view;
        var address = this.address;
        address.postalCode = address.postalCode.toUpperCase().replace(/\s/g, '');
        if ( address.structured ) {
          if ( ! address.streetNumber ) {
            X.notify(view.structAddress, '', foam.log.LogLevel.ERROR, true);
            return;
          }
        } else {
          if ( ! address.address1 ) {
            X.notify(view.nonStructAddress, '', foam.log.LogLevel.ERROR, true);
            return;
          }
        }

        if ( ! /^(?!.*[DFIOQU])[A-VXY][0-9][A-Z][0-9][A-Z][0-9]$/.test(address.postalCode) ) {
          X.notify(view.invalidPostal, '', foam.log.LogLevel.ERROR, true);
          return;
        }

        if ( ! this.businessName || ! this.businessIdentificationNumber || ! this.issuingAuthority || ! address.city ) {
          X.notify(view.noInformation, '', foam.log.LogLevel.ERROR, true);
          return;
        }

        this.organization = this.businessName;
        X.userDAO.put(this).then(function(a) {
          X.stack.push({ class:'net.nanopay.settings.business.BusinessProfileView' })
        })
      }
    }
  ],

  listeners:[
    function onDropOut(e) {
      e.preventDefault();
      this.dragActive = false;
    },
    
    function onDragOver(e) {
      this.dragActive = true;
      e.preventDefault();
    }
  ]
});
