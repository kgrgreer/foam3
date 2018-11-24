foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx.ui',
  name: 'AscendantFXUserTableView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.view.ScrollTableView'
  ],

  imports: [
    'stack',
    'userDAO'
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
            columns: [
              'id', 'user', 'name', 'orgId', 'userStatus'
            ],
            data$: this.data$
          }).end()
        .end();
    }
  ]
});
