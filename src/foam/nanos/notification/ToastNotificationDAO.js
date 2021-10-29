/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'ToastNotificationDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Detect if a newly put notification is transient or not, 
                  if it is return, else put to server side notificationDAO`,

  methods: [
    {
      name: 'put_',
      code: function(x, obj) {
        if ( obj.transient ) {
          // Need to manullay publish put in the client dao decorator when you return.
          // This is needed here because the method responsible for creating a toast
          // message is listening on put to myNotificationDAO to be executed.
          this.on.put.pub(obj);
          return obj;
        }

        return this.delegate.put_(x, obj);
      }
    }
  ]
});
