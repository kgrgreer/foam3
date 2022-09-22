/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'SpecifiedLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',

  documentation: `
    A SpecifiedLoader allows a delegate Loader's properties to be populated
    by additional Loaders. For example, a Loader that returns results from
    a DAO query may have properties 'dao' and 'predicate. By using
    SpecifiedLoader these properties can be set as the resulting data from a
    prerequisite wizardlet, or anything else a loader can return.

    Example journal config:
    {
      class: 'foam.u2.wizard.data.SpecifiedLoader',
      spec: {
        class: 'foam.u2.wizard.data.DAOArrayLoader',
        predicate: {
          class: 'foam.mlang.predicate.True'
        }
      },
      dynamic: {
        dao: {
          class: 'ContextLoader',
          path: 'subject.user.capabilities.dao'
        }
      }
    }
  `,

  properties: [
    {
      class: 'foam.util.FObjectSpec',
      name: 'spec'
    },
    {
      class: 'Map',
      name: 'dynamic'
    }
  ],
  
  methods: [
    async function load () {
      this.delegate = this.spec$create({}, this.__subContext__);
      for ( const key of Object.keys(dynamic) ) {
        const loader = foam.json.parse(dynamic[key], undefined, this.__subContext__);
        delegate[key] = await loader.load();
      }
      return await this.delegate.load();
    }
  ]
});
