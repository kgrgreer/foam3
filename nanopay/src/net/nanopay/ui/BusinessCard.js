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
  package: 'net.nanopay.ui',
  name: 'BusinessCard',
  extends: 'foam.u2.View',

  documentation: 'Display business information & user info.',

  css: `
    ^ {
      width: 400px;
    }
    ^ .boxless-for-drag-drop{
      border: none !important;
      height: 70px !important;
    }
    ^ .foam-nanos-auth-ProfilePictureView{
      width: 100px;
      display: inline-block;
    }
    ^ .container-1{
      display: inline-block;
      position: relative;
      bottom: 10px;
      left: -15px;
    }
    ^ .container-2{
      margin-left: 15px;
    }
    ^ .companyName{
      margin-bottom: 10px;
    }
    ^ .companyAddress{
      font-size: 12px;
      font-weight: 400;
      width: 200px;
    }
    ^ .foam-nanos-auth-ProfilePictureView .shopperImage{
      width: 50px;
      height: 50px;
    }
    ^ .generic-status{
      float: right;
    }
    ^ .userName{
      font-size: 14px;
      font-weight: bold;
    }
    ^ .job-title{
      font-size: 12px;
      font-weight: normal;
      color: /*%BLACK%*/ #1e1f21;
      opacity: 0.7;
      margin-top: 5px;
    }

    ^ .Invoice-Status-Paid{
      background-color: #2cab70;
    }
  `,

  properties: [
    {
      name: 'business',
      value: {}
    },
    'address',
    'profileImg'
  ],

  methods: [
    function initE() {
      var self = this;

      this.business$.sub(function() {
        self.profileImg = self.business.businessProfilePicture;
      });

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('profileImgDiv')
            .tag({
              class: 'foam.nanos.auth.ProfilePictureView',
              placeholderImage: 'images/business-placeholder.png',
              ProfilePictureImage$: self.profileImg$,
              uploadHidden: true,
              boxHidden: true
            })
            .start().addClass('container-1')
              .start().addClass('companyName')
                .add(this.business$.map(function(a) {
                  return a.businessName;
                }))
              .end()
              .start().addClass('companyAddress')
                .add(this.business$.map(function(a) {
                  return self.formatAddress(a.Address);
                }))
              .end()
            .end()
          .end()
          .start().addClass('container-2')
            .start().addClass('userName')
              .add(this.business$.map(function(a) {
                return a.firstName + ' ' + a.lastName;
              }))
            .end()
            .start().addClass('job-title')
              .add(this.business$.map(function(a) {
                return a.jobTitle;
              }))
            .end()
            .start().addClass('companyAddress').style({ 'margin': '15px 0px;'})
              .add(this.business$.map(function(a) {
                return a.email;
              }))
              .br()
              .add(this.business$.map(function(a) {
                if ( ! a.phoneNumber ) return;
                return a.phoneNumber;
              }))
            .end()
            .start().addClass('companyName').addClass('inline')
              .add('Business')
            .end()
            .start().addClass('generic-status').addClass('Invoice-Status-Paid')
             .add(this.business$.map(function(a) {
               if( ! a.status ) return;
               return a.status.label;
              }))
            .end()
          .end()
        .end()
    },

    function formatAddress(address) {
      if ( ! address ) return;

      var formattedAddress;
      if ( address.streetNumber ) {
        formattedAddress = address.streetNumber + ' ' + address.streetName + ', ' + address.city + ', ' + address.regionId + ', ' + address.countryId + ', ' + address.postalCode;

        // prefix suite number to address
        if ( address.suite ) {
          formattedAddress = address.suite + '-' + formattedAddress;
        }
      }

      return formattedAddress;
    }
  ]
});
