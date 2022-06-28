foam.CLASS({
  package: 'foam.u2.crunch.lab',
  name: 'SideViewBorder',
  extends: 'foam.u2.Controller',

  css: `
    ^ {
      position: relative;
    }

    ^side {
      position: absolute;
      width: 0;
      height: 100%;
      top: 0;
      right: 0;
    }

    ^side^open {
      width: 30%;
    }
  `,
  
  properties: [
    {
      class: 'Boolean',
      name: 'sideVisible',
      value: true
    }
  ],

  methods: [
    function init() {
      this
        .start('div', null, this.content$)
        .end()
        .start()
          .addClass(this.myClass('side'))
          .enableClass(this.myClass('open'), this.sideVisible$)
        .end()
        ;
    }
  ]
});