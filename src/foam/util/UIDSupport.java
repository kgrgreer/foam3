/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

public class UIDSupport {
  /**
   * Modulo constant for UID checksum.
   *
   * CHECKSUM_MOD must be <= 1/2 * (0xfff - 0x100) = 1919, where 0x100 and
   * 0xfff are the min and max values of three hex digits. The bound of the
   * CHECKSUM_MOD is to ensure the checksum after permutation is exactly three
   * hex digits.
   */
  public final static int CHECKSUM_MOD = 997;

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

  /**
   * Permute id string according to the {@link #PERMUTATION_SEQ} then shift
   * the id based on the checksum to further randomize the generated id because
   * the {@link #PERMUTATION_SEQ} is fixed.
   *
   * The checksum in the id string will be placed at the beginning of the
   * output string and its value is bumped up to avoid leading zeros since they
   * could be lost during long integer uid conversion from and to hex string
   * then mess up the length and permutation sequence when calculating its hash.
   *
   * @param idStr Source id string to permute
   * @return Generated unique ID
   */
  public static String permute(String idStr) {
    var l = idStr.length() - 3;
    var checksum = Integer.parseInt(idStr.substring(l), 16) + 256;
    var id = new char[l];
    idStr.getChars(0, l, id, 0);

    for ( int i = 0 ; i < l ; i++ ) {
      int newI = PERMUTATION_SEQ[i] % l;
      char c   = id[newI];
      id[newI] = id[i];
      id[i]    = c;
    }

    // shift id based on the checksum
    var n = checksum % 16;
    for ( int i = 0 ; i < l ; i++ ) {
      id[i] = shift(id[i], n);
    }
    return toHexString(checksum, 3) + String.valueOf(id);
  }

  /**
   * Shift the character `n' positions in the hex digit space.
   */
  private static char shift(char c, int n) {
    int digit = Character.digit(c, 16);
    return Character.forDigit ((digit + n) % 16, 16);
  }

  /**
   * Undo/reverse permute the generated unique id returned from
   * {@code permute(idStr) }.
   *
   * @param idStr Generated unique id
   * @return Source id string
   */
  public static String undoPermute(String idStr) {
    var checksum = Integer.parseInt(idStr.substring(0, 3), 16) - 256;
    var id = idStr.substring(3).toCharArray();

    // un-shift id based on the checksum
    var n = checksum % 16;
    for ( int i = 0 ; i < id.length ; i++ ) {
      id[i] = unshift(id[i], n);
    }

    for ( int i = id.length - 1; i >= 0; i-- ) {
      int newI = PERMUTATION_SEQ[i] % id.length;
      char c   = id[newI];
      id[newI] = id[i];
      id[i]    = c;
    }
    return String.valueOf(id) + toHexString(checksum, 3);
  }

  private static char unshift(char c, int n) {
    int digit = Character.digit(c, 16);
    return Character.forDigit ((digit - n + 16) % 16, 16);
  }

  /**
   * Calculate the hash value of a generated string unique id.
   *
   * @param uid Generated unique id
   * @return Hash of the unique id
   */
  public static int hash(String uid) {
    var hex = undoPermute(uid);
    return mod(Long.parseLong(hex, 16));
  }

  /**
   * Calculate the hash value of a generated long integer unique id.
   *
   * @param uid Generated unique id
   * @return Hash of the unique id
   */
  public static int hash(long uid) {
    return hash(Long.toHexString(uid));
  }

  /**
   * Calculate the checksum of a (salt) string.
   *
   * @param s Input (salt) string
   * @return checksum
   */
  public static int mod(String s) {
    return mod(Math.abs(s.hashCode()));
  }

  /**
   * Calculate the checksum modulus of a number.
   *
   * @param n Input number
   * @return checksum
   */
  public static int mod(long n) {
    return (int) (n % CHECKSUM_MOD);
  }

  /**
   * Convert a long integer to hex string.
   *
   * @param l Input long integer
   * @return Hex string equivalent to the input
   */
  public static String toHexString(long l) {
    return toHexString(l, 0);
  }

  /**
   * Convert a long integer to hex string and format with according to the
   * desired numberOfBytes given.
   *
   * Eg. toHexString(11, 4); // => "000b"
   *
   * @param l Input long integer
   * @param numberOfBytes Number of minimum bytes for formatting the hex string
   * @return Hex string equivalent to the input
   */
  public static String toHexString(long l, int numberOfBytes) {
    var sb = new StringBuilder(Long.toHexString(l));
    while ( sb.length() < numberOfBytes ) {
      sb.insert(0, '0');
    }
    return sb.toString();
  }
}
