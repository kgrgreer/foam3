
foam.CLASS({
  package: 'net.nanopay.b2b.ui.payables',
  name: 'popUpDemo',
  extends: 'foam.u2.View',

  requires: ['foam.u2.dialog.Popup'],

  imports: [
    'stack'
  ],

  documentation: 'Approve Pop Up View',

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
  
  methods: [
    function initE(){
    this.SUPER();
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

      .end();
    },

  function onClick_approvePopup(){
    this.add(this.Popup.create().tag({class: 'net.nanopay.b2b.ui.modals.ApproveModal'}));
  },
  
  function onClick_disputePopup(){
    this.add(this.Popup.create().tag({class: 'net.nanopay.b2b.ui.modals.DisputeModal'}));
  },

  function onClick_emailPopup(){
    this.add(this.Popup.create().tag({class: 'net.nanopay.b2b.ui.modals.EmailModal'}));
  },

  function onClick_paynowPopup(){
    this.add(this.Popup.create().tag({class: 'net.nanopay.b2b.ui.modals.PayNowModal'}));
  },

  function onClick_schedulePopup(){
    this.add(this.Popup.create().tag({class: 'net.nanopay.b2b.ui.modals.ScheduleModal'}));
  },
  
  ] 
})