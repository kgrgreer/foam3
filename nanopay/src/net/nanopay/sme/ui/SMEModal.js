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
  name: 'SMEModal',
  extends: 'foam.u2.dialog.Popup',

  documentation: ``,

  css: `
    ^X {
      top: 24px !important;
      right: 24px !important;
    }

    ^inner {
      position: relative;
      max-height: 85vh;
    }

    ^X:hover {
      transform: scale(1.1);
    }

    ^content {
      background-color: white;
      box-shadow: 0 24px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15);
      border-radius: 3px;
    }
  `,

  properties: [
    {
      name: 'isStyled',
      value: true
    }
  ],

  methods: [
    function init() {
      var content;

      this
        .addClass(this.myClass())
        .start()
        .addClass(this.myClass('container'))
        .start()
          .addClass(this.myClass('background'))
          .on('click', this.closeable ? this.close : null)
        .end()
        .start()
          .addClass(this.myClass('inner'))
          .startContext({ data: this })
            .start(this.CLOSE_MODAL).show(this.closeable$)
              .addClass(this.myClass('X'))
            .end()
          .endContext()
          .start()
            .enableClass(this.myClass('content'), this.isStyled$)
            .call(function() { content = this; })
          .end()
        .end()
      .end();

      this.content = content;
    }
  ],

});
