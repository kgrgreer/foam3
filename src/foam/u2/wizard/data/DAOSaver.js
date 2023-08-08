/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'DAOSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  documentation: `
    The DAOSaver class is a ProxySaver that is used to save data to a DAO. The
    user can optionally specify a path to the desired data object that they
    wish to update.

    (written by OpenAI)
  `,

  imports: ['wizardlet'],

  properties: [
    {
      name: 'of',
      class: 'Class'
    },
    {
      name: 'daoKey',
      class: 'String',
      expression: function(of, path) {
        if ( path ) {
          const parts = path.split('.');
          let of_ = of;
          let obj = null
          for ( let part of parts ) {
            obj = of_.getAxiomByName(part);
            of = obj.cls_;
          }
          return foam.String.daoize(obj.of.name)
        }
        return foam.String.daoize(of.name);
      }
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      expression: function (daoKey) {
        return this.__context__[daoKey];
      }
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'path',
      documentation: `
        Optional path used to specify the location of the desired wizardlet's data object that will
        be updated.
      `,
    },
    {
      name: 'reloadAfterPut',
      class: 'Boolean',
      documentation: `reloads the wizardlet's data prop with updated data from the put, 
      not sure why we dont do this everywhere. TODO: investigate and probably deafult to true`
    }
  ],

  methods: [
    async function save(data) {
      const dataToPut = this.path ? this.path.f(data) : data;
      if ( ! dataToPut ) return Promise.resolve();
      let newData = await this.dao.put(dataToPut);
      if ( this.reloadAfterPut )
        this.wizardlet[this.path || 'data'] = newData;
      return await this.delegate.save(newData);
    }
  ]
});