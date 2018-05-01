foam.CLASS({
  package: 'foam.doc',
  name: 'ApiBrowser',
  extends: 'foam.u2.Element',
  documentation: 'Show UML & properties for passed in models',

  requires: [
    'foam.doc.ClassList',
    'foam.doc.DocBorder',
    'foam.doc.SimpleClassView',
    'foam.doc.GetRequestView',
    'foam.doc.PutRequestView',
    'foam.doc.serviceListView'
  ],

  imports: [
    'appConfig',
    'nSpecDAO',
    'AuthenticatedNSpecDAO'
  ],

  exports: [
    'showOnlyProperties',
    'showInherited'
  ],

  properties: [
    {
      name: 'models',
      value: []
    },
    {
      name: 'showOnlyProperties',
      value: true
    },
    {
      name: 'showInherited',
      value: false
    }
  ],

  css: `
    ^ {
      display: flow-root;
      height: auto;
      width: 700px;
      margin: 20px;
    }
    ^ .foam-doc-UMLDiagram{
      width: 700px;
      margin: 0;
      margin-bottom: 20px;
    }
    ^ .foam-doc-UMLDiagram canvas{
      width: 700px;
    }
    ^ .foam-u2-view-TableView-foam-doc-PropertyInfo{
      width: 700px;
      float: left;
      margin-top: 20px;
      margin-bottom: 30px;
    }
    ^ .net-nanopay-ui-ActionView-printPage{
      margin-top: 20px;
    }
    ^ .light-roboto-h2{
      white-space: normal;
      width: 100%;
    }
    ^ .black-box{
      background: #1e1c3a;
      padding: 20px;
    }
    ^ .small-roboto{
      color: white;
      font-size: 14px;
      font-family: Roboto;
      line-height: 1.5;
      font-weight: 300;
    }
    ^ .sml{
      font-size: 14px;
      font-weight: 500;
      color: black;
    }
    @media print{
      .foam-u2-view-TableView-th-editColumns{
        display: none;
      }
      ^ .net-nanopay-ui-ActionView-printPage{
        display: none;
      }
      .net-nanopay-ui-topNavigation-TopNav{
        display: none;
      }
    }
  `,

  messages: [
    { name: "introMessage", message: "Welcome to the nanopay API documentation. This API will give you the ability to connect your software to banking infrastructure to move money, store funds, and verify bank accounts."},
    { name: "makingRequests", message: "Request and response bodies are JSON encoded. Requests must contain api credentials (email/password provided by nanopay) on the authorization tag. Data contained in the table views below model details display available properties on the model. Those that are required are added to the examples shown on each service call. " }
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this.start().addClass(this.myClass())
        .add(this.serviceListView.create())
        .start('h2').add("API Documentation").end()
        .start().addClass('light-roboto-h2').add(this.introMessage).end()
        .start('h2').add("Making Requests").end()
        .start().addClass('light-roboto-h2').add(this.makingRequests).br().br().end()
        .start().addClass('light-roboto-h2 sml').add('Below is an example GET request to the pacs008ISOPurposeDAO using curl:').end()
        .start().addClass('small-roboto').add(this.GetRequestView.create({ data: 'pacs008ISOPurposeDAO' })).end()
        .start().addClass('light-roboto-h2 sml').br().add('Below is an example POST request to the pacs008ISOPurposeDAO using curl (POST requests can create and update objects):').end()
        .start().addClass('small-roboto').add(this.PutRequestView.create({ data: { n: { name : 'pacs008ISOPurposeDAO' }, props : '"type":"String"'}})).end()
        .select(this.AuthenticatedNSpecDAO, function(n) {
          var model = self.parseClientModel(n);
          if( ! model ) return;
          var dataProps = self.requiredProperties(model);
          this.start().addClass(n.name)
            .style({ 'font-size' : '25px', 'margin' : '30px 0px', 'font-weight': '500'})
            .add(n.name)
            .attrs({ id : n.name })
          .end()
          .tag(self.SimpleClassView.create({ data: model }))
          .tag(self.GetRequestView.create({ data: n.name }))
          .tag(self.PutRequestView.create({ data: { n : n, props : dataProps }}))
        })
      .end();
    },

    function parseClientModel(n){
      var cls = JSON.parse(n.client);
      var clsName = cls.of ? cls.of : cls.class;
      return foam.lookup(clsName, true);
    },

    function requiredProperties(m){
      var reqProps = [];
      var dataString;
      for ( var key in m.axiomMap_ ) {
        var a  = m.axiomMap_[key];
        if (a.required) {
          if(a.cls_.name != "Import") {
            reqProps.push('"', key, '"', ":", '"', a.cls_.name, '"');
          }
        }
      }
      dataString = reqProps.join('');
      return dataString;
    }
  ]
});

foam.CLASS({
  package: 'foam.doc',
  name: 'GetRequestView',
  extends: 'foam.u2.View',

  imports: [ 'appConfig' ],

  properties: [
    {
      name: 'url',
      expression: function(appConfig){
        return appConfig.url;
      }
    }
  ],

  methods: [
    function initE() {
      self = this;

      this.addClass(this.myClass())
      .start().addClass('light-roboto-h2').add("GET Request: ").end()
        .start().addClass('black-box')
          .start().addClass('small-roboto')
            .add('curl -X GET').br()
            .add("'" + this.url + 'service/dig?dao=' + this.data + "'").br()
            .add("-u 'username/password'").br()
            .add("-H 'accept: application/json'").br()
            .add("-H 'cache-control: no-cache'").br()
            .add("-H 'content-type: application/json'")
          .end()
        .end()
      .end()
    }
  ]
});

foam.CLASS({
  package: 'foam.doc',
  name: 'PutRequestView',
  extends: 'foam.u2.View',

  imports: [ 'appConfig' ],

  properties: [
    {
      name: 'url',
      expression: function(appConfig){
        return appConfig.url;
      }
    }
  ],

  methods: [
    function initE(){
      var self = this;

      this.addClass(this.myClass())
      .start().addClass('light-roboto-h2').style({ 'margin-top': '25px'}).add("POST Request (Create & Update): ").end()
        .start().addClass('black-box')
          .start().addClass('small-roboto')
            .add('curl -X POST').br()
            .add("'" + this.url + 'service/dig?dao=' + this.data.n.name + "'").br()
            .add("-u 'username/password'").br()
            .add('-d "{' + this.data.props + "}" ).br()
            .add("-H 'accept: application/json'").br()
            .add("-H 'cache-control: no-cache'").br()
            .add("-H 'content-type: application/json'")
          .end()
        .end()
      .end()
    }
  ]
});

foam.CLASS({
  package: 'foam.doc',
  name: 'serviceListView',
  extends: 'foam.u2.View',

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'nSpecDAO',
    'AuthenticatedNSpecDAO'
  ],

  requires: [ 'foam.nanos.boot.NSpec' ],

  css: `
    ^ {
      position: fixed;
      right: 0;
      float: right;
      width: 200px;
      overflow: scroll;
      height: 80vh;
      padding: 20px;
      font-weight: 100;
      color: white;
      background: #093649;
    }
    ^ .menu-title{
      font-size: 20px;
      font-weight: 300;
      padding-bottom: 20px;
    }
    ^ .menuItem:hover{
      border-bottom: 1px solid white;
      width: auto;
      display: initial;
      cursor: pointer;
    }
  `,

  methods: [
    function initE(){
      this.SUPER();
      var self = this;
      this.start().addClass(this.myClass())
      .start().addClass('menu-title').add("Service Menu").end()
      .select(this.AuthenticatedNSpecDAO.orderBy(this.NSpec.NAME), function(n) {
        var cls = JSON.parse(n.client);
        var clsName = cls.of ? cls.of : cls.class;
        if (!foam.lookup(clsName, true)) return;
        this.start().addClass('menuItem')
          .add(n.name)
          .on('click', function(){
            document.getElementById(n.name).scrollIntoView()
          })
        .end()
      });
    }
  ]
});
