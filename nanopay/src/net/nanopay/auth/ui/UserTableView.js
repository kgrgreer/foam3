foam.CLASS({
  package: 'net.nanopay.auth.ui',
  name: 'UserTableView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.view.ScrollTableView'
  ],

  imports: [
    'stack'
  ],

  exports: [
    'dblclick'
  ],

  css: `
    ^ .foam-u2-view-TableView-selected {
      background: rgba(89, 165, 213, 0.3) !important;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this
        .start().addClass(this.myClass())
          .start({
            class: 'foam.u2.view.ScrollTableView',
            enableDynamicTableHeight: false,
            data$: this.data$
          }).end()
        .end();
    },
    function dblclick(user) {
      this.stack.push({
        class: 'net.nanopay.auth.ui.UserDetailView',
        user: user
      });
    }
  ]
});
