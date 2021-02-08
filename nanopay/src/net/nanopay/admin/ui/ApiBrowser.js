foam.CLASS({
  package: 'foam.doc',
  name: 'ApiBrowser',
  extends: 'foam.u2.Element',
  documentation: 'Show UML & properties for passed in models',

  requires: [
    'foam.doc.DocBorder',
    'foam.doc.ExpandContainer',
    'foam.doc.SimpleClassView',
    'foam.doc.ServiceListView'
  ],

  imports: [
    'appConfig',
    'nSpecDAO',
    'AuthenticatedNSpecDAO'
  ],

  exports: [
    'showOnlyProperties',
    'showInherited',
    'path as browserPath'
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
    },
    {
      name: 'selectedClass',
      expression: function(path) {
        return this.lookup(path, true);
      }
    },
    {
      name: 'serviceContainer',
      factory: function() {
        return this.ExpandContainer.create({ title: 'Service Menu' });
      }
    },
    {
      name: 'selectedModelContainer',
      factory: function() {
        return this.ExpandContainer.create({ title: 'Model Search' });
      }
    },
    {
      class: 'String',
      name: 'path',
      width: 80,
      factory: function() {
        var path = 'foam.core.Property';

        this.document.location.search
            .substring(1)
            .split('&')
            .forEach(function(s) {
              s = s.split('=');
              if ( s[0] === 'path' ) path = s[1];
            });

        return path;
      }
    },
  ],

  css: `
    ^ {
      display: flow-root;
      height: auto;
      width: 900px;
      background: white;
      padding: 20px;
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
    ^ .foam-u2-ActionView-printPage{
      margin-top: 20px;
    }
    ^ .light-roboto-h2{
      white-space: normal;
      width: 700px;
      line-height: 1.3;
      font-size: 16px;
    }
    ^ .black-box{
      background: #1e1c3a;
      padding: 20px;
      width: 700px;
    }
    ^ .small-roboto{
      color: white;
      font-size: 14px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
      ^ .foam-u2-ActionView-printPage{
        display: none;
      }
      .net-nanopay-ui-topNavigation-TopNav{
        display: none;
      }
    }
    .selected-model{
      vertical-align: top;
      display: block;
      height: 600px;
      width: 600px;
      overflow: auto;
      background: white;
      margin-top: 20px;
    }
    ^ .className {
      font-size: 25px;
      margin: 30px 0px;
      font-weight: 500;
      border-bottom: 1px solid /*%BLACK%*/ #1e1f21;
      width: fit-content;
    }
    ^ .foam-u2-view-TableView td {
      white-space: normal;
    }
    .selected-model .foam-u2-view-TableView {
      width: 600px;
    }
    .foam-doc-ExpandContainer {
      display: inline-block;
      height: 650px;
      vertical-align: top;
      border-right: 1px solid lightgray;
    }
    .doc-sub-nav{
      z-index: 1;
      float: right;
      width: auto;
      position: fixed;
      top: 65px;
      right: 0;
    }
    ^ .line {
      height: 10px;
      background: /*%BLACK%*/ #1e1f21;
      width: 700px;
    }
    ^ .foam-u2-view-TableView-foam-doc-PropertyInfo{
      width: 900px;
    }
  `,

  messages: [
    {
      name: 'Title',
      message: 'API Documentation'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.start()
        .start().addClass(this.myClass())
          .start().addClass('api-browser-container')
            .start('h1')
              .add(this.Title)
            .end()
            .start()
              .addClass('line')
              .style({ 'margin-bottom': '25px;' })
            .end()
            .tag({
              class: 'foam.doc.ExampleRequestView'
            })
            .start()
              .addClass('line')
              .style({ 'margin-top': '35px;' })
            .end()
            .tag({
              class: 'foam.doc.ServiceTypeDescription'
            })
            .select(this.AuthenticatedNSpecDAO, function(n) {
              var model = self.parseClientModel(n);
              if ( ! model ) return;
              var dataProps = self.requiredProperties(model);
              this.start().addClass(n.name).addClass('className')
                .add(n.name)
                .attrs({
                  id: n.name
                })
              .end()
              .tag('Description: ', n.description)
              .callIf(n.boxClass, function() {
                  this.tag({
                    class: 'foam.doc.ClientServiceView',
                    data: self.parseInterface(n)
                  });
              })
              .callIf(! n.boxClass, function() {
                this.tag({
                  class: 'foam.doc.SimpleClassView',
                  data: model
                })
                .tag({
                  class: 'foam.doc.GetRequestView',
                  data: n.name
                })
                .tag({
                  class: 'foam.doc.PutRequestView',
                  data: {
                    n: n,
                    props: dataProps
                  }
                });
              });
            })
          .end()
        .end();

        this.start().addClass('doc-sub-nav')
          .start(this.serviceContainer).addClass('service-list-container')
            .tag(this.ServiceListView)
          .end()
          .start(this.selectedModelContainer)
            .addClass('selected-model-container')
            .start().addClass('selected-model')
              .startContext({ data: this })
                .start().add(this.PATH).end()
              .endContext()
                .add(this.slot(function(selectedClass) {
                  if ( ! selectedClass ) return '';
                  return this.SimpleClassView.create({
                    data: selectedClass
                  });
                }))
              .end()
            .end()
          .end()
        .end();
    },

    function parseInterface(n) {
      var cls = this.parseClientModel(n);
      var clientService = cls.axiomMap_.delegate;
      return foam.lookup(clientService.of, true);
    },

    function parseClientModel(n) {
      var cls = JSON.parse(n.client);
      var clsName = cls.of ? cls.of : cls.class;
      return foam.lookup(clsName, true);
    },

    function requiredProperties(m) {
      var reqProps = [];
      var dataString;
      for ( var key in m.axiomMap_ ) {
        var a  = m.axiomMap_[key];
        if ( a.required ) {
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
  name: 'ClientServiceView',
  extends: 'foam.u2.View',

  requires: [
    'foam.doc.ServiceMethodView'
  ],

  css: `
    ^ .interfaceLabel {
      font-size: 20px;
      font-weight: bold;
      color: grey;
      margin-bottom: 20px;
    }
    ^ .methodCall {
      background: #1e1c3a;
      color: white;
      margin: 20px 0;
      width: 700px;
      padding: 20px;
    }
    ^ .methodName {
      margin-bottom: 10px;
    }
    ^ .light-roboto-h2{
      margin-bottom: 0;
    }
  `,

  methods: [
    function initE() {
      var cls = this.data.axiomMap_;

      this.start().addClass(this.myClass())
        .start().addClass('interfaceLabel').add('(Interface)').end()
        .start().addClass('light-roboto-h2').add('Methods:').end()
        .call(function() {
          for ( var key in cls ) {
            if ( cls[key].cls_ === foam.core.internal.InterfaceMethod ) {
              this.start().addClass('methodCall')
                .start().addClass('small-roboto').addClass('methodName')
                  .add(cls[key].name)
                .end()
                .start().addClass('methodArguments')
                  .forEach(cls[key].args.filter(function (arg) {
                    // filter out context args by name or javaType
                    return arg.name !== 'x' || arg.javaType !== 'foam.core.X';
                  }), function(arg) {
                    this.start().addClass('argumentItems')
                      .add('( name: ', arg.name, ', type: ', arg.javaType, ' )')
                    .end();
                  })
                .end()
              .end();
            }
          }
        })
      .end();
    }
  ],
});


foam.CLASS({
  package: 'foam.doc',
  name: 'ServiceTypeDescription',
  extends: 'foam.u2.View',

  messages: [
    {
      name: 'Title',
      message: 'Service Types'
    },
    {
      name: 'TitleDescription',
      message: 'Services play multiple roles within the' +
          ' nanopay system. Available services can be categorized' +
          ' into 2 types, all of which are detailed below.'
    },
    {
      name: 'InterfaceTitle',
      message: 'Interface Services'
    },
    {
      name: 'InterfaceDescription',
      message: 'Services labelled as Interface have methods' +
          ' that take in arguments which process calls accordingly.' +
          ' Example: The “exchangeRate” service has a method' +
          ' “getFromSource” which requires a targetCurrency' +
          ' (ex: ‘CAD’), sourceCurrency (ex: ‘INR), amount' +
          ' (ex: 1). As a response, the service will return' +
          ' an object containing fields correlating to the' +
          ' arguments provided and providing exchange rates' +
          ' retrieved from the DAOs and/or third party sources.' +
          ' (Currently Unsupported)'
    },
    {
      name: 'DAOTitle',
      message: 'DAO Services'
    },
    {
      name: 'DAODescription',
      message: 'Services without any specified label are' +
          ' Data access objects (DAO) which store information on' +
          ' the system, whether it be in memory or in journal' +
          ' files. These DAOs are further extended with features' +
          ' using decorators. The service call is unable to' +
          ' dictate the functionality of the decorators unless' +
          ' the appropriate values contained within the data' +
          'object exist. Most DAOs require authentication and' +
          ' appropriate permissions enabled on the user' +
          ' to access and utilize.'
    },
    {
      name: 'ServiceListTitle',
      message: 'nanopay Service List'
    },
    {
      name: 'ServiceListDescription',
      message: 'The following list details the services' +
          ' within the nanopay system, listing each' +
          ' service name, providing a short' +
          ' description of its purpose, & providing examples' +
          ' detailing how to utilize them.'
    }
  ],

  css: `
    ^ {
      margin-top: 25px;
    }
    ^ .subLabel {
      font-size: 18px;
      font-weight: bold;
      color: #18a1a8;
      margin-bottom: 20px;
    }
    ^ .line {
      height: 10px;
      background: /*%BLACK%*/ #1e1f21;
      width: 700px;
    }
  `,

  methods: [
    function initE() {
      this.start().addClass(this.myClass())
        .start('h1')
          .add(this.Title)
        .end()
        .start().addClass('light-roboto-h2')
          .add(this.TitleDescription)
        .end()
        .start().addClass('subLabel')
          .add(this.InterfaceTitle)
        .end()
        .start().addClass('light-roboto-h2')
          .add(this.InterfaceDescription)
        .end()
        .start().addClass('subLabel')
          .add(this.DAOTitle)
        .end()
        .start().addClass('light-roboto-h2')
          .add(this.DAODescription)
        .end()
        .start()
          .addClass('line')
          .style({ 'margin-top': '20px;' })
        .end()
        .start('h1')
          .add(this.ServiceListTitle)
        .end()
        .start().addClass('light-roboto-h2')
          .add(this.ServiceListDescription)
        .end()
      .end();
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'ExampleRequestView',
  extends: 'foam.u2.View',

  messages: [
    {
      name: 'Title',
      message: 'Making Requests'
    },
    {
      name: 'IntroMessage',
      message: 'Welcome to the nanopay API documentation. ' +
          'This API will give you the ability to connect your ' +
          'software to banking infrastructure to move money, ' +
          'store funds, and verify bank accounts. '
    },
    {
      name: 'MakingRequests',
      message: 'Request and response bodies are JSON encoded. Requests ' +
          'must contain api credentials (email/password provided by nanopay) ' +
          'on the authorization tag. Data contained in the table views ' +
          'below encompass model details which are associated to the ' +
          'service. Properties or information required are added ' +
          'to the examples shown in the curl service call.'
    },
    {
      name: 'MakingRequests2nd',
      message: 'Queries follow the MQL Query Language, a generic ' +
        'google-like query-language. A link to the MQL documentation ' +
        'can be found below: '
    },
    {
      name: 'UserExampleGetLabel',
      message: 'Below is an example GET request ' +
          'to the publicUserDAO using curl. ' +
          'This will return all public user information:'
    },
    {
      name: 'UserExamplePostLabel',
      message: 'Below is an example POST request ' +
          'to the userDAO using curl. This will create a basic nanopay user. ' +
          '(POST requests can create and update objects):'
    },
    {
      name: 'QueryExampleGetLabel',
      message: 'Below is an example of a GET request with a query ' +
          'to the publicUserDAO using curl. ' +
          'This will return all public users with the first name ' +
          '"John" and last name "Smith":'
    },
  ],

  methods: [
    function initE() {
      this.start().addClass('light-roboto-h2')
        .add(this.IntroMessage)
      .end()
      .start('h2')
        .add(this.Title)
      .end()
      .start().addClass('light-roboto-h2')
        .add(this.MakingRequests).br().br()
        .add(this.MakingRequests2nd).br()
      .end().br()
      .tag({
        class: 'foam.nanos.dig.LinkView',
        data: 'https://github.com/foam-framework/foam/wiki/MQL---Query-Language'
      })
      .start().addClass('light-roboto-h2').addClass('sml')
               .style({ 'margin-top': '45px' })
        .add(this.UserExampleGetLabel)
      .end()
      .start().addClass('small-roboto')
        .tag({
          class: 'foam.doc.GetRequestView',
          data: 'publicUserDAO'
        })
      .end()
      .start().addClass('light-roboto-h2').addClass('sml')
        .br()
        .add(this.UserExamplePostLabel)
      .end()
      .start().addClass('small-roboto')
        .tag({
          class: 'foam.doc.PutRequestView',
          data: {
            n: {
              name: 'userDAO'
            },
            props: '"email":"email@example.com",' +
                ' "password":"somePassword123", ' +
                '"firstName":"John", "lastName":"Smith"'
          }
        })
      .end()
      .start()
        .addClass('light-roboto-h2')
        .addClass('sml')
        .style({ 'margin-top': '15px' })
        .add(this.QueryExampleGetLabel)
      .end()
      .start().addClass('small-roboto')
        .tag({
          class: 'foam.doc.GetRequestView',
          data: 'publicUserDAO&cmd=select&format=' +
              'json&q=firstName=John%20AND%20lastName=Smith',
          appendedLabel: '(Query)'
        })
      .end();
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'GetRequestView',
  extends: 'foam.u2.View',

  imports: [
    'appConfig'
  ],

  properties: [
    {
      name: 'url',
      expression: function(appConfig) {
        return appConfig && appConfig.url;
      }
    },
    {
      name: 'appendedLabel'
    }
  ],

  messages: [
    {
      name: 'Label',
      message: 'Get Request: '
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
      .start().addClass('light-roboto-h2').add(this.appendedLabel, ' ', this.Label).end()
        .start().addClass('black-box')
          .start().addClass('small-roboto')
            .add('curl -X GET').br()
            .add('\'', this.url$, 'service/dig?dao=', this.data, '\'').br()
            .add('-u \'username/password\'').br()
            .add('-H \'accept: application/json\'').br()
            .add('-H \'cache-control: no-cache\'').br()
            .add('-H \'content-type: application/json\'')
          .end()
        .end()
      .end();
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'PutRequestView',
  extends: 'foam.u2.View',

  imports: [
    'appConfig'
  ],

  properties: [
    {
      name: 'url',
      expression: function(appConfig) {
        return appConfig && appConfig.url;
      }
    }
  ],

  messages: [
    {
      name: 'Label',
      message: '(Create & Update) POST Request: '
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
      .start().addClass('light-roboto-h2')
        .style({ 'margin-top': '15px' })
        .add(this.Label)
      .end()
      .start().addClass('black-box')
        .start().addClass('small-roboto')
          .add('curl -X POST').br()
          .add('\'', this.url$, 'service/dig?dao=', this.data.n.name, '\'').br()
          .add('-u \'username/password\'').br()
          .add('-d \'{' + this.data.props + '}' + '\'' ).br()
          .add('-H \'accept: application/json\'').br()
          .add('-H \'cache-control: no-cache\'').br()
          .add('-H \'content-type: application/json\'')
        .end()
      .end();
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'ServiceListView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'nSpecDAO',
    'AuthenticatedNSpecDAO'
  ],

  requires: [
    'foam.nanos.boot.NSpec'
  ],

  css: `
    ^ {
      width: 275px;
      overflow: auto;
      height: 575px;
      margin-top: 30px;
      font-weight: 300;
    }
    ^ .menu-title{
      font-size: 20px;
      font-weight: 300;
      padding-bottom: 20px;
    }
    ^ .menuItem {
      border-bottom: 1px solid white;
      height: 15px;
      margin-top: 8px;
    }
    ^ .menuItem:hover{
      border-bottom: 1px solid black;
      width: max-content;
      cursor: pointer;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this.start().addClass(this.myClass())
      .select(this.AuthenticatedNSpecDAO.orderBy(this.NSpec.NAME), function(n) {
        var cls = JSON.parse(n.client);
        var clsName = cls.of ? cls.of : cls.class;
        if ( ! foam.lookup(clsName, true) ) return;
        this.start().addClass('menuItem')
          .add(n.name)
          .on('click', function() {
            document.getElementById(n.name).scrollIntoView();
          })
        .end();
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'ExpandContainer',
  extends: 'foam.u2.Element',
  documentation: 'Provide an expandable div' +
      ' which take content to display inside.',

  imports: [
    'stack'
  ],

  properties: [
    {
      name: 'expandBox',
      value: false
    },
    'title',
    'link',
    'linkView'
  ],

  css: `
    ^ {
      min-width: 100px;
      min-height: 80px;
      margin-bottom: 20px;
      padding: 20px;
      border-radius: 2px;
      background-color: white;
      box-sizing: border-box;
      margin: auto;
    }
    ^ .boxTitle {
      opacity: 0.6;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 20px;
      font-weight: 300;
      line-height: 20px;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
      position: relative;
      top: 10px;
    }
    ^ .expand-BTN{
      width: 50px;
      height: 40px;
      margin-top: 25px;
      border-radous: 2px;
      background-color: #59a5d5;
      border-radius: 2px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
      cursor: pointer;
      display: inline-block;
      float: right;
      position: relative;
    }
    ^ .close-BTN{
      width: 50px;
      height: 40px;
      margin-top: 25px;
      border-radius: 2px;
      // background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: /*%BLACK%*/ #1e1f21;
      cursor: pointer;
      display: inline-block;
      float: right;
    }
    ^ .expand-Container{
      height: auto;
      display: inline-block;
      overflow: hidden;
      transition: max-height 1.6s ease-out;
      transition: width 1.6s ease-out;
      max-height: 1725px;
      margin: 0 auto;
      margin-right: 0;
      -webkit-transition: -webkit-transform 1.6s ease-out;
      -moz-transition: -moz-transform 1.6s ease-out;
      -ms-transition: -ms-transform 1.6s ease-out;
    }
    ^ .expandTrue{
      max-height: 0px;
      width: 0px;
    }
    ^ .link-tag{
      display: inline-block;
      border-bottom: 1px solid #59a5d5;
      color: #59a5d5;
      margin-left: 50px;
      position: relative;
      top: 10px;
      cursor: pointer;
    }
    ^ .action-container{
      float: right;
      width: 60px;
      display: inline-block;
    }
  `,

  methods: [
    function init() {
      var self = this;
      this
      .addClass(this.myClass())
      .start()
        .start().addClass('action-container')
          .start().addClass('boxTitle')
            .add(this.title)
          .end()
          .callIf(this.link, function() {
            this.start().addClass('link-tag')
              .add(self.link).on('click', function() {
                self.stack.push({ class: self.linkView });
              })
            .end();
          })
          .start()
            .addClass('expand-BTN')
            .enableClass('close-BTN', this.expandBox$, true)
            .add(this.expandBox$.map(function(e) {
              return e ? '<' : '>';
            }))
            .enableClass('', self.expandBox = (self.expandBox ? false : true))
            .on('click', function() {
              self.expandBox = ( self.expandBox ? false : true );
            })
          .end()
        .end()
        .start().addClass('expand-container')
          .addClass('expand-Container')
          .enableClass('expandTrue', self.expandBox$)
          .start('div', null, this.content$).end()
        .end()
      .end();
    }
  ]
});
