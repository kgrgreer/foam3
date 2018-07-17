foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'UserInfo',
  extends: 'net.nanopay.sps.model.RequestPacket',

  properties: [
    {
      class: 'String',
      name: 'name',
    },
    {
      class: 'String',
      name: 'acct'
    },
    {
      class: 'String',
      name: 'other'
    },
    {
      class: 'String',
      name: 'location'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'secc'
    },
    {
      class: 'String',
      name: 'ptc'
    }
  ],

  javaImports: [
    'java.util.*',
    'foam.core.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
{
list = new ArrayList<>();
list.add(UserInfo.NAME);
list.add(UserInfo.ACCT);
list.add(UserInfo.OTHER);
list.add(UserInfo.LOCATION);
list.add(UserInfo.TYPE);
list.add(UserInfo.SECC);
list.add(UserInfo.PTC);
}

public String toSPSString() {
  StringBuilder sb = new StringBuilder();   
  
  for (PropertyInfo propertyInfo : list) {
    sb.append("[").append(propertyInfo.getName().toUpperCase()).append("]").append(propertyInfo.get(this)).append("[/")
      .append(propertyInfo.getName().toUpperCase()).append("]");
  }
            
  return sb.toString();
}
        `);
      }
    }
  ]

});
