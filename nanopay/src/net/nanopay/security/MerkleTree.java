package net.nanopay.security;

import java.security.NoSuchAlgorithmException;
import java.security.MessageDigest;

public class MerkleTree {

  protected static final int DEFAULT_SIZE = 50000;

  protected byte[][] data_ = null;
  protected int size_ = 0;
  protected String hashAlgorithm_;
  protected int treeDepth_ = 0;


  private ThreadLocal<MessageDigest> md_ = new ThreadLocal<MessageDigest>() {
    @Override
    protected MessageDigest initialValue() {
      try {
        return MessageDigest.getInstance(hashAlgorithm_);
      } catch (NoSuchAlgorithmException e) {
        throw new RuntimeException(e);
      }
    }

    @Override
    public MessageDigest get() {
      MessageDigest md = super.get();
      md.reset();
      return md;
    }
  };

  /**
   * Constructor for Merkle tree. Assumes that the default algorithm for the
   * hash is SHA-256.
   */
  public MerkleTree (){
    this("SHA-256");
  }

  /**
   * Constructor for the Merkle tree. Sets the algorithm for hashing to whatever
   * that is specified.
   *
   * @param hashAlgorithm Name of the hashing algorithm to be set for hashing.
   */
  public MerkleTree (String hashAlgorithm){
    hashAlgorithm_ = hashAlgorithm;
  }

  /**
   * This method appends a new hash to the list of hashes that need to be built
   * into a Merkle tree.
   *
   * @param newHash Hash value that is to be added to the Merkle tree.
   */
  public void addHash(byte[] newHash){
    if ( data_ == null ){
      data_ = new byte[DEFAULT_SIZE][newHash.length];
    } else if ( size_ == DEFAULT_SIZE ) {
      byte[][] oldData = data_;
      data_ = new byte[size_ + DEFAULT_SIZE][newHash.length];
      System.arraycopy(oldData, 0, data_, 0, size_);
    }

    data_[size_++] = newHash;
  }

  /**
   * This method builds the Merkle tree from the data that was already being
   * pushed to the object. Once the tree is built, the state of the object is
   * cleared.
   *
   * @return The new Merkle tree that was built.
   * @throws NoSuchAlgorithmException
   */
  public byte[][] buildTree() {
    if ( size_ == 0 ) {
      System.err.println("ERROR :: There is no data to build a HashTree.");
      return null;
    } else if ( size_ == 1 ) {
      addHash(data_[0]);
    }

    byte[][] tree;
    MessageDigest md = md_.get();
    int totalTreeNodes = (int) computeTotalTreeNodes();
    tree = new byte[totalTreeNodes][data_[0].length];

    // copy nodes to the array
    int dataCount = 0;
    for ( int i = totalTreeNodes - (int) Math.pow(2, treeDepth_); i < totalTreeNodes ; i++ ) {
      if ( dataCount < size_ )
        tree[i] = data_[dataCount];
      else
        tree[i] = null;

      dataCount++;
    }

    // build the tree
    for ( int index = totalTreeNodes - (int) Math.pow(2, treeDepth_) - 1; index >= 0; --index ){
      int leftIndex = 2 * index + 1;
      int rightIndex = leftIndex + 1;

      if ( tree[leftIndex] == null ) {
        // If the left branch of the node is fake; then this node is also fake
        tree[index] = null;
      } else if ( tree[rightIndex] == null ) {
        /* If the right branch of the node is fake; then this node is the
            double hash of the left branch */
        md.update(tree[leftIndex]);
        md.update(tree[leftIndex]);
        tree[index] = md.digest();
      } else {
        // Default hash is the hash of the left and right branches
        md.update(tree[leftIndex]);
        md.update(tree[rightIndex]);
        tree[index] = md.digest();
      }
    }

    // reset the state of the object prior to returning for the next tree.
    data_ = null;
    size_ = 0;

    return tree;
  }

  /**
   * This method returns the total number of nodes that will be required to
   * build the tree. This number includes the number of empty nodes that will
   * have to be created in order for the tree to be balanced at every level of
   * the tree.
   *
   * @return Total number of nodes required to build the Merkle tree.
   */
  protected int computeTotalTreeNodes(){
    int nodeCount = 0;
    int levelNodes;

    treeDepth_ = 0;

    if ( size_ == 1 ) {
      ++treeDepth_;
      return 3;
    }

    while ( true ){
      levelNodes = (int) Math.pow(2, treeDepth_);
      nodeCount += levelNodes;

      if ( size_ <= levelNodes ) break;
      /* TODO(Dhiren) use dynamic programming and save the previously calculated values in a static. */
      ++treeDepth_;
    }

    return nodeCount;
  }
}
