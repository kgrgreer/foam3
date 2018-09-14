package net.nanopay.security;

import org.bouncycastle.util.encoders.Hex;
import net.nanopay.security.Receipt;

public class MerkleTreeHelper {

  public static void setPath(byte[][] tree, byte[] hash, Receipt receipt)
    throws java.lang.RuntimeException, java.lang.RuntimeException {

    if ( tree == null || hash == null || receipt == null ) {
      throw new IllegalArgumentException("MerkleTreeHelper :: Error :: null arguement encounted.");
    }

    int index = -1;
    byte[][] walkedPath;

    for ( int n = (int) Math.ceil(tree.length / 2) ; n < tree.length ; n++ ){
      if ( tree[n] != null && Hex.toHexString(tree[n]).equals(Hex.toHexString(hash)) ){
        index = n;
        break;
      }
    }

    receipt.setDataIndex(index);

    if ( index == -1 ) {
      throw new RuntimeException("MerkleTreeHelper :: Error :: Hash not found in the tree!");
    }

    // Easier to compute 1 (instead of 0) indexed arrays.
    int adjustedIndex = index + 1;

    int totalPaths = logBase2(adjustedIndex);
    walkedPath = new byte[totalPaths][tree[index].length];

    for ( int j = 0 ; j < totalPaths ; j++ ){
      int predictedIndex = (int) Math.floor((adjustedIndex) / Math.pow(2, j)) ^ 1;

      if ( tree[predictedIndex - 1] != null )
        walkedPath[j] = tree[predictedIndex - 1];
      else
        walkedPath[j] = tree[getSibling(predictedIndex - 1)];
    }

    receipt.setPath(walkedPath);
  }

  /**
   * Source: https://stackoverflow.com/a/3305710
   * @param bits
   * @return Log base 2 value of bits
   */
  public static int logBase2(int bits) {
    int log = 0;

    if ( ( bits & 0xffff0000 ) != 0 ) { bits >>>= 16; log = 16; }
    if ( bits >= 256 ) { bits >>>= 8; log += 8; }
    if ( bits >= 16  ) { bits >>>= 4; log += 4; }
    if ( bits >= 4   ) { bits >>>= 2; log += 2; }

    return log + ( bits >>> 1 );
  }

  public static int getSibling(int index){
    if ( index % 2 == 0 ) //index is right sibling
      return index - 1;
    else {//index is left sibling;
      int parent = (index - 1) / 2;
      return parent - 1;
    }
  }
}
