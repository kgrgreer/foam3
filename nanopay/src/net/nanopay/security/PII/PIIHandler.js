foam.CLASS({
  package: 'net.nanopay.security.PII',
  implements: [
    'net.nanopay.security.PII.PII'
  ],
  name: 'PIIHandler',
  documentation: 'handles User PII (personally identifiable information) reporting and requests',

  javaImports: [
    'foam.nanos.auth.User',
    'java.util.List',
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.core.X',
    'org.json.simple.JSONObject'
  ],

  imports: [
    'userDAO'
  ],

  methods: [
    {
      name: 'getPIIData',
      documentation: 'return an array of all model properties that contain PII',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'userID',
          class: 'Long'
        }
      ],
      javaReturns: 'JSONObject',
      javaCode:
        `
  // Find the user
  DAO userDAO = (DAO) x.get("userDAO");
  User user = (User) userDAO.find_(x, userID );
  
  JSONObject propertyValueJson = new JSONObject();

  // Iterate through properties of User, push to jsonObject if they containPII
  List axioms = foam.nanos.auth.User.getOwnClassInfo().getAxioms();
  for (Object propertyObject : axioms) {
    foam.core.PropertyInfo property = (foam.core.PropertyInfo) propertyObject;
    if ( property.containsPII() ) {
      try {
        propertyValueJson.put(property.getName() , property.get(user).toString());
      } catch (Exception e) {
      // ignore cases in which PII field is null
        ; 
      }
    }      
    }           
  return propertyValueJson;
      `
    }
  ],
});
