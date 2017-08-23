foam.CLASS({
  package: 'net.nanopay.admin.ui.shared',
  name: 'ChipView',
  extends: 'foam.u2.View',

  documentation: 'View to display tags with labels',

  properties: [
    {
      class: 'String',
      name: 'label'
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          height: 30px;
          border-radius: 100px;
          background-color: #a4b3b8;
          margin: auto;
          position: relative;
          float: left;
          margin: 5px;
        }

        ^ .label {
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          text-align: left;
          color: #ffffff;
          padding: 8px 15px 6px 10px;
          display: table-cell;
        }

        ^ .close-chip {
          width: 15px;
          height: 15px;
          object-fit: contain;
          margin-left: 10px;
          float: right;
          margin-top: -2;
        }
      */}
    })
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start('p')
            .addClass('label')
            .add(this.label)
            .start({class:'foam.u2.tag.Image', data: 'images/ic-cancelwhite.svg'}).addClass('close-chip').end()
          .end()
        .end();
    }
  ]
});
