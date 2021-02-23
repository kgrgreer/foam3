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
  name: 'Link',
  extends: 'foam.u2.View',

  documentation: `A link.`,

  css: `
    ^ {
      display: inline-flex;
      align-items: center;
      margin-top: 16px;
    }
    ^ img {
      margin-left: 5px;
    }
  `,

  properties: [
    {
      class: 'URL',
      name: 'data',
      documentation: `The URL for the link.`
    },
    {
      class: 'String',
      name: 'text',
      documentation: `The link's text.`
    },
    {
      class: 'Boolean',
      name: 'isExternal',
      value: true,
      documentation: `Set to true to show the icon.`
    }
  ],

  constants: [
    {
      type: 'String',
      name: 'LINK_ICON',
      value: 'images/ablii/open-new.svg'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .start('a')
          .addClass('link')
          .addClass(self.myClass())
          .add(this.text)
          .on('click', function() {
            window.open(self.data);
          })
          .callIf(this.isExternal, function() {
            this
              .start('img')
                .attr('src', self.LINK_ICON)
              .end();
          })
        .end();
    }
  ]
});
