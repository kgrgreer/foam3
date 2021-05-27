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
  package: 'net.nanopay.settings',
  name: 'IntegrationView',
  extends: 'foam.u2.View',

  documentation: 'Accounting Integration Management',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'stack',
    'xeroService',
    'quickbooksService',
    'quickService'
  ],

  exports: [
    'as data'
  ],

  css: `
    ^{
      width: 1280px;
      margin: auto;
    }
    ^ .Container {
      width: 992px;
      min-height: 80px;
      padding: 20px;
      border-radius: 2px;
      background-color: white;
      box-sizing: border-box;
      margin-left: 160px;
      margin-top: 50px;
    }
    ^ .boxTitle {
      opacity: 0.6;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 20px;
      font-weight: 300;
      line-height: 20px;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
      margin: 0;
    }
    ^ .close-BTN {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      // background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: /*%BLACK%*/ #1e1f21;
      cursor: pointer;
      display: inline-block;
      margin: 0;
      float: right;
    }
    ^ .labelContent {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      min-height: 15px;
    }
    ^ .integrationImgDiv{
      width: 223px;
      height: 120px;
      border: solid 1px #dce0e7;
      display: inline-block;
      margin: 25px 20px 30px 0px;
      position: relative;
      box-sizing: border-box;
    }
    ^ .integrationImg{
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
    }
    ^ .last-integrationImgDiv{
      margin-right: 0;
    }

    ^ .centerDiv{
      margin: auto;
      text-align: center;
    }
    ^ .intergration-Input{
      width: 225px;
      height: 30px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      display: inline-block;
      margin-right: 20px;
    }
    ^ .submit-BTN{
      width: 110px;
      height: 30px;
      border-radius: 2px;
      border: solid 1px #59a5d5;
      box-sizing: border-box;
      font-size: 14px;
      line-height: 2.14;
      letter-spacing: 0.2px;
      text-align: center;
      color: #59a5d5;
      display: inline-block;
      cursor: pointer;
    }
    ^ .submit-BTN:hover{
      background-color: #59a5d5;
      color: white;
    }
    ^ .inputLine{
      margin-top: 20px;
    }
  `,
  messages: [
    { name: 'noBank', message: `No bank accounts found` },
    { name: 'noSign', message: `Not signed in` },
    { name: 'bank', message: `Bank accounts found` }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start('div').addClass('Container')
          .start('div')
            .start().addClass('labelContent').add('Connect to your accounting software and make your payment process seamlessly.').end()
            .start().addClass('integrationImgDiv')
              .start({ class: 'foam.u2.tag.Image', data: 'images/setting/integration/xero.png' }).addClass('integrationImg')
                .attrs({ srcset: 'images/setting/integration/xero@2x.png 2x, images/setting/integration/xero@3x.png 3x' })
                .on('click', this.signXero)
              .end()
            .end()
            .start().addClass('integrationImgDiv')
              .start({ class: 'foam.u2.tag.Image', data: 'images/setting/integration/qb.png' }).addClass('integrationImg')
                .attrs({ srcset: 'images/setting/integration/qb@2x.png 2x, images/setting/integration/qb@3x.png 3x' })
                .on('click', this.signQuick)
              .end()
            .end()
          .end()
          .start().addClass('labelContent').addClass('centerDiv').add('Can’t find your software? Tell us about it.').end()
          .start().addClass('centerDiv').addClass('inputLine')
            .start('input').addClass('intergration-Input').end()
            .start().add('submit').addClass('submit-BTN').end()
          .end()
        .end();
    },

    function attachSessionId(url) {
      // attach session id if available
      var sessionId = localStorage['defaultSession'];
      if ( sessionId ) {
        url += '&sessionId=' + sessionId;
      }
      return url;
    }
  ],

  listeners: [

    function signXero() {
      var url = window.location.origin + '/service/WebAgent?portRedirect=' + window.location.hash.slice(1);
      window.location = this.attachSessionId(url);
    },
    function signQuick() {
      var url = window.location.origin + '/service/quickbooksWebAgent?portRedirect=' + window.location.hash.slice(1);
      window.location = this.attachSessionId(url);
    },
  ]
});
