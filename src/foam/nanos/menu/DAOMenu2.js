/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'DAOMenu2',
  extends: 'foam.nanos.menu.AbstractMenu',

  exports: [
    'config'
  ],

  documentation: `
    A DAOMenu which can accept a DAOControllerConfig and uses
    the v2 DAOController
  `,

  requires: [
    'foam.comics.v2.DAOControllerConfig'
  ],

  properties: [
    {
      class: 'foam.util.FObjectSpec',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return { class: 'foam.comics.v2.DAOControllerConfig' }
      }
    },
    {
      name: 'config_',
      factory: function() {
        return this.config$create({}, this);
      }
    }
  ],

  methods: [
    function createView(X) {
      this.config_ = this.config$create({}, X);
      return {
        ...this.config_.browseController,
        data: this.config_.dao,
        config: this.config_
      };
    }
  ]
});
