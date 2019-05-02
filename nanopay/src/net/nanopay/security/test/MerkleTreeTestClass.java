package net.nanopay.security.test;

import net.nanopay.security.MerkleTree;

public class MerkleTreeTestClass
extends MerkleTree {

  public void setDefaultSize(int size) {
    defaultSize_ = size;
  }

  public byte[][] getData() {
    return data_;
  }
}
