foam.CLASS({
  package: 'net.nanopay.retail.ui.shared.contentCard',
  name: 'ContentCardActionButton',
  extends: 'foam.u2.View',

  documentation: 'Action button to go beside a Content Card.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: inherit;
          height: inherit;
          background-color: #23C2b7;
          letter-spacing: 0.3px;
          color: #FFFFFF;
          border-radius: 2px;
        }

        ^:hover {
          cursor: pointer;
          background-color: #20B1A7;
        }

        ^ .container {
          display: table-cell;
          width: inherit;
          height: inherit;
          vertical-align: middle;
          text-align: center;
        }

        ^ .container img {
          width: 32px;
          height: 30px;
          margin: auto;
        }

        ^ .container p {

        }
      */}
    })
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('div').addClass('container')
          .start({class: 'foam.u2.tag.Image', data: this.data.image}).end()
          .start('p').add(this.data.title).end()
        .end()
    }
  ]
});
