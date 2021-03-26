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
  package: 'net.nanopay.account',
  name: 'EnforceOneDefaultDigitalAccountPerCurrencyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Checks default digital account with same currency already exists, if so, prevents creating another',

  javaImports: [
    'foam.dao.ArraySink',
    'static foam.mlang.MLang.*',
    'java.util.List',
    'java.util.Iterator',
    'foam.nanos.auth.LifecycleState'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      if ( ! ( obj instanceof DigitalAccount ) ) {
        return getDelegate().put_(x, obj);
      }
      DigitalAccount account = (DigitalAccount) obj;

      if ( getDelegate().find(account.getId()) == null ) {
        List data  = ((ArraySink) getDelegate()
          .where(
                 AND(
                     INSTANCE_OF(DigitalAccount.class),
                     EQ(DigitalAccount.OWNER, account.getOwner()),
                     EQ(DigitalAccount.DENOMINATION, account.getDenomination()),
                     EQ(DigitalAccount.TRUST_ACCOUNT, account.getTrustAccount()),
                     EQ(DigitalAccount.IS_DEFAULT, true),
                     EQ(DigitalAccount.LIFECYCLE_STATE, LifecycleState.ACTIVE)
                     )
                 )
          .select(new ArraySink())).getArray();

          if ( data.size() == 0 ) {
            account.setIsDefault(true); // No default account for currency so make this default
          } else if ( data.size() > 0 && account.getIsDefault()) {
            Iterator i = data.iterator();
            while ( i.hasNext() ) {
              try {
                DigitalAccount d = (DigitalAccount) ((DigitalAccount) i.next()).deepClone();
                d.setIsDefault(false);
                getDelegate().put_(x, d);
              } catch ( Throwable ignored ) { }
            }
          }
      }

      return super.put_(x, obj);
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public EnforceOneDefaultDigitalAccountPerCurrencyDAO(foam.core.X x, foam.dao.DAO delegate) {
  System.err.println("Direct constructor use is deprecated. Use Builder instead.");
  setDelegate(delegate);
}
        `);
      },
    },
  ]
});
