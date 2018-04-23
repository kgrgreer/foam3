foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'PasswordChangeForm',
  extends: 'foam.u2.View',

  documentation: 'Password change form for onboarding',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus'
  ],

  imports: [
    'user'
  ],

  css: `
    ^ p{
      font-size: 14px;
      font-weight: bold;
    }
    ^ .description{
      font-size: 12px;
      font-weight: normal;
    }
    ^ .line{
      width: 70%;
      height: 1px;
      background: rgba(164, 179, 184, 0.5);
    }
    ^ .container-1{
      margin: 20px 0px;
    }
    ^ .label{
      margin-left: 0;
      margin-top: 30px;
      font-size: 14px;
    }
    ^ .foam-u2-TextField{
      width: 540px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
    }
  `,

  properties: [
    {
      class: 'Password',
      name: 'originalPassword'
    },
    {
      class: 'Password',
      name: 'newPassword'
    },
    {
      class: 'Password',
      name: 'confirmPassword'
    }
  ],

  messages: [
    { name: 'passwordDescription', message: 'Please change you password before you start using the nanopay platform.'}
  ],

  methods: [
    function initE(){
      this 
        .addClass(this.myClass())
        .start('p').add('Account ID ' + this.user.id).end()
        .start().addClass('line').end()
        .start().addClass('Container')
          .start('div').addClass('container-1')
            .start('p').add("Next Step - Change Your Password").end()
            .start('p').add(this.passwordDescription).addClass('description').end()
          .end()
          .start('div')
            .start('h2').add("Original Password").addClass('label').end()
            .start(this.ORIGINAL_PASSWORD).end()
            .start('h2').add("New Password").addClass('label').end()
            .start(this.NEW_PASSWORD).end()
            .start('h2').add("Confirm Password").addClass('label').end()
            .start(this.CONFIRM_PASSWORD).end()
          .end()
          .start(this.UPDATE_PASSWORD).addClass('update-BTN').end()
        .end()
    }
  ],

  actions: [
    {
      name: 'updatedPassword',
      code: function(){
        console.log('update password hit');
      }
    }
  ]
});
