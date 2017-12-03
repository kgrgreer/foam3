foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'UserView',
  extends: 'foam.u2.View',

  documentation: 'User View',

  requires: [
    'foam.u2.dialog.Popup'
  ],

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

      ^send-money {
        float: right;
        width: 135px;
        height: 40px;
        border-radius: 2px;
        background-color: #5E91CB;
        text-align: center;
        line-height: 40px;
        cursor: pointer;
        color: #ffffff;
        margin: auto;
        display: block;
        margin-top: 5px;
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
    },
    {
      name: 'sendMoneyText',
      message: 'Send Money'
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
          .start()
            .addClass(view.myClass('send-money'))
            .add(view.sendMoneyText)
            .on('click', this.sendMoney)
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

  listeners: [
    function sendMoney() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.admin.ui.user.SendMoneyView'
      }));
    }
  ],

  classes: [
    {
      name: 'UserTableView',
      extends: 'foam.u2.View',
      
      requires: [
        'foam.nanos.auth.User',
        'foam.mlang.predicate.False',
        'foam.mlang.predicate.True',
        'foam.parse.QueryParser',
        'foam.u2.view.TextField'
      ],

      imports: [ 'userDAO' ],

      properties: [ 
        'selection', 
        {
          class: 'foam.dao.DAOProperty',
          name: 'data',
          factory: function() { return this.userDAO; }
        },

        {
          name: 'textFieldView',
        },

        {
          name: 'queryParser',
          expression: function(data$of) {
            return this.QueryParser.create({ of: data$of });
          }
        },
        {
          name: 'predicate',
          expression: function(queryParser, textFieldView$data) {
            var str = textFieldView$data;
            return str ?
              queryParser.parseString(str) || this.False.create() :
              this.True.create();
          },
        },

        {
          class: 'foam.dao.DAOProperty',
          name: 'filteredDAO',
          expression: function(data, predicate) {
            return data.where(predicate)
          },
        },
      ],

      axioms: [
        foam.u2.CSS.create({
          code:
          `
            ^filter-search .foam-u2-tag-Input {
              width: 40%;
              height: 40px;
              border: solid 1px #FFF;
              border-radius: 2px;
              margin: 5px 0px 30px 0px;
              outline: none;
              padding: 0px 15px;
              font-family: Roboto;
              font-size: 12px;
              text-align: left;
              color: #093649;
              font-weight: 300;
              letter-spacing: 0.2px;
              float: left;
            }

            ^ic-search {
              margin-left: -62px;
              display: inline;
              width: 24px;
              height: 24px;
              background-color: #ffffff;
              position: relative;
              top: 12px;
              padding: 10px 24px 5px 10px;
            }
      `})],

      methods: [
        function initE() {
          this.SUPER();
          var view = this;

          this
            .start('div')
              .start('div')
                .addClass(view.myClass('filter-search'))
                .tag(this.TextField, { onKey: true }, this.textFieldView$)
              .end()
              .start('div')
                .addClass(view.myClass('ic-search'))
                .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' })
              .end()
            .end()
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.filteredDAO$proxy,
              columns: [
                'fullName', 'email', 'phone', 'type'
              ],
            }).end()
        },
      ]
    }
  ]
});
