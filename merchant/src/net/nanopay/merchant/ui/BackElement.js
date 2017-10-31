foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'BackElement',
  extends: 'foam.u2.Element',

  documentation: 'Back arrow with back label',

  imports: [
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        .foam-u2-ActionView-back {
          opacity: 0.01;
          width: 100px;
          height: 45px;
          position: relative;
          right: 55px;
        }
        ^back{
          display: inline-block;
        }
        ^ img{
          height: 25px;
          width: 25px;
        }
        ^ p{
          display: inline-block;
          position: relative;
          bottom: 8px;
          left: 24px;
        }
      */
      }
    })
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start().addClass(this.myClass('back'))
            .attrs({ 'aria-hidden': true })
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-arrow-left.png' })
          .end()
          .start('p').add('Back').end()
          .add(this.BACK)
        .end()
    }
  ],

  actions: [
    {
      name: 'back',
      label: '',
      code: function(X){
        X.stack.back();
      }
    }
  ]
});