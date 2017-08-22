foam.CLASS({
  package: 'net.nanopay.admin.ui.user',
  name: 'UserView',
  extends: 'foam.u2.View',

  documentation: 'User View',

  implements: [
    'foam.mlang.Expressions', 
  ],

  exports: [ 'as data' ],

  imports: [
    'stack', 'userDAO'
  ],

  properties: [
    'selection', 
    {
      name: 'data',
      factory: function() { return this.userDAO; }
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code:
      `
      ^ p{
        display: inline-block;
      }

      ^pending-top-ups {
        opacity: 0.6;
        font-family: Roboto;
        font-size: 24px;
        font-weight: 300 !important;
        line-height: 1.0;
        letter-spacing: 0.3px;
        color: #093649;
        padding-bottom: 30px;
      }

      ^container {
        width: 95%;
        position: relative;
        vertical-align: top;
        overflow: auto;
        z-index: 0;
        display: block;
        margin: auto;
        margin-top: 30px;
      }

      ^container th {
        background-color: rgba(94, 145, 203, 0.4);
        font-family: Roboto;
        font-size: 16px;
        font-weight: normal;
        line-height: 1.0;
        letter-spacing: 0.3px;
        color: #093649;
        padding-left: 65px;
        text-align: left;
      }

      ^container td {
        width: 25%;
        padding-left: 65px;
        text-align: left;
        font-size: 14px;
      }

      .foam-u2-view-TableView-th-amount {
        text-align: left !important;
      }

      ^no-users {
        font-family: Roboto;
        font-size: 14px;
        letter-spacing: 0.2px;
        color: #093649;
        text-align: center;
        display: block;
        padding: 30px;
      }

      .profile-photo {
        width: 35px;
        height: 35px;
        vertical-align: middle;
        padding-right: 16px;
      }
    `
    })
  ],

  messages: [
    {
      name: 'noUsers',
      message: 'You don\'t have any registered users yet.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var view = this;
      this
        .addClass(view.myClass())
        .tag({class: 'net.nanopay.admin.ui.shared.topNavigation.SubMenu', menuName: 'userSubMenu' })
        .start('div')
          .addClass(view.myClass('container'))
          .start('div')
            // TODO Search, Send Money
          .end()
          .tag(this.UserTableView)
          .start('span')
            .addClass(view.myClass('no-users'))
            .add(view.slot(function(count) {
                return count.value == 0 ? view.noUsers : '';
              }, view.daoSlot(this.userDAO, this.COUNT())))
          .end()
        .end()
    }
  ],

  classes: [
    {
      name: 'UserTableView',
      extends: 'foam.u2.View',
      
      requires: [ 'net.nanopay.admin.model.Transaction' ],
      imports: [ 'userDAO' ],

      properties: [ 
        'selection', 
        { name: 'data', factory: function() { return this.userDAO; }}
      ],

      methods: [
        function initE() {
          this.SUPER();

          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.data,
              columns: [
                'fullName', 'email', 'phone', 'type'
              ],
            }).end()
        },
      ]
    }
  ]
});
