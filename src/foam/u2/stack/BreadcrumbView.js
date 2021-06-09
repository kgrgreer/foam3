/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.stack',
  name: 'BreadcrumbView',
  extends: 'foam.u2.View',

  imports: ['stack'],

  requires: ['foam.core.Action'],

  css: `
  .display {
    display: inline-flex;
  }
  .slash{
    padding: 8px;
    vertical-align: middle;
  }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.addClass('display');
      var a = this.stack.stack_.slice(this.stack.navStackBottom, this.stack.pos);
      a.map((v, i, _) =>{
        var a  = self.Action.create({
          name: 'back',
          code: () => {
            self.stack.jump(i+this.stack.navStackBottom, self.__subContext__);
          }
        });
        self.tag(a, { label: this.stack.stack_[i + this.stack.navStackBottom + 1][3].parentNavTitle || 'back', buttonStyle: 'LINK' });
        self.start('span').addClass('slash').add(' / ').end();
      });
    }
  ]
});
