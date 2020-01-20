foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'ConnectSubMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  methods: [
    function launch(X) {
      // Prevent menu launch.
      // Connect top side navigation populates submenus beneath parent menu.
      return;
    }
  ]
});
