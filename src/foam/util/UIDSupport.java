/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

public class UIDSupport {
  /**
   * Modulo constant for UID checksum
   */
  public final static int CHECKSUM_MOD = 997;

  private final static UIDSupport instance__ = new UIDSupport();

  /**
   * A hard coded array used as permutation sequence. It only supports
   * permutation of a string less than 30 digits. The part of a string over
   * 30 digits will not be involved in permutation.
   */
  private final static int[] PERMUTATION_SEQ = new int[] {
    9,  3,  7,  9,  5,  6,  2, 8,  1,  4,
    10, 11,  8, 12,  6, 14,  6, 5, 16,  3,
    17,  2, 20, 18, 24, 17, 25, 3, 16, 12
  };

  private UIDSupport() {}

  public static UIDSupport getInstance() {
    return instance__;
  }

  public String permutate(String idStr) {
    var l = idStr.length() - 3;
    var checksum = Integer.parseInt(idStr.substring(l), 16) + 256;
    var id = new char[l];
    idStr.getChars(0, l, id, 0);

    for ( int i = 0 ; i < l ; i++ ) {
      int newI = PERMUTATION_SEQ[i];
      char c = id[newI];
      id[newI] = id[i];
      id[i] = c;
    }
    return toHexString(checksum, 3) + String.valueOf(id);
  }

  public String undoPermutate(String idStr) {
    var checksum = Integer.parseInt(idStr.substring(0, 3), 16) - 256;
    var id = idStr.substring(3).toCharArray();

    for ( int i = id.length - 1 ; i >= 0; i-- ) {
      int newI = PERMUTATION_SEQ[i];
      char c = id[newI];
      id[newI] = id[i];
      id[i] = c;
    }
    return String.valueOf(id) + toHexString(checksum, 3);
  }

  public int hash(long uid) {
    return hash(Long.toHexString(uid));
  }

  public int hash(String uid) {
    var hex = undoPermutate(uid);
    return mod(Long.parseLong(hex, 16));
  }

  public int mod(String s) {
    return mod(Math.abs(s.hashCode()));
  }

  public int mod(long n) {
    return (int) (n % CHECKSUM_MOD);
  }

  public String toHexString(long l) {
    return toHexString(l, 0);
  }

  public String toHexString(long l, int numberOfBits) {
    var sb = new StringBuilder(Long.toHexString(l));
    while ( sb.length() < numberOfBits ) {
      sb.insert(0, '0');
    }
    return sb.toString();
  }
}
