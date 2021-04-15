/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.account.ui',
  name: 'AccountTreeView',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'accountHierarchyService',
    'user'
  ],

  requires: [
    'net.nanopay.account.ui.AccountTreeGraph',
    'foam.u2.layout.Cols',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.AggregateAccount',
    'net.nanopay.account.SecuritiesAccount',
    'foam.graphics.ZoomMapView'
  ],

  documentation: `
    A customized Tree View for accounts based on the Liquid design
  `,

  css: `
    ^header {
      box-sizing: border-box;
      height: 51px;
      border-bottom: solid 1px #e7eaec;
      width: 100%;

      display: flex;
      justify-content: center;
      align-items: center;
    }

    ^container-selectors {
      border-bottom: solid 1px #e7eaec;
    }

    ^selector {
      width: 50%;
      height: 50px;
    }

    ^selector:first-child {
      border-right: solid 1px #e7eaec;
    }

    ^selector .foam-u2-tag-Select {
      width: 100%;
      height: 100%;
      border: none;
      text-indent: 16px;

      cursor: pointer;
    }

    ^selector .foam-u2-tag-Select:focus {
      border: none;
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

    ^ .foam-u2-ActionView-tertiary {
      font-size: 18px;
      width: 24px;
      height: 24px;
      padding: 0;
      border-radius: 3px;
    }

    ^ .foam-u2-ActionView-tertiary:focus {
      border-bottom-color: transparent;
    }

    ^ .foam-u2-ActionView-tertiary:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }

    ^ .foam-u2-ActionView + .foam-u2-ActionView {
      margin-left: 0px;
    }

    ^ .foam-u2-ActionView img {
      height: 16px;
      width: 16px;
      margin-right: 0;
    }

    ^container-message {
      padding: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    ^message-select-root {
      margin: 0;
      font-size: 14px;
    }
  `,

  messages: [
    {
      name: 'VIEW_HEADER',
      message: 'Account Hierarchy View',
    },
    {
      name: 'MESSAGE_SELECT_ROOT',
      message: 'Please select a base account'
    }
  ],

  classes: [
    {
      // TODO: Consider moving this somewhere else.
      name: 'AnimateTo',
      properties: [
        'animatedSlot',
        'destValue',
        'ms',
        {
          name: 'startTime_',
          factory: function() { return new Date() }
        }
      ],
      listeners: [
        {
          name: 'doAnimation',
          isFramed: true,
          code: function() {
            var timeRemaining = this.ms - (Date.now() - this.startTime_.getTime());
            if ( timeRemaining < 0 ) {
              this.animatedSlot.set(this.destValue);
            } else {
              var delta = this.destValue - this.animatedSlot.get();
              this.animatedSlot.set(this.animatedSlot.get() + delta * 0.5);
              this.doAnimation();
            }
          }
        }
      ]
    }
  ],

  properties: [
    {
      name: 'childAccounts',
      documentation: 'array for ChoiceView choices',
      factory: function() {
        return [];
      }
    },
    {
      name: 'highlightedAccount',
      documentation: 'account id that has been selected through ChoiceView',
      postSet: function(o, n) {
        if ( ! n ) return;
        this.scrollToAccount(n);
      }
    },
    {
      class: 'Reference',
      name: 'selectedRoot',
      of :'net.nanopay.account.Account'
    },
    'cview',
    'canvasContainer',
  ],

  methods: [
    function initE(){
      this.accountDAO = this.accountDAO.where(foam.mlang.predicate.Eq.create({
        arg1: net.nanopay.account.Account.LIFECYCLE_STATE,
        arg2: foam.nanos.auth.LifecycleState.ACTIVE
      }));

      var self = this;
      // sub to selected root
      this.onDetach(this.selectedRoot$.sub(this.rootChanged));

      this.addClass(this.myClass());
      this
        .add(this.accountHierarchyService.getViewableRootAccounts(this.__subContext__, this.user.id).then(roots => {          
          var rootChoices = [];

          roots.forEach((root) => {
            rootChoices.push([root.id, root.toSummary()]);
          });

          this.selectedRoot =  rootChoices[0][0];

          return self.E()
        .start(this.Cols).addClass(this.myClass('header'))
          .start().addClass(this.myClass('title'))
            .add(this.VIEW_HEADER)
          .end()
        .end()
        .start(this.Cols).addClass(this.myClass('container-selectors'))
          .startContext({data: this})
            .start().addClass(this.myClass('selector'))
              .start({
                class: 'foam.u2.view.ChoiceView',
                choices: rootChoices,
                data$: this.selectedRoot$,
                placeholder: 'Select Base Account'
              }).end()
            .end()
            .start().addClass(this.myClass('selector'))
              .start({
                class: 'foam.u2.view.ChoiceView',
                mode$: this.selectedRoot$.map((root) => {
                  return root ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.DISABLED;
                }),
                choices$: this.childAccounts$,
                data$: this.highlightedAccount$,
                placeholder: 'Search For An Account'
              }).end()
            .end()
          .endContext()
        .end()
        .startContext({data: this})
          .start(this.Cols)
            .style({'flex-direction':'column','align-items':'center','justify-content':'space-around'})
            .addClass(this.myClass('nav-container'))
            .show(this.selectedRoot$)
            .tag(this.HOME, {
              buttonStyle: foam.u2.ButtonStyle.TERTIARY,
              icon: 'images/ic-round-home.svg',
              label: '',
              size: foam.u2.ButtonSize.SMALL
            })
            .tag(this.ZOOM_IN, {
              buttonStyle: foam.u2.ButtonStyle.TERTIARY,
              label: '+',
              size: foam.u2.ButtonSize.SMALL
            })
            .tag(this.ZOOM_OUT, {
              buttonStyle: foam.u2.ButtonStyle.TERTIARY,
              label: '-',
              size: foam.u2.ButtonSize.SMALL
            })
          .end()
        .endContext()
        .start('div', null, this.canvasContainer$).addClass(this.myClass('canvas-container'))
          .add(this.slot(selectedRoot => this.accountDAO.find(selectedRoot).then(a => {
            if ( ! a ) {
              return self.E()
                .start().addClass(self.myClass('container-message'))
                  .start('p').addClass(self.myClass('message-select-root'))
                    .add(self.MESSAGE_SELECT_ROOT)
                  .end()
                .end();
            }

            var v = this.AccountTreeGraph.create({ data: a });
            this.cview = this.ZoomMapView.create({
              view: v,
              height$: v.height$,
              width: this.el().clientWidth,
              viewBorder: '#d9170e',
              navBorder: 'black',
              handleHeight: '10',
              handleColor: '#406dea',
            });
            return this.cview;
          }))
        )
        .end()
      }))
    },

    function scrollToAccount(accountId){
      var treeNode = this.cview.view.root.findNode(accountId);

      if ( ! treeNode ) {
        var self = this;
        this.cview.view.onSizeChangeComplete.sub(function(sub) {
          sub.detach();
          self.scrollToAccount(accountId);
        })

        this.getAncestry(accountId).then(ancestry => {
          this.expandAncestors(ancestry);
        });

      } else {
        var n = treeNode.parent;
        while ( n ) {
          if ( ! n.expanded ){
            var self = this;
            this.cview.view.onSizeChangeComplete.sub(function(sub) {
              sub.detach();
              self.scrollToAccount(accountId);
            })
            n.expanded = true;
          }
          n = n.parent;
        }
        this.scrollToNode(treeNode);
      }
    },

    function scrollToNode(node) {
      var p = {
        x: 0,
        y: this.cview.view.nodeHeight / 2,
        w: 1
      }
      var newFunctionPoint = this.cview.scaledView_.globalToLocalCoordinates(
        node.localToGlobalCoordinates(p)
      )

      var newViewportPosition = {
        x: this.cview.innerNavView_.scaleX * newFunctionPoint.x  - (this.cview.viewPortView_.width / 2),
        y: this.cview.innerNavView_.scaleY * newFunctionPoint.y  - (this.cview.viewPortView_.height / 2),
      }

      this.cview.view.selectedNode = node;

      this.AnimateTo.create({
        animatedSlot: {
          get: () => this.cview.viewPortPosition.x,
          set: x => {
            this.cview.viewPortPosition = {
              x: x,
              y: this.cview.viewPortPosition.y
            }
          }
        },
        destValue: newViewportPosition.x,
        ms: 200
      }).doAnimation();
      this.AnimateTo.create({
        animatedSlot: {
          get: () => this.cview.viewPortPosition.y,
          set: y => {
            this.cview.viewPortPosition = {
              x: this.cview.viewPortPosition.x,
              y: y
            }
          }
        },
        destValue: newViewportPosition.y,
        ms: 200
      }).doAnimation();
    },

    async function getAncestry(accountId){
      var ancestry = [];

      var curr = await this.accountDAO.find(accountId);

      while ( curr.id !== this.cview.view.root.data.id ){
        ancestry.push(curr.id);
        curr = await this.accountDAO.find(curr.parent);
      }

      return Promise.resolve(ancestry);
    },

    function expandAncestors(ancestry){
      var curr = this.cview.view.root;

      while ( ancestry.length > 0 ){
        if ( ! curr.expanded ){
          curr.expanded = true;
        }

        var currId = ancestry.pop();

        var children = curr.childNodes;

        for ( var i = 0; i < children.length; i++ ){
          if ( children[i].data.id === currId ){
            curr = children[i];
            break;
          }
        }
      }
    }
  ],

  actions: [
    {
      name: 'zoomIn',
      code: function() {
        this.AnimateTo.create({
          animatedSlot: this.cview.scale$,
          destValue: this.cview.scale * 1.25,
          ms: 200
        }).doAnimation();
      }
    },
    {
      name: 'zoomOut',
      isEnabled: function(cview$scale) {
        return (cview$scale || 0) > 0 && (cview$scale || 0) > 0;
      },
      code: function() {
        this.AnimateTo.create({
          animatedSlot: this.cview.scale$,
          destValue: this.cview.scale / 1.25,
          ms: 200
        }).doAnimation();
      }
    },
    {
      name: 'home',
      isEnabled: function(canvasContainer) {
        return !! canvasContainer;
      },
      code: function() {
        this.highlightedAccount = this.selectedRoot;
        this.scrollToNode(this.cview.view.root);
      }
    }
  ],

  listeners: [
    {
      name: 'rootChanged',
      code: async function() {
        // return if no root selected
        if ( ! this.selectedRoot ) {
          this.childAccounts = [];
          this.highlightedAccount = null;
          return;
        }

        // get actual root
        var rootAccount = await this.accountDAO.find(this.selectedRoot);

        // return if no account found for id
        if ( ! rootAccount ) return;

        // temp array
        var childAccounts = [];

        // recursive function that takes an account and context (for getChildren)
        async function getChildData(account, context) {
          // at node, push id and name in format for choice view
          childAccounts.push([account.id, account.toSummary()]);

          // at node, get its children
          var children = await account.getChildren(context)
            .where(foam.mlang.predicate.Eq.create({
              arg1: net.nanopay.account.Account.LIFECYCLE_STATE,
              arg2: foam.nanos.auth.LifecycleState.ACTIVE
            }))
            .select();

          // return if no children
          if ( ! children.array ) return;

          // for each child, recursively call this function.
          // putting this logic in forEach gives a weird side effect when using
          // await
          for ( var i = 0 ; i < children.array.length ; i++ ) {
            await getChildData(children.array[i], context);
          }
        };

        // get all child data before proceeding
        await getChildData(rootAccount, this.__subContext__);

        this.childAccounts = childAccounts;
      }
    }
  ]
});
