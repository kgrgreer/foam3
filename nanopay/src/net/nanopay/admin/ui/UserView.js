foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'UserView',
  extends: 'foam.u2.View',

  documentation: 'View displaying a table with a list of all shoppers and merchants',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'foam.nanos.auth.User'
  ],

  exports: [ 
    'as data',
    'filter',
    'filteredUserDAO' 
  ],

  imports: [
    'stack', 'userDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 962px;
          margin: 0 auto;
        }
        ^ .searchIcon {
          position: absolute;
          margin-left: 5px;
          margin-top: 8px;
        }
        ^ .filter-search {
          width: 225px;
          height: 40px;
          border-radius: 2px;
          background-color: #ffffff;
          display: inline-block;
          margin: 0;
          margin-bottom: 30px;
          vertical-align: top;
          border: 0;
          box-shadow:none;
          padding: 10px 10px 10px 31px;
          font-size: 14px;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'filter',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Search',
        onKey: true
      }
    },
    { name: 'data', factory: function() { return this.userDAO; }},
    {
      name: 'filteredUserDAO',
      expression: function(data, filter) {
        return data.where(this.CONTAINS_IC(this.User.USER_NAME, filter));
      },
      view: {
        class: 'foam.u2.view.TableView',
        columns: [
          'userName', 'email', 'mobile', 'type'
        ]
      }
    }
  ],

  messages: [
    { name: 'placeholderText', message: 'Looks like their aren\'t any users registered yet. Please add users by selecting Add Shopper or Add Merchant.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      
      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start().addClass('button-div')
              .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' }).addClass('searchIcon').end()
              .start(this.FILTER).addClass('filter-search').end()
            .end()
          .end()
          .add(this.FILTERED_USER_DAO)
          .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.userDAO, message: this.placeholderText, image: 'images/member-plus.png'})
        .end();
    }
  ],

  classes: [
    {
      name: 'UserTableView',
      extends: 'foam.u2.View',

      requires: [ 'foam.nanos.auth.User' ],

      imports: [ 'userDAO' ],

      properties: [
        'selection',
        { name: 'data', factory: function() { return this.userDAO; }}
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              editColumnsEnabled: true,
              data: this.data,
              columns: [
                'userName', 'email', 'mobile', 'type'
              ]
            }).addClass(this.myClass('table')).end();
        }
      ]
    }
  ]
});
