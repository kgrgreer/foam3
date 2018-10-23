foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'Dashboard',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.u2.Element',
    'net.nanopay.sme.ui.dashboard.DashboardBorder',
    'net.nanopay.sme.ui.dashboard.DynamicSixButtons'
  ],

  messages: [
    { name: 'TITLE', message: 'Dashboard' },
    { name: 'SUBTITLE1', message: 'Items Requirting Action' },
    { name: 'SUBTITLE2', message: 'Recent Payables' },
    { name: 'SUBTITLE3', message: 'Latest Activity' },
    { name: 'SUBTITLE4', message: 'Recent Receivables' },
  ],

  properties: [
    {
      name: 'verE',
      class: 'Boolean'
    },
    {
      name: 'addB',
      class: 'Boolean'
    },
    {
      name: 'sync',
      class: 'Boolean'
    },
    {
      name: 'addC',
      class: 'Boolean'
    },
    {
      name: 'busP',
      class: 'Boolean'
    },
    {
      name: 'addU',
      class: 'Boolean'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var split = net.nanopay.sme.ui.dashboard.DashboardBorder.create();

      var top = this.Element.create().add(this.TITLE).tag(this.DynamicSixButtons.create(
        {
          verifyEmailBo: this.verE, addBankBo: this.addB,
          syncAccountingBo: this.sync, addContactsBo: this.addC,
          busProfileBo: this.busP, addUsersBo: this.addU
        }));
      var topL = this.Element.create().add(this.SUBTITLE1).tag(net.nanopay.contacts.ui.ContactView);
      var topR = this.Element.create().add(this.SUBTITLE2).tag(net.nanopay.contacts.ui.ContactView);
      var botL = this.Element.create().add(this.SUBTITLE3).tag(net.nanopay.contacts.ui.ContactView);
      var botR = this.Element.create().add(this.SUBTITLE4).tag(net.nanopay.contacts.ui.ContactView);

      split.topButtons.add(top);
      split.leftTopPanel.add(topL);
      split.leftBottomPanel.add(topR);
      split.rightTopPanel.add(botL);
      split.rightBottomPanel.add(botR);

      this.addClass(this.myClass()).add(split);
    }
  ]
});
