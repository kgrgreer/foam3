foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'NavigationView',
  extends: 'foam.u2.View',

  documentation: 'Navigation for self serve',

  css: `
    ^ .top-nav {
      width: calc(100% - 200px);
      display: inline-block;
    }
    ^ .side-nav {
      float:left;
      display: inline-block;
      width: 200px;
      height: 100%
    }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .tag({ class: 'net.nanopay.sme.ui.SideNavigationView' })
        .addClass('side-nav');
    }
  ]
});
