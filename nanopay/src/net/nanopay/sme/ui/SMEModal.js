foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SMEModal',
  extends: 'foam.u2.dialog.Popup',

  documentation: ``,

  css: `
    ^inner {
      position: relative;
    }

    ^X {
      position: absolute;
      top: -30px;
      right: -30px;
      background: 0;
      width: 24px;
      height: 24px;
      cursor: pointer;
    }

    ^content {
      box-shadow: 0 24px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15);
      border-radius: 3px;
      overflow: hidden;
      background-color: white;
    }
  `,

  methods: [
    function init() {
      var content;

      this
        .addClass(this.myClass())
        .start()
        .addClass(this.myClass('container'))
        .start()
          .addClass(this.myClass('background'))
          .on('click', this.close)
        .end()
        .start()
          .addClass(this.myClass('inner'))
          .start(this.CLOSE_MODAL)
            .addClass(this.myClass('X'))
          .end()
          .start()
            .addClass(this.myClass('content'))
            .call(function() { content = this; })
          .end()
        .end()
      .end();

      this.content = content;
    }
  ],

  actions: [
    {
      name: 'closeModal',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
