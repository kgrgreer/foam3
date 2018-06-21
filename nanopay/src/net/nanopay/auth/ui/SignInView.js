foam.CLASS({
  package: 'net.nanopay.auth.ui',
  name: 'SignInView',
  extends: 'foam.nanos.auth.SignInView',

  listeners: [
    function signUp() {
      var self = this;
      var view = foam.u2.ListCreateController.CreateController.create(
        null,
        this.__context__.createSubContext({
          detailView: net.nanopay.auth.ui.SignUpView,
          back: this.stack.back.bind(this.stack),
          dao: this.userDAO,
          factory: function() {
            return self.User.create();
          },
          showActions: false
        }));
      this.stack.push(view);
    }
  ],
});
