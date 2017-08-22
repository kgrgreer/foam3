
foam.CLASS({
  package: 'net.nanopay.b2b.ui.modals',
  name: 'ModalHeader',
  extends: 'foam.u2.View',

  documentation: 'Modal Container close/title',

  imports: [
    'stack',
    'closeDialog'
  ],

  exports: [
    'closeDialog'
  ],

  properties: [
    'title'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

      ^{
        width: 448px;
        margin: auto;
      }

      ^ .Email-Container{
        width: 448px;
        height: 40.8px;
        background-color: #093649;
      }

      ^ .Email-Text{
        height: 40px;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: left;
        color: #ffffff;
        margin-left: 19px;
        margin-right: 332px;
        display: inline-block;
      }
      ^ .close-Button{
        width: 24px;
        height: 24px;
        margin-top: 5px;
        cursor: pointer;
        position: relative;
        top: 4px;
      }
      ^ .foam-u2-ActionView-close{
        position: relative;
        bottom: 50px;
        right: -390px;
        width: 50px;
        height: 40px;
        opacity: 0.01;
      }
    */}
    })
  ],
  
  methods: [
    function initE(){
    this.SUPER();
    var self = this;
    
    this
    .addClass(this.myClass())
      .start()
        .start().addClass('Message-Container')
          .start().addClass('Email-Container')
            .start().addClass('Email-Text').add(this.title).end()
            .start({class:'foam.u2.tag.Image', data: 'images/ic-cancelwhite.png'}).addClass('close-Button')
              .add(this.CLOSE)
            .end()
          .end()
        .end()
      .end()
    } 
  ],
    
  actions: [
    {
      name: 'close',
      code: function(X){
        X.closeDialog()
      }
    }
  ] 
})