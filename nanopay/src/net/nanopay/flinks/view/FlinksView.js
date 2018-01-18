foam.CLASS({
  package: 'net.nanopay.flinks.view',
  name: 'FlinksView',
  extends: 'foam.u2.Controller',
  
  documentation: 'View displaying bank Selection',
  
  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 992px;
          height: 694px;
          margin: auto;
        }
        ^ .Header-Title {
          margin: 40px 0 0 180px;
        }
      */}
    })
  ],

  messages: [
    { name: 'title', message: 'Connect a new bank account'}
  ],

  properties: [
    {
      class: 'String',
      name: 'p1'
    },
    {
      class: 'Boolean',
      name: 'p2',
      value: true
    }
  ],

  methods: [
    function init() {
      this.slot('p1').sub(function(){
        //console.log('subing: ');
      });
      //this.TACKLE.createIsEnabled$(this.p2$);
    },

    function initE(){
      this.SUPER();
      var self = this;
      
      this
        .addClass(this.myClass())
        .start('div')
          .tag(this.AUTH_FORM, { showLabel: true})
          .tag(this.TEST)
          .tag(this.TACKLE)
          .tag(this.SSLOT)
        .end();
    }
  ],

  actions: [
    {
      name: 'authForm',
      label: 'auth a new bank account',
      code: function(X) {
        //X.stack.push({class: 'net.nanopay.flinks.view.form.FlinksForm', isCustomNavigation: true})
        X.stack.push({class: 'net.nanopay.flinks.view.form.FlinksForm', isCustomNavigation: true})
      }
    },
    {
      name: 'test',
      label: 'Enable test',
      isEnabled: function() {
        return this.p2;
      },
      code: function(X) {
        X.stack.push({class: 'net.nanopay.flinks.view.form.FlinksForm'})
      }
    },
    {
      name: 'tackle',
      label: 'controller',
      code: function(X) {
        this.p2 = ! this.p2;
        console.log(this.p2);
      }
    },
    {
      name: 'sslot',
      label: 'add',
      code: function(X) {
        console.log(this);
        var a = this.p1;
        console.log(this.p1);
        var b = this.p4;
        this.p1 = this.p1 + 'a';
        console.log(this.p1);
        console.log(this);
      }
    }
  ]
});