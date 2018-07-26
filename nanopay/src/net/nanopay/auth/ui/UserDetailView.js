foam.CLASS({
  package: 'net.nanopay.auth.ui',
  name: 'UserDetailView',
  extends: 'foam.u2.View',

  imports: [
    'stack'
  ],

  exports: [
    'selection',
    'dblclick'
  ],

  properties: [
    'selection'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .start({
          class: 'foam.u2.view.ScrollTableView',
          detailView: this.userView,
          selection$: this.selection$,
          data$: this.data$
        }).end();
    },
    function dblclick(user) {
      this.stack.push({
        class: 'net.nanopay.auth.ui.UserTableView',
        data: user
      });
    }
  ],

});
