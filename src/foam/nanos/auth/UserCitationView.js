/**
 * NANOPAY CONFIDENTIAL
 *
 * [2023] nanopay Corporation
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
  package: 'foam.nanos.auth',
  name: 'UserCitationView',
  extends: 'foam.u2.CitationView',

  documentation: 'A single row in a list of users.',

  css: `
    ^summary {
      color: $black;
    }

    ^email {
      color: $grey400;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'data',
      documentation: 'Set this to the user you want to display in this row.'
    }
  ],

  methods: [
    function render() {
      this
        .addClass(this.myClass())
        .start()
          .start()
            .addClass('p-legal-light', this.myClass('summary'))
            .add(this.data.toSummary())
          .end()
          .start()
            .addClass('p-xs', this.myClass('email'))
            .add(this.data.email)
          .end()
        .end();
    }
  ]
});

