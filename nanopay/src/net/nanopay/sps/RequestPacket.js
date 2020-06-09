/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.sps',
  name: 'RequestPacket',
  abstract: true,

  javaImports: [
    'java.util.*',
    'foam.core.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
  protected List<PropertyInfo> list;
  
  public String toSPSString() {
    StringBuilder sb = new StringBuilder();   
  
    for ( int i = 0; i < list.size(); i++ ) {
      PropertyInfo propertyInfo = list.get(i);
      if ( propertyInfo.isSet(this) && propertyInfo.get(this) != null ) {
        if ( propertyInfo instanceof AbstractFObjectPropertyInfo ) {
         // append sps style xml field
          sb.append(((RequestPacket)propertyInfo.get(this)).toSPSString());
        } else {
          sb.append(propertyInfo.get(this));
        }
      }
      if ( i < list.size() - 1 ) {
        sb.append("<FS>");
      }
    }
              
    return sb.toString();
  }
        `);
      }
    }
  ],
});
