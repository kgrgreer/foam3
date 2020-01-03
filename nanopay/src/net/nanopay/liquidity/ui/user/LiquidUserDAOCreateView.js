foam.CLASS({
  // NOTE: We need to put this in the foam.nanos.auth package for faceted to work.
  package: 'foam.nanos.auth',
  name: 'UserDAOCreateView',
  extends: 'foam.comics.v2.DAOCreateView',

  documentation: `Used to create new users in Liquid.`,

  requires: [
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'ctrl'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'data'
    },
    ['viewView', { class: 'net.nanopay.liquidity.ui.user.LiquidUserDetailView' }]
  ],

  messages: [
    {
      name: 'SUCCESS_MESSAGE',
      message: 'An approval request has been created.'
    }
  ],

  actions: [
    {
      name: 'save',
      isEnabled: function(data$errors_, data$desiredPassword) {
        // FIXME: Have to manually check `desiredPassword` here because
        // we add its `validateObj` implementation as an override in
        // LiquidUserDAOCreateView but that doesn't get picked up by `errors_`.
        return ! data$errors_ && data$desiredPassword.length >= 6;
      },
      code: function() {
        var cData = this.data;

        if ( this.LifecycleAware.isInstance(cData) ) {
          cData = cData.clone();
          cData.lifecycleState = this.LifecycleState.PENDING;
        }

        // Set Liquid-specific property values here.
        this.data.group = 'liquidBasic';

        this.config.dao.put(this.data).then((o) => {
          this.data = o;
          this.finished.pub();
          this.ctrl.add(this.NotificationMessage.create({
            message: this.SUCCESS_MESSAGE
          }));
          this.stack.back();
        }, (e) => {
          this.throwError.pub(e);
          this.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    },
  ],
});
