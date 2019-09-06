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
    'foam.u2.layout.Cols',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.AggregateAccount',
    'foam.graphics.GreekView'
  ],

  documentation: `
    A customized Tree View for accounts based on the Liquid design
  `,

  css: `
    ^header {
      border-bottom: solid 1px #e7eaec;
      height: 39px;
      width: 100%;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
      color: #1e1f21;
    }

    ^title {
      left: 45%;
      position: absolute;
    }

    ^selector {
      padding-left: 16px;
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

  properties: [ 
    {
      class: 'Reference',
      name: 'accounts',
      of: 'net.nanopay.account.Account',
      visibilityExpression: function(canvasContainer) {
        return !! canvasContainer ? foam.u2.Visibility.RW : foam.u2.Visibility.RO;
      },
      postSet: function(_, n){
        this.accountDAO.find(n).then(account => {
          var absolutePositionNode = this.cview.view.root.findNodeAbsolutePositionByName(account.name,0,0);

          var viewportPosition = {
            x: absolutePositionNode.x,
            y: absolutePositionNode.y
          }

          this.cview.viewPortPosition = viewportPosition;
        })
      },
      view: function(_, x) {
        var self = x.data;
        var prop = this;
        var v = foam.u2.view.ReferenceView.create(null, x);
        v.fromProperty(prop);
        v.dao = v.dao.where(self.OR(
          foam.mlang.predicate.IsClassOf.create({
            targetClass: self.DigitalAccount
          }),
          foam.mlang.predicate.IsClassOf.create({
            targetClass: self.AggregateAccount
          })
        ));
        return v;
      }
    },
    'cview',
    'canvasContainer',
  ],
  actions: [
    {
      name: 'zoomIn',
      code: function() {
        this.cview.scale *= 1.25;
        this.cview.scale *= 1.25;
      }
    },
    {
      name: 'zoomOut',
      isEnabled: function(cview$scale) {
        return (cview$scale || 0) > 0 && (cview$scale || 0) > 0;
      },
      code: function() {
        this.cview.scale /= 1.25;
        this.cview.scale /= 1.25;
      }
    },
    {
      name: 'home',
      isEnabled: function(canvasContainer) {
        return !! canvasContainer;
      },
      code: function() {
        // var e = this.canvasContainer.el();
        // e.scrollTo(this.cview.root.x - e.clientWidth/2, 0);
      }
    }
  ],

  methods: [
      function initE(){
        var self = this;

        this.addClass(this.myClass());
        this
          .start(this.Cols).style({ 'justify-content': 'flex-start', 'align-items': 'center'}).addClass(this.myClass('header'))
            .startContext({data: this})
              .start().addClass(this.myClass('selector'))
                .add(this.ACCOUNTS)
              .end()
            .endContext()
            .start().addClass(this.myClass('title'))
              .add(this.VIEW_HEADER)
            .end()
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
          .start('div', null, this.canvasContainer$).addClass(this.myClass('canvas-container'))
            .add(self.accountDAO.where(this.AND(this.INSTANCE_OF(net.nanopay.account.AggregateAccount), this.EQ(net.nanopay.account.Account.PARENT, 0))).limit(1).select().then((a) => {
              var v = self.AccountTreeGraph.create({ data: a.array[0] });
              self.cview = self.GreekView.create({
                view: v,
                height$: v.height$,
                width: self.el().clientWidth,
                viewBorder: 'black',
                navBorder: 'red'
              });
              return self.cview;
            })
          )      
          .end()
      }
  ],
});
