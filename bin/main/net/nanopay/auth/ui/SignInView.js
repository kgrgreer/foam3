foam.CLASS({
  package: 'net.nanopay.auth.ui',
  name: 'SignInView',
  extends: 'foam.nanos.auth.SignInView',
  requires: [
    'foam.u2.ListCreateController',
    'net.nanopay.auth.ui.SignUpView',
  ],

  listeners: [
    function signUp() {
      var self = this;
      var view = this.ListCreateController.CreateController.create(
        null,
        this.__context__.createSubContext({
          detailView: this.SignUpView,
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
