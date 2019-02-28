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

^left {
}
^right {
}`,

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
              start(this.TextArea, { rows: 20, cols: 70, onKey: true, data$: this.data$ }).
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
