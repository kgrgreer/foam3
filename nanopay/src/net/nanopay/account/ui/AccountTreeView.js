foam.CLASS({
  package: 'net.nanopay.account.ui',
  name: 'AccountTreeView',
  extends: 'foam.u2.Element',

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

  methods: [
      function initE(){
        this.addClass(this.myClass());
        this.start().addClass(this.myClass('header')).add(this.VIEW_HEADER).end();
        this.tag(this.AccountTreeCView);
      }
  ],

  /**
   * Had to make this an INNER CLASS in order to properly work with the foam.graphics.CView
   * This is because of the conflicting 'data' properties where one is used to construct the tree 
   * as detailed in foam.graphics.TreeGraph and the other is used to pass in the actual data
   */
  classes: [
    {
      name: 'AccountTreeCView',
      extends: 'net.nanopay.account.ui.AccountTreeGraph',

      implements: [
        'foam.mlang.Expressions'
      ],

      requires: [
        'foam.u2.view.TableView',
        'net.nanopay.account.Account',
        'net.nanopay.account.AggregateAccount',
      ],

      imports: [
        'accountDAO'
      ],

      properties: [
        { 
          name: 'nodeWidth',
          value: 185
        },
        {
          name: 'nodeHeight',
          value: 80
        },
        {
          name: 'padding', 
          value: 10
        },
        {
          name: 'width',
          value: 1614
        },
        {
          name: 'height',
          value: 1000
        },
        {
          name: 'x', 
          value: 0
        },
        {
          name: 'y',
          value: 0
        },
        {
          name: 'relationship',
          factory: function() {
            return net.nanopay.account.AccountAccountChildrenRelationship;
          }
        },
        {
          name: 'data',
          factory: function() {
            return this.AggregateAccount.create({ id: 0, name: ' ', denomination: 'CAD' });
          }
        },
        {
          name: 'formatNode',
          value: function() {
            // var isShadow = this.data.name.indexOf('Shadow') != -1;
            const leftPos  = -this.width/2+8;
            let type     = this.data.type.replace('Account', '');
            const treeTagColourSequence = ['#406dea', '#32bf5e', '#eedc00', '#d9170e'];
            let treeTagColourPointer = 0;

            // Account Name
            this.add(this.Label.create({color: '#1d1f21', x: leftPos, y: 7, text: this.data.name, font: '500 12px sans-serif'}));

            // Balance and Denomination Indicator
            this.data.findBalance(this.__subContext__).then(function(balance) {
              this.__subContext__.currencyDAO.find(this.data.denomination).then(function(denom) {

                let treeTagColour;
                // check parents
                if ( !balance || type === 'Aggregate' ) {
                  treeTagColour = '#9ba1a6';
                }
                // TODO: group tree tag colours by trees themselves (i.e. by roots)
                else if ( /* new tree */ false ) {
                  treeTagColour = treeTagColourSequence[treeTagColourPointer++];
                  if (treeTagColourPointer > treeTagColourSequence.length) treeTagColourPointer = 0;
                } else {
                  treeTagColour = treeTagColourSequence[treeTagColourPointer];
                }

                this.add(this.Line.create({
                  startX: -this.width/2+1,
                  startY: 0,
                  endX: -this.width/2+1,
                  endY: this.height,
                  color: treeTagColour,
                  lineWidth: 6
                }));

                const circleColour = balance && ! (type === 'Aggregate') ? '#32bf5e' : '#cbcfd4';
                this.add(foam.graphics.Circle.create({color: circleColour, x: this.width/2-14, y: this.height-14, radius: 5, border: null}));

                // Account Type
                if ( type == 'Digital' ) type = 'Virtual';
                this.add(this.Label.create({color: 'gray',  x: leftPos, y: 22, text: type + ' (' + denom.alphabeticCode + ')'}));

                const balanceColour = type == 'Aggregate' ? 'gray' : 'black';
                const balanceFont   = type == 'Aggregate' ? '12px sans-serif' : 'bold 12px sans-serif';
                this.add(this.Label.create({color: balanceColour, font: balanceFont, x: leftPos,  y: this.height-21, text: denom.format(balance)}));
              }.bind(this));
            }.bind(this));
          }
        }
      ],
    }]
});
