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
  package: 'net.nanopay.documents.ui',
  name: 'AcceptanceDocumentView',
  extends: 'foam.u2.View',

  requires: [
    'foam.flow.Document',
    'foam.u2.tag.TextArea'
  ],

  properties: [
    {
      name: 'preview'
    }
  ],

  css: `
    ^{
      table-layout: fixed;
      wrap: hard;
    }
  `,

  methods: [
    function initE() {
      this.onDetach(this.data$.sub(this.updatePreview));
      this.updatePreview();

      this.
        start('table').
          addClass(this.myClass()).
          start('tr').
            start('td').
              attrs({ valign: 'top' }).
              addClass(this.myClass('left')).
              start(this.TextArea, {
                rows: 20,
                cols: 60,
                onKey: true,
                data$: this.data$
              }).
              end().
            end().
            start('td').
              attrs({ valign: 'top' }).
              addClass(this.myClass('right')).
              add(this.preview$).
            end().
          end().
        end();
    }
  ],
  listeners: [
  {
    name: 'updatePreview',
    isMerged: 1000,
    code: function() {
      this.preview = this.Document.create({ markup: this.data });
    }
  }
]
});
