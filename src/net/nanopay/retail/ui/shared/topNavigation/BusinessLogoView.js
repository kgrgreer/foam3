foam.CLASS({
  package: 'net.nanopay.retail.ui.shared.topNavigation',
  name: 'BusinessLogoView',
  extends: 'foam.u2.View',

  documentation: 'View to display business logo and name.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 25%;
          text-align: center;
          display: inline-block;
          padding-top: 3px;
          padding-left: 50px;
        }
        ^ img {
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin: 5px;
        }
        ^ span{
          position: relative;
          font-weight: 300;
          font-size: 16px;
          margin-left: 10px;
        }
        ^business-name{
          width: 70%;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          white-space: nowrap;
          top: -16;
          height: 20px;
          display: inline-block;
          margin-left: 10px;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('div')
          .tag({class: 'foam.u2.tag.Image', data: 'ui/images/business-placeholder.png'})
          .start('div').addClass(this.myClass('business-name'))
            .add('AAA CAD Business')
          .end()
        .end();
    }
  ]
});
