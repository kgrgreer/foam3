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
    You might want to clear cache on a specific dao after a save.
    An example of when you might want to use PurgeCacheSaver is
    when you want to force a menu reload after a capability is saved or granted.

    Example Usage:
      {
        class: 'foam.u2.wizard.wao.SplitWAO',
        saver: {
          class: 'foam.u2.wizard.data.PurgeCacheSaver',
          dao: "menuDAO"
        }
      }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    }
  ],

  methods: [
    async function save (data) {
      const v = await this.delegate.save(data);
      this.dao.cmd(foam.dao.DAO.PURGE_CMD);
      this.dao.cmd(foam.dao.DAO.RESET_CMD);
      return v;
    }
  ]
});
