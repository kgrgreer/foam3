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
  package: 'net.nanopay.sme.ui',
  name: 'InfoMessageContainer',
  extends: 'foam.u2.View',

  css: `
    ^ {
      padding: 15px 25px;
      border-radius: 4px;
      color: #2e227f;
      border: solid 1px #604aff;
      background-color: #f5f4ff;
    }
    ^ img {
      margin-right: 15px;
    }
    ^ .info-message {
      font-size: 12px;
    }
    ^ .title-bold {
      font-weight: 600;
    }
    ^ .info-container {
      display: inline-block;
      width: 400px;
      vertical-align: middle;
    }
  `,

  properties: [
    {
      name: 'type'
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'String',
      name: 'title'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .tag({ class: 'foam.u2.tag.Image', data: 'images/information-small-purple.svg' })
          .start().addClass('info-container')
            .start().addClass('title-bold').add(this.title).end()
            .start().addClass('info-message').add(this.message).end()
          .end()
        .end();
    }
  ]
});
