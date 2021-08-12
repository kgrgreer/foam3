/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

public class UIDSupport {
  /**
   * Modulo constant for UID
   */
  public final static int MOD = 997;

  private final static UIDSupport instance__ = new UIDSupport();

  /**
   * A hard coded array used as permutation sequence. It only supports
   * permutation of a string less than 30 digits. The part of a string over
   * 30 digits will not be involved in permutation.
   */
  private final static int[] PERMUTATION_SEQ = new int[] {
    11,  3,  7,  9,  5,  6,  2, 8,  1,  9,
    11, 10,  8, 12,  6, 14,  6, 5, 16,  3,
    17,  2, 20, 18, 24, 17, 25, 3, 16, 12
  };

  private UIDSupport() {}

  public static UIDSupport getInstance() {
    return instance__;
  }

  public String permutate(StringBuilder idStr) {
    int l = idStr.length();
    char[] id = new char[l];
    idStr.getChars(0, l, id, 0);
    for ( int i = 0 ; i < l ; i++ ) {
      int newI = PERMUTATION_SEQ[i];
      char c = id[newI];
      id[newI] = id[i];
      id[i] = c;
    }
    return String.valueOf(id);
  }

  public String undoPermutate(String idStr) {
    int l = idStr.length();
    char[] id = idStr.toCharArray();
    for ( int i = l - 1 ; i >= 0; i-- ) {
      int newI = PERMUTATION_SEQ[i];
      char c = id[newI];
      id[newI] = id[i];
      id[i] = c;
    }
    return String.valueOf(id);
  }

  public int hash(long uid) {
    return hash(Long.toHexString(uid));
  }

  public int hash(String uid) {
    var hex = undoPermutate(uid);
    return mod(Long.parseLong(hex, 16) % MOD);
  }

  public int mod(String s) {
    return Math.abs(s.hashCode()) % MOD;
  }

  public int mod(long n) {
    return (int) (n % MOD);
  }
}
