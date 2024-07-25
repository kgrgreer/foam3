/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'AutoComplete',

  requires: [ 'foam.dao.EasyDAO' ],

  properties: [
    {
      class: 'String',
      name: 'str1',
      units: 'units'
    },
    {
      class: 'String',
      name: 'str2',
      view: 'foam.u2.view.TextField',
      units: 'units'
    },
    {
      class: 'String',
      name: 'str3',
      view: function(_, x) { return { class: 'foam.u2.view.TextField', autocompleter: x.data }; },
      units: 'units'
    },
    foam.demos.heroes.Controller.HERO_DAO,
    {
      name: 'dao',
      hidden: true,
      factory: foam.demos.heroes.Controller.HERO_DAO.factory
    }
  ]
});
