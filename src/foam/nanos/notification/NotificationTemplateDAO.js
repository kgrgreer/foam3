/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationTemplateDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Populate notification with template values.
The caller only has to know the template name and does not need to be aware how
the notification will be handled. `,

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'notificationTemplateDAO'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.util.SafetyUtil',
    'java.util.List',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'put_',
      code: function(x, obj) {
        if ( obj.template != null && '' != obj.template ) {
          return this.notificationTemplateDAO.where(this.EQ(Notification.TEMPLATE, obj.template))
            .limit(2).select().then(function(sink) {
              var template = obj;
              if ( sink.array.size == 1 ) {
                template = sink.array[0];
                template.copyFrom(obj);
                return this.delegate.put_(x, template);
              } else {
                console.err('Notification template ' + obj.template + ' not found.');
                return obj;
              }
            }).bind(this);
        }
        return this.delegate.put_(x, obj);
      },
      javaCode: `
        Logger       logger       = Loggers.logger(x, this);
        Notification notification = (Notification) obj;
        Notification template     = notification;

        if ( ! foam.util.SafetyUtil.isEmpty(notification.getTemplate()) ) {
          List templates = ((ArraySink) ((DAO) x.get("notificationTemplateDAO"))
            .limit(2)
            .where(foam.mlang.MLang.EQ(Notification.TEMPLATE, notification.getTemplate()))
            .select(new ArraySink()))
            .getArray();

          if ( templates.size() > 1 ) {
            logger.info("ERROR,Multiple templates found", notification.getTemplate());
            return notification;
          }
          if ( templates.size() == 1 ) {
            template = (Notification) ((FObject)templates.get(0)).fclone();

            Notification.ID.clear(template);
            Notification.TEMPLATE.clear(template);

            // Can't use copyFrom which tests isSet, as we don't
            // want all properties copied.
            if ( Notification.BODY.isSet(notification) ) {
              template.setBody(notification.getBody());
            }
            if ( Notification.CLUSTERABLE.isSet(notification) ) {
              template.setClusterable(notification.getClusterable());
            }
            if ( Notification.READ.isSet(notification) ) {
              template.setRead(notification.getRead());
            }
            if ( Notification.SPID.isSet(notification) ) {
              template.setSpid(notification.getSpid());
            }
            if ( Notification.GROUP_ID.isSet(notification) ) {
              template.setGroupId(notification.getGroupId());
            }
            if ( Notification.TOAST_MESSAGE.isSet(notification) ) {
              template.setToastMessage(notification.getToastMessage());
            }
            if ( Notification.TOAST_SUB_MESSAGE.isSet(notification) ) {
              template.setToastSubMessage(notification.getToastSubMessage());
            }
            if ( Notification.EMAIL_ARGS.isSet(notification) &&
                 Notification.EMAIL_ARGS.isSet(template) ) {
              Map args = template.getEmailArgs();
              notification.getEmailArgs().forEach((k, v) -> {
                if ( ! args.containsKey(k) ) {
                  args.put(k, v);
                }
              });
              template.setEmailArgs(args);
            }
            if ( Notification.ALARM.isSet(notification) ) {
              template.setAlarm(notification.getAlarm());
            }
            if ( Notification.USER_ID.isSet(notification) &&
                 ! Notification.USER_ID.isSet(template) ) {
              template.setUserId(notification.getUserId());
            }
          } else {
            // NOTE: do not generate an error or warning log as this
            // generates an alarm which in turn generates a notification
            logger.info("ERROR,Template not found", notification.getTemplate());
          }
        }

        return getDelegate().put_(x, template);
      `
    }
  ]
});
