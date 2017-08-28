foam.CLASS({
  package: 'net.nanopay.interac.ui.etransfer',
  name: 'TransferDetails',
  extends: 'foam.u2.View',

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext'
  ],

  exports: [ 'as data' ],

  documentation: 'Interac transfer details',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .topRow {
          width: 100%;
          height: 40px;
          box-sizing: border-box;
          margin-bottom: 20px;
        }

        ^ .interacImage {
          width: 90px;
          height: 40px;
          object-fit: contain;
          float: right;
        }

        ^ p {
          margin: 0;
          color: #093649;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          margin-bottom: 8;
        }

        ^ .bold {
          font-weight: bold;
          margin-bottom: 20px;
          letter-spacing: 0.4px;
          text-align: left;
        }

        ^ .detailsCol {
          display: inline-block;
          vertical-align: top;
          width: 320px;
        }

        ^ .property-note {
          box-sizing: border-box;
          width: 320px;
          height: 66px;
          overflow-y: scroll;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          resize: vertical;
        }

        ^ .divider {
          display: inline-block;
          vertical-align: top;
          width: 2px;
          height: 100%;
          box-sizing: border-box;
          background-color: #a4b3b8;
          opacity: 0.3;
          margin: 0 51px;
        }

        ^ .fromToCol {
          display: inline-block;
          vertical-align: top;
          width: 300px;
        }

        ^ .fromToCard {
          box-sizing: border-box;
          padding: 20px;
          width: 300px;
          border-radius: 2px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          margin-bottom: 20px;
        }
      */}
    })
  ],

  messages: [
    { name: 'TransferFromLabel', message: 'Transfer from' },
    { name: 'AccountLabel', message: 'Account' },
    { name: 'ToLabel', message: 'To' },
    { name: 'FromLabel', message: 'From' },
    { name: 'PayeeLabel', message: 'Payee' },
    { name: 'PurposeLabel', message: 'Purpose of Transfer' },
    { name: 'NoteLabel', message: 'Note (Optional)' }
  ],

  properties: [
    {
      class: 'String',
      name: 'note',
      postSet: function(oldValue, newValue) {
        this.viewData.note = newValue;
      },
      view: { class: 'foam.u2.tag.TextArea' }
    }
  ],

  methods: [
    function init() {
      this.errors_$.sub(this.errorsUpdate);
      this.errorsUpdate();
    },

    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('topRow')
          .start({class: 'foam.u2.tag.Image', data: 'images/interac.png'})
            .attrs({srcset: 'images/interac@2x.png 2x, images/interac@3x.png 3x'})
            .addClass('interacImage')
          .end()
        .end()
        .start('div').addClass('detailsCol')
          .start('p').add(this.TransferFromLabel).addClass('bold').end()
          .start('p').add(this.AccountLabel).end()
          .start('p').add(this.ToLabel).addClass('bold').end()
          .start('p').add(this.PayeeLabel).end()
          .start('p').add(this.PurposeLabel).end()
          .start('p').add(this.NoteLabel).end()
          .tag(this.NOTE, { onKey: true })
        .end()
        .start('div').addClass('divider').end()
        .start('div').addClass('fromToCol')
          .start('p').add(this.FromLabel).addClass('bold').end()
          .start('p').add(this.ToLabel).addClass('bold').end()
        .end();
    }
  ],

  listeners: [
    {
      name: 'errorsUpdate',
      code: function() {
        this.errors = this.errors_;
      }
    }
  ]
});
