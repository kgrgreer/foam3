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
  name: 'DataSecurityBanner',
  extends: 'foam.u2.View',

  css: `
    ^ {
      display: flex;
      border: 1px solid /*%GREY5%*/ #f5f7fa;
      border-radius: 3px;
      background-color: white;
      padding: 12px 13px;
      box-sizing: border-box;
      align-items: center;
    }

    ^image {
      display: inline-block;
      width: 32px;
      height: 32px;
      margin-right: 8px;
    }

    ^text-container p {
      margin: 0;
      font-size: 10px;
    }

    ^title {
      font-weight: 900;
      color: /*%BLACK%*/ #1e1f21;
      padding-bottom: 4px;
    }

    ^subtitle {
      color: #8e9090;
    }
  `,

  messages: [
    { name: 'DATA_TITLE', message: 'Your safety is our top priority' },
    { name: 'DATA_SUBTITLE', message: 'Our platform uses state-of-the-art security and encryption measures when handling your data' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .start({ class: 'foam.u2.tag.Image', data: 'images/security-icon.svg' }).addClass(this.myClass('image')).end()
        .start('div').addClass(this.myClass('text-container'))
          .start('p').add(this.DATA_TITLE).addClass(this.myClass('title')).end()
          .start('p').add(this.DATA_SUBTITLE).addClass(this.myClass('subtitle')).end()
        .end();
    }
  ]
});
