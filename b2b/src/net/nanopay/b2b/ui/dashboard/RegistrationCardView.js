
foam.CLASS({
  package: 'net.nanopay.b2b',
  name: 'RegistrationCardView',
  extends: 'foam.u2.View',

  documentation: 'View displaying registration progress on dashboard view',

  properties: [
    'label',
    'progressImage',
    'completed',
    'selected'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 130px;
          height: 100px;
          margin: auto;
          background: white;
          border-radius: 2px;
          display: inline-block;
          margin-left: 30px;
          opacity: 0.7;
          border: none;
        }
        ^ img{
          padding-left: 10px;
          margin: auto;
          margin-top: 17px;
          display: inline-block;
          position: relative;
        }
        ^ h2{
          width: initial;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          color: #093649;
        }
        ^selected {
          opacity: 1;
          border: solid 2px #1cc2b7;
        }
        ^checkmark{
          left: 30;
          top: 10;
          z-index: 20;
        }
        .complete{
          opacity: 1;
          left: 30;
          top: 9;
          z-index: 1;
        }
        .checked{
          left: 30;
          top: 9;
          z-index: 1;
          opacity: 0 !important;
        }
        ^progress-image{
          right: 28;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass()).enableClass(this.myClass('selected'), this.selected)
        .start()
          .start({class: 'foam.u2.tag.Image', data: 'images/check-green-circle.png'}).addClass((this.completed ? 'complete' : 'checked'))
          .end()
          .start({class: 'foam.u2.tag.Image', data: this.progressImage}).addClass(this.myClass('progress-image'))
          .end()
          .start('h2').add(this.label).end()
        .end()
    }
  ]
});