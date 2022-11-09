/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'PurgeCacheSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  documentation: `
    A proxy-saver that clears cache on a specified DAO.
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    }
  ],

  methods: [
    async function save (data) {
      const v = await this.delegate.save(data)
      this.dao.cmd_(this, foam.dao.DAO.PURGE_CMD);
      this.dao.cmd_(this, foam.dao.DAO.RESET_CMD);
      return v;
    }
  ]
});
