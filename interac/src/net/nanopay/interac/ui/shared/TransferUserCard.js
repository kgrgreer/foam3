foam.CLASS({
  package: 'net.nanopay.interac.ui.shared',
  name: 'TransferUserCard',
  extends: 'foam.u2.View',

  documentation: 'User card used in transfers',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .userContainer {
          box-sizing: border-box;
          border-radius: 2px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          margin-bottom: 20px;

          width: 300px;
          padding: 20px;
        }

        ^ .userRow {
          margin-bottom: 20px;
        }

        ^ .userName {
          display: inline-block;
          margin-bottom: 0 !important;
        }

        ^ .nationalityContainer {
          display: inline-block;
          vertical-align: top;
          float: right;
        }

        ^ .nationalityLabel {
          display: inline-block;
          vertical-align: top;
          margin: 0;
          margin-left: 5px;
        }

        ^ .pDetails {
          opacity: 0.7;
          font-size: 12px;
          line-height: 1.17;
          letter-spacing: 0.2px;
          color: #093649;
        }

        ^ .bold {
          font-weight: bold;
          margin-bottom: 20px;
          letter-spacing: 0.4px;
        }
      */}
    })
  ],

  properties: [
    'user'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('userContainer')
          .start('div').addClass('userRow')
            .start('p').addClass('bold').addClass('userName').add(this.user.name).end()
            .start('div').addClass('nationalityContainer')
              .start({class: 'foam.u2.tag.Image', data: this.user.flag}).end() // TODO: Make it dynamic
              .start('p').addClass('pDetails').addClass('nationalityLabel').add(this.user.nationality).end() // TODO: Make it dyamic.
            .end()
          .end()
          .start('p').addClass('pDetails').add(this.user.email).end()
          .start('p').addClass('pDetails').add(this.user.tel).end()
          .start('p').addClass('pDetails').add(this.user.address).end()
        .end();
    }
  ]
});
