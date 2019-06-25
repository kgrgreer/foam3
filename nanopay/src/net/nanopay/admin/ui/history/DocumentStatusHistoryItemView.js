foam.CLASS({
  package: 'net.nanopay.admin.ui.history',
  name: 'DocumentStatusHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  documentation: 'View for displaying history for compliance status',

  css: `
    ^ .iconPosition {
      margin-left: -6px;
    }
    ^ .statusBox {
      margin-top: -20px;
      padding-bottom: 22px;
    }
    ^ .statusContent {
      padding-left: 40px;
    }
    ^ .statusDate {
      font-family: Roboto;
      font-size: 8px;
      line-height: 1.33;
      letter-spacing: 0.1px;
      color: #a4b3b8;
      top: 5px;
      position: relative;
    }
    ^ .statusTitle {
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .link {
      text-decoration: none;
    }
  `,

  properties: [
    {
      name: 'files',
      factory: function () {
        return {};
      }
    }
  ],

  methods: [
    function getAttributes(record) {
      var documents = record.updates.find(u => u.name == 'additionalDocuments' );
      if ( ! documents.newValue ) documents.newValue = [];

      var attributes = [];
      for ( var i = 0 ; i < documents.newValue.length ; i++ ) {
        var file = documents.newValue[i];
        if ( ! this.files[file.id] ) {
          attributes.push({
            title: 'Additional document ',
            labelText: file.filename,
            labelLink: file.address,
            icon: 'images/ic-attachment-round.svg'
          });
          this.files[file.id] = true;
        }
      }
      return attributes;
    },

    function formatDate(timestamp) {
      var locale = 'en-US';
      return timestamp.toLocaleTimeString(locale, { hour12: false }) +
        ' ' + timestamp.toLocaleString(locale, { month: 'short' }) +
        ' ' + timestamp.getDate() +
        ' ' + timestamp.getFullYear();
    },

    function outputRecord(parentView, record) {
      var attributes = this.getAttributes(record);
      for ( var i = 0 ; i < attributes.length ; i++ ) {
        var attribute = attributes[i];
        parentView
          .addClass(this.myClass())
          .style({ 'padding-left': '20px' })
          .start('div').addClass('iconPosition')
            .tag({ class: 'foam.u2.tag.Image', data: attribute.icon })
          .end()
          .start('div').addClass('statusBox')
            .start('div')
              .style({ 'padding-left': '30px' })
              .start('span').addClass('statusTitle')
                .add(attribute.title)
                .start('a')
                  .addClass('link')
                  .attrs({
                    href: attribute.labelLink,
                    target: '_blank'
                  })
                  .add(attribute.labelText)
                .end()
                .add(' added')
              .end()
            .end()
            .start('div')
              .style({ 'padding-left': '30px' })
              .start('span').addClass('statusDate')
                .add(this.formatDate(record.timestamp))
              .end()
            .end()
          .end()
      }
      return parentView;
    }
  ]
});