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
  package: 'net.nanopay.admin.ui',
  name: 'OverviewView',
  extends: 'foam.u2.View',

  css: `
    ^ {
      width: 992px;
      margin: auto;
    }
    iframe {
      width: 80%;
      height: 75vh;
    }
    h1 {
      margin-bottom: 40px;
    }
  `,

  messages: [
    {
      name: 'Title',
      message: 'Nanopay Platform Overview (PDF)'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.start().addClass(this.myClass())
        .start('h1')
          .add(this.Title)
        .end()
        .start('iframe').addClass('iframeContainer')
          .attrs({
            'src': 'https://nanopay.net/wp-content/uploads/nanopay-platform-overview.pdf'
          })
        .end()
      .end();
    }
  ]

});
