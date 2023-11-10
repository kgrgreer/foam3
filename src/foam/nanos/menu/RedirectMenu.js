/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'RedirectMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  documentation: `Fetches menus from the URL params and redirects to the first one`,

  imports: [
    'menuDAO',
    'pushMenu',
    'window'
  ],

  requires: [
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'menus'
    }
  ],
  methods: [
    async function launch(x) {
      let url = new URL(this.window.location.href);
      this.menus = url.searchParams.get('menus').split(',');
      url.searchParams.delete('menus');
      this.window.history.replaceState('', '', url);
      if ( ! this.menus.length ) {
        this.pushMenu('', true);
        return;
      }
      for ( menu of this.menus ) {
        let found = await this.menuDAO.find(menu);
        if ( found ) {
          this.pushMenu(menu);
          break;
        }
      }
    }
  ]
});
