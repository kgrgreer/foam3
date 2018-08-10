package net.nanopay.security;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class HashTree {
  byte[][] tree_ = null;

  public HashTree(byte[][] data, String hashAlgorithm)
    throws NoSuchAlgorithmException {
    constructTree(data, hashAlgorithm);
  }

  public void constructTree(byte[][] data, String hashAlgorithm)
    throws NoSuchAlgorithmException {
    int totalDataNodes = data.length;

    if ( tree_ == null && totalDataNodes > 0 ) {
      tree_ = new byte[totalDataNodes * 2][data[0].length];

      MessageDigest md = MessageDigest.getInstance(hashAlgorithm);

      // copy nodes to the array
      for (int i = totalDataNodes; i < totalDataNodes * 2 - 1; i++) {
        tree_[i] = data[i - totalDataNodes];
      }

      // build the tree
      for ( int k = totalDataNodes - 1; k >=0; k-- ){
        tree_[k] = md.digest(combineHashes(tree_[2 * k], tree_[2 * k + 1]));
      }
    } else {
      System.err.println("ERROR :: HashTree already exsists.");
    }
  }

  protected byte[] combineHashes(byte[] hashOne, byte[] hashTwo){
    byte[] combinedHash = new byte[hashOne.length + hashTwo.length];

    System.arraycopy(hashOne, 0, combinedHash, 0, hashOne.length);
    System.arraycopy(hashTwo, 0, combinedHash, 0, hashTwo.length);

    return combinedHash;
  }

  public byte[][] getTree(){
    return tree_ == null ? null : tree_;
  }
}
