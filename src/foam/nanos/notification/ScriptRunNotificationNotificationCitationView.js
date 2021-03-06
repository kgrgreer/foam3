/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'ScriptRunNotificationNotificationCititationView',
  extends: 'foam.nanos.notification.NotificationCitationView',

  requires: [
    'foam.comics.DAOUpdateControllerView'
  ],

  imports: [
    'scriptDAO',
    'stack'
  ],

  exports: [
    'as data',
    'scriptDAO as dao'
  ],

  methods: [
    function render() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start(this.LINK).end();
    }
  ],
  actions: [
    {
      name: 'link',
      label: 'Go to script',
      code: function() {
        this.stack.push({ class: 'foam.comics.DAOUpdateControllerView', key: this.data.scriptId }, this );
      }
    }
  ]
});
