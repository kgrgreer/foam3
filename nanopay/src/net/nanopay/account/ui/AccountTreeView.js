foam.CLASS({
  package: 'net.nanopay.account.ui',
  name: 'AccountTreeView',
  extends: 'foam.u2.Element',

  requires: [
    'net.nanopay.account.ui.AccountTreeGraph'
  ],

  documentation: `
    A customized Tree View for accounts based on the Liquid design
  `,

  css: `
    ^header {
      border-bottom: solid 1px #e7eaec;
      height: 39px;
      width: 100%;
      text-align: center;
      padding-top: 12px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
      color: #1e1f21;
    }
  `,

  messages: [
    {
      name: 'VIEW_HEADER',
      message: 'ACCOUNT HIERARCHY VIEW',
    },
  ],

  properties: [ 'cview' ],
  actions: [
    {
      name: 'zoomIn',
      code: function() {
        this.cview.scaleX += 0.25;
        this.cview.scaleY += 0.25; 
      }
    },
    {
      name: 'zoomOut',
      code: function() {
        this.cview.scaleX -= 0.25;
        this.cview.scaleY -= 0.25;
      }
    }
  ],

  methods: [
      function initE(){
        var self = this;

        this.addClass(this.myClass());
        this
          .start().addClass(this.myClass('header'))
            .add(this.VIEW_HEADER)
          .end()
          .startContext({data: this})
            .start().add(this.ZOOM_IN).end()
            .start().add(this.ZOOM_OUT).end()
          .endContext()
          .start()
            .tag(self.AccountTreeGraph, null, self.cview$)
          .end()
      }
  ],
});
