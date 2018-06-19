foam.CLASS({
  package: 'net.nanopay.auth.ui',
  name: 'SignUpView',
  extends: 'foam.nanos.auth.SignUpView',

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'businessRegistrationDAO',
    'ctrl'
  ],

  actions: [
    {
      name: 'signUp',
      isEnabled: function(firstName, lastName, email, password) {
        return firstName && lastName && email && password;
      },
      code: function(X, obj) {
        var self = this;
        var user = self.User.create({
          firstName: self.firstName,
          lastName: self.lastName,
          email: self.email,
          businessPhone: self.phone,
          desiredPassword: self.password,
          organization: self.organization,
          businessName: self.organization,
          department: self.department,
          group: 'business',
          type: 'Business',
          invited: true
        });

        this.businessRegistrationDAO.put(user).then(function(user) {
          self.user = user;

          X.ctrl.add(self.NotificationMessage.create({ message: 'User Created.' }));
          X.stack.push({ class: 'net.nanopay.auth.ui.SignInView', userCreated: true });
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    }
  ]
});
