
foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'SubMenu',
  extends: 'foam.u2.Element',

  documentation: 'Childrens menu dropdown',

  css: `
    ^ {
      background-color: white;
      padding-top: 5px;
      padding-bottom: 10px;
      padding-left: 5%;
      width: 100%;
      margin-top: -16px;
    }

    ^ .div > ul {
      padding-left: 0;
      font-weight: 100;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^ .div > ul > li{
      margin-left: 25px;
      display: inline-block;
      cursor: pointer;
      opacity: 0.6;
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      line-height: 0.86;
      letter-spacing: 0.3px;
    }

    ^ .div > ul > li:hover {
      font-weight: bold;
    }
  `,

  properties: [
    'menuName'
  ],

  methods: [
    function initE(){
      this.start({class: 'foam.nanos.menu.MenuBar', menuName: this.menuName }).addClass(this.myClass()).end();
    }
  ]
});
