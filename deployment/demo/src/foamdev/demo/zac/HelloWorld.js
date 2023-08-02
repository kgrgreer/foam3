/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foamdev.demo.zac',
  name: 'HelloWorld',
  extends: 'foam.u2.Element',

  documentation: 'Simple demonstration ZAC service.',

  requires: [
    'foam.nanos.menu.VerticalMenu'
  ],

  imports: [
    'auth',
    'subject',
    'ctrl'
  ],


  methods: [
    function init() {
      this.SUPER();

       this.ctrl.add(this);
    },

    async function render() {
      this.SUPER();

//      await this.auth.authorizeAnonymous();
    var user = await this.auth.login(null, 'admin', '');
    this.subject.user = this.subject.realUser = user;
      this.add(this.VerticalMenu.create());
      this.add('Hello World!');
    }
  ]
});
