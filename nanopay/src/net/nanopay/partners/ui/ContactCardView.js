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
  package: 'net.nanopay.partners.ui',
  name: 'ContactCardView',
  extends: 'foam.u2.Element',

  documentation: 'View for displaying Contact Card',

  requires: [
    'net.nanopay.partners.ui.ContactCard'
  ],

  css: `
    ^ {
        margin: auto;
        border-radius: 2px;
        width: 1100px;
        height: 160px;
        padding-left: 25px;
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .select(this.data$proxy, function(partner) {
          return this.ContactCard.create({ data: partner });
        });
    }
  ]
});
