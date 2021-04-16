/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.nanos.test.Test;

public class NullServiceTest extends Test {
  interface DummyInterface {
    void     test();
    boolean  getBoolean();
    byte     getByte();
    char     getChar();
    short    getShort();
    int      getInt();
    long     getLong();
    float    getFloat();
    double   getDouble();
    String   getString();
  }

  public void runTest(X x) throws Throwable {
    var nullService = new NullService();
    var dummy = nullService.create(DummyInterface.class);
    try {
      dummy.test();
      test( false == dummy.getBoolean(), "NullService test boolean method." );
      test( 0     == dummy.getByte(), "NullService test byte method." );
      test( 0     == dummy.getChar(), "NullService test char method." );
      test( 0     == dummy.getShort(), "NullService test short method." );
      test( 0     == dummy.getInt(), "NullService test int method." );
      test( 0     == dummy.getLong(), "NullService test long method." );
      test( 0     == dummy.getFloat(), "NullService test float method." );
      test( 0     == dummy.getDouble(), "NullService test double method." );
      test( null  == dummy.getString(), "NullService test String/Object method." );
    } catch ( java.lang.Exception e ) {
      test(false, "NullService should not throw exception.");
    }
  }
}
