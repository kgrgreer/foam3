package net.nanopay.security;

import java.security.NoSuchAlgorithmException;
import java.security.MessageDigest;

public class MerkleTreeBuilder {
  protected int dataItemsSize_ = 50000;
  protected byte[][] data_ = null;
  protected int totalDataItems_ = 0;
  protected String hashAlgorithm_ = null;
  private boolean paddedNodes_ = false;

  public void MerkleTreeBuilder(){
    MerkleTreeBuilder("SHA-256");
  }

  public void MerkleTreeBuilder(String hashAlgorithm){
    hashAlgorithm_ = hashAlgorithm;
  }

  public void addHash(byte[] newHash){
    if ( data_ == null ){
      data_ = new byte[dataItemsSize_][newHash.length];
    } else if ( totalDataItems_ == dataItemsSize_ ) {
      byte[][] oldData = data_;
      data_ = new byte[totalDataItems_ + dataItemsSize_][newHash.length];

      for ( int i = 0; i < totalDataItems_; i++ ) {
        data_[i] = oldData[i];
      }
    }

    data_[++totalDataItems_] = newHash;
  }

  public byte[][] buildTree()
    throws NoSuchAlgorithmException {
    if ( totalDataItems_ == 0 ) {
      System.err.println("ERROR :: There is no data to build a HashTree.");
    }

    byte[][] tree = null;
    int totalTreeNodes = computeTotalTreeNodes();
    tree = new byte[totalTreeNodes][data_[0].length];

    MessageDigest md = MessageDigest.getInstance(hashAlgorithm_);

    // copy nodes to the array
    for ( int i = paddedNodes_ ? totalTreeNodes - totalDataItems_ - 1 : totalDataItems_ - 1 ; i < totalTreeNodes; i++ ) {
      if ( paddedNodes_ ) {
        tree[i] = data_[(i - totalDataItems_) + 1];
      } else {
        tree[i] = data_[i - (totalTreeNodes - totalDataItems_ - 1) ];
      }
    }

    // build the tree
    for ( int k = paddedNodes_ ? totalTreeNodes - totalDataItems_ - 2 : totalDataItems_ - 2 ; k >= 0 ; k-- ){
      int leftIndex = 2 * k;
      int rightIndex = 2 * k + 1;

      if ( leftIndex > totalTreeNodes ){
        tree[k] = -1;
      } else if (rightIndex > totalTreeNodes ) {
        tree[k] = md.digest(combineHashes(tree[leftIndex], tree[leftIndex]));
      } else {
        if ( tree[leftIndex] == -1 ){
          tree[k] = -1;
        } else if ( tree[rightIndex] == -1 ) {
          tree[k] = md.digest(combineHashes(tree[leftIndex], tree[leftIndex]));
        } else {
          tree[k] = md.digest(combineHashes(tree[leftIndex], tree[rightIndex]));
        }
      }
    }

    data_ = null;
    totalDataItems_ = 0;

    return tree;
  }

  protected int computeNextLevelNodes(int n){
    if (n % 2 == 0 || n == 1) {
      return n;
    } else {
      return n + 1;
    }
  }

  protected int computeTotalTreeNodes(){
    int n = totalDataItems_;
    int nodeCount = 0;

    while ( n != 1 ){
      nodeCount += computeNextLevelNodes(n);
      n = n / 2;
    }

    if ( totalDataItems_ % 2 != 0 ){
      paddedNodes_ = true;
    }

    return nodeCount;
  }

  protected byte[] combineHashes(byte[] hashOne, byte[] hashTwo){
    byte[] combinedHash = new byte[hashOne.length + hashTwo.length];

    System.arraycopy(hashOne, 0, combinedHash, 0, hashOne.length);
    System.arraycopy(hashTwo, 0, combinedHash, 0, hashTwo.length);

    return combinedHash;
  }
}
