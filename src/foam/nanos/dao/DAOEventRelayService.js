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
          this.targetDAO.cmd(foam.dao.DAO.RESET_CMD);
        });
      });
    }
  ]
});
