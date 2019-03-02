package net.nanopay.security;

import net.nanopay.security.receipt.Receipt;

import java.util.Arrays;

/**
 * This class is a utility class for encapsulating operators on the Merkle Tree.
 */
public class MerkleTreeHelper {

  /**
   * Provided: a tree, a hash, and a receipt, this method finds the hash in the
   * tree and returns the relevant hashes in the tree that when combined with
   * the provided hash would result in the top hash for the tree. The list of
   * hashes (path) is the list of hashes whose index is closes to the node of
   * interest. Hence, in order to compute the top hash for the tree, one would
   * have to simply combine and append the hashes in the order provided. The
   * direction of the hash combination can be computed from the dataIndex value
   * stored in the receipt.
   *
   * @param tree    Merkle tree for the epoch, which contains all of the hashes.
   * @param hash    The hash for which relevant hashes need to be found.
   * @param receipt The Receipt object where the list of hashes will be stored,
   *                along with the position of the provided hash.
   * @throws java.lang.RuntimeException
   * @throws java.lang.IllegalArgumentException
   */
  public static Receipt SetPath(byte[][] tree, byte[] hash, Receipt receipt)
    throws java.lang.RuntimeException, java.lang.IllegalArgumentException {

    if ( tree == null || hash == null || receipt == null ) {
      throw new IllegalArgumentException("MerkleTreeHelper :: Error :: null argument encountered.");
    }

    int index = FindHashIndex(tree, hash);
    byte[][] walkedPath;

    receipt.setDataIndex(index);

    if ( index == -1 ) {
      throw new RuntimeException("MerkleTreeHelper :: Error :: Hash not found in the tree!");
    }

    // Easier to compute 1 indexed arrays instead of 0.
    index++;

    int totalPaths = LogBase2(index);
    walkedPath = new byte[totalPaths][tree[index - 1].length];

    for ( int j = 0 ; j < totalPaths ; j++ ){
      int predictedIndex = (int) Math.floor((double) index / Math.pow(2, j)) ^ 1;

      /*
        Since the calculation is based on 1 indexed array, we must adjust the
        indices.
       */
      if ( tree[predictedIndex - 1] != null ) // Check if it is a fake node
        walkedPath[j] = tree[predictedIndex - 1];
      else
        /*
          In case of fake nodes, return the index of the sibling, since the
          intermediate hash will be the twice hash of the sibling
         */
        walkedPath[j] = tree[GetSibling(predictedIndex - 1)];
    }

    receipt.setPath(walkedPath);
    return receipt;
  }

  /**
   * This methods finds and return the index of the hash in the tree provided.
   * If the hash isn't found, then a value of -1 is returned.
   *
   * @param tree  Merkle tree where the hash hash to be found.
   * @param hash  The hash that is to be found.
   * @return The index of the hash in the tree.
   */
  private static int FindHashIndex(byte[][] tree, byte[] hash){
    for ( int n = (int) Math.floor((double) tree.length / 2.0 ) ; n < tree.length ; n++ ){
      if ( Arrays.equals(tree[n], hash) ){
        return n;
      }
    }

    return -1;
  }

  /**
   * Source: https://stackoverflow.com/a/3305710
   *
   * @param bits
   * @return Log base 2 value of bits
   */
  private static int LogBase2(int bits) {
    int log = 0;

    if ( ( bits & 0xffff0000 ) != 0 ) { bits >>>= 16; log = 16; }
    if ( bits >= 256 ) { bits >>>= 8; log += 8; }
    if ( bits >= 16  ) { bits >>>= 4; log += 4; }
    if ( bits >= 4   ) { bits >>>= 2; log += 2; }

    return log + ( bits >>> 1 );
  }

  /**
   * This method returns the index of the immediate sibling for the given node
   * index.
   *
   * @param index The node for whose sibling's node index need to be found.
   * @return The index of the sibling in the tree.
   */
  private static int GetSibling(int index){
    if ( index % 2 == 0 ) //index is right sibling
      return index - 1;
    else {//index is left sibling;
      int parent = (index - 1) / 2;
      return parent - 1;
    }
  }
}
