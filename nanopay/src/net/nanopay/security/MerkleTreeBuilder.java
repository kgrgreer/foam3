package net.nanopay.security;

import java.security.NoSuchAlgorithmException;

import net.nanopay.security.HashTree;

public class MerkleTreeBuilder {
  protected int dataItemsSize_ = 50000;
  protected byte[][] data_ = null;
  protected int totalDataItems_ = 0;
  protected String hashAlgorithm_ = null;

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

      for (int i = 0; i < totalDataItems_; i++){
        data_[i] = oldData[i];
      }
    }

    data_[totalDataItems_] = newHash;
    ++totalDataItems_;
  }

  public HashTree buildTree()
    throws NoSuchAlgorithmException {
    if ( totalDataItems_ == 0 ){
      return null;
    } else {
      return new HashTree(data_, hashAlgorithm_);
    }
  }
}
