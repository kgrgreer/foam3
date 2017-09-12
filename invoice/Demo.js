
foam.CLASS({
  package: 'net.nanopay.invoice',
  name: 'Demo',
  extends: 'foam.u2.Element',

  documentation: 'Top-level Invoice Controller.',

  implements: [
    'foam.nanos.client.Client',
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'foam.u2.dialog.Popup'
  ],

  exports: [
    'as ctrl'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 1000px;
          margin: auto;
        }

        ^ button{
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background-color: #59aadd;
          cursor: pointer;
          text-align: center;
          color: #ffffff;
          font-family: Roboto;
          font-size: 14px;
          letter-spacing: 0.2px;
          padding-bottom: 5px;
          margin-top: 300px;
          margin-left: 50px;
          display: inline-block;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'stack',
      factory: function() { return this.Stack.create(); }
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start('button')
            .add('Approve Pop Up')
            .on('click', function(){self.onClick_approvePopup()})
          .end()

          .start('button')
            .add('Dispute Pop Up')
            .on('click', function(){self.onClick_disputePopup()})
          .end()

          .start('button')
            .add('Email Pop Up')
            .on('click', function(){self.onClick_emailPopup()})
          .end()

          .start('button')
            .add('Pay Now Pop')
            .on('click', function(){self.onClick_paynowPopup()})
          .end()

          .start('button')
            .add('Schedule Pop Up')
            .on('click', function(){self.onClick_schedulePopup()})
          .end()
        .end()
    },

    function onClick_approvePopup(){
      this.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.ApproveModal'}));
    },
    
    function onClick_disputePopup(){
      this.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.DisputeModal'}));
    },
  
    function onClick_emailPopup(){
      this.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.EmailModal'}));
    },
  
    function onClick_paynowPopup(){
      this.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.PayNowModal'}));
    },
  
    function onClick_schedulePopup(){
      this.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.ScheduleModal'}));
    },
  ]
});
  