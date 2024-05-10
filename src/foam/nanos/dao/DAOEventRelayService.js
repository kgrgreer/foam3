/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.dao',
  name: 'DAOEventRelayService',
  documentation: `Relays events from one dao to another, useful for resetting target dao when source dao is reset/put to`,
  properties: [
    {
      class: 'StringArray',
      name: 'events',
      factory: function() { return ['reset']; }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'sourceDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'targetDAO'
    }
  ],
  methods: [
    function init() {
      this.events.forEach(v => {
        this.sourceDAO.on[v].sub(() => {
          /*
            Calls cmds rather than the topic as the cmd gets to the base dao
            and then propogates up as a topic anyway. TTLCaching daos dont care 
            about topics and need purge cmd so this is the only way to ensure 
            fresh data
          */
          this.targetDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.targetDAO.cmd(foam.dao.DAO.PURGE_CMD);
          // this.targetDAO.on.reset.pub();
        });
      });
    }
  ]
});
