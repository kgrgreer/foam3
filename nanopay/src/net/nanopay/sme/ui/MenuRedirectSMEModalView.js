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
  name: 'MenuRedirectSMEModalView',
  extends: 'foam.u2.View',

  documentation: `
    View that wraps the given view with a MenuRedirectSMEModal, which redirects
    to the given menu when closed.
  `,

  requires: [
    'net.nanopay.sme.ui.MenuRedirectSMEModal'
  ],

  properties: [
    {
      class: 'String',
      name: 'menu',
    },
    {
      name: 'controllerMode'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      type: 'foam.lib.json.UnknownFObject',
      fromJSON: function fromJSON(value, ctx, prop, json) { return value; }
    }
  ],

  methods: [
    function initE() {
      this.start()
        .addClass(this.myClass())
        .add(this.MenuRedirectSMEModal.create({ menu: this.menu }, this)
          .startContext({ controllerMode: this.controllerMode })
            .tag(this.view, { redirectMenu: this.menu })
          .endContext()
        )
      .end();
    }
  ]
});