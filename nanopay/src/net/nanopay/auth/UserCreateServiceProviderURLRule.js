foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'UserCreateServiceProviderURLRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: 'Set ServiceProvider on User Create based on AppConfig URL',

  properties: [
    {
      name: 'config',
      class: 'FObjectArray',
      of: 'ServiceProviderURL',
      factory: function(){
        return  [];
      },
      javaFactory: 'return new String[0];'
    }
  ]
});
