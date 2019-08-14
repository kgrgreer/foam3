foam.CLASS({
  package: 'net.nanopay.account.ui',
  name: 'AccountTreeView',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO'
  ],

  requires: [
    'net.nanopay.account.ui.AccountTreeGraph',
    'foam.u2.layout.Cols'
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

    ^nav-container {
      border-radius: 3px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px #cbcfd4;
      position: fixed;
      top: 50vh;
      right: 45;
      height: 144px;
      width: 56px;
      background-color: white;
      vertical-align: middle;
    }

    ^ .foam-u2-ActionView-secondary {
      font-size: 18px;
      width: 24px;
      height: 24px;
      padding: 0;
    }

    ^ .foam-u2-ActionView + .foam-u2-ActionView {
      margin-left: 0px;
    }

    ^ .foam-u2-ActionView img {
      height: 16px;
      width: 16px;
      margin-right: 0;
    }
  `,

  messages: [
    {
      name: 'VIEW_HEADER',
      message: 'ACCOUNT HIERARCHY VIEW',
    },
  ],

  properties: [ 'cview', 'canvasContainer' ],
  actions: [
    {
      name: 'zoomIn',
      isEnabled: function(cview$scaleX, cview$scaleY) {
        return (cview$scaleX || 0) < 2 && (cview$scaleY || 0) < 2;
      },
      code: function() {
        this.cview.scaleX += 0.25;
        this.cview.scaleY += 0.25; 
      }
    },
    {
      name: 'zoomOut',
      isEnabled: function(cview$scaleX, cview$scaleY) {
        return (cview$scaleX || 0) > 0.25 && (cview$scaleY || 0) > 0.25;
      },
      code: function() {
        this.cview.scaleX -= 0.25;
        this.cview.scaleY -= 0.25;
      }
    },
    {
      name: 'home',
      isEnabled: function(canvasContainer) {
        return !! canvasContainer;
      },
      code: function() {
        var e = this.canvasContainer.el();
        e.scrollTo(this.cview.root.x * this.cview.scaleX - e.clientWidth/2, 0);
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
            .start(this.Cols).style({'flex-direction':'column','align-items':'center','justify-content':'space-around'}).addClass(this.myClass('nav-container'))
              .tag(this.HOME, {
                buttonStyle: foam.u2.ButtonStyle.SECONDARY,
                icon: 'images/ic-round-home.svg',
                label: '',
                size: foam.u2.ButtonSize.SMALL
              })
              .tag(this.ZOOM_IN, {
                buttonStyle: foam.u2.ButtonStyle.SECONDARY,
                label: '+',
                size: foam.u2.ButtonSize.SMALL
              })
              .tag(this.ZOOM_OUT, {
                buttonStyle: foam.u2.ButtonStyle.SECONDARY,
                label: '-',
                size: foam.u2.ButtonSize.SMALL
              })
            .end()
          .endContext()
          .start('div', null, this.canvasContainer$).style({overflow: 'scroll'})
            .add(self.accountDAO.where(this.AND(this.INSTANCE_OF(net.nanopay.account.AggregateAccount), this.EQ(net.nanopay.account.Account.PARENT, 0))).limit(1).select().then((a) => {
              self.cview = self.AccountTreeGraph.create({ data: a.array[0] });
              return self.cview;
            }))      
          .end()
      }
  ],
});
