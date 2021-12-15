/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util.concurrent;

/** Thread(Local) state information. **/
class LocalState {
  FoldReducer fr_;
  Object      state_;
  /** True iff this LocalState is currently known to the FoldReducer. **/
  boolean     connected_ = false;

  public LocalState(FoldReducer fr) {
    fr_    = fr;
    state_ = fr_.initialState();
  }

  /**
   * Fold an operation into the state.
   *
   * Needs to be synchronized because it can be accessed by
   * either the local thread or by the FoldReducer.
   *
   * However, this lock should rarely be contested so the
   * overhead is very small.
   **/
   public synchronized void fold(Object op) {
      // This looks like it could be a deadlock but
      // that isn't possible because this would have
      // to be connected first
      if ( ! connected_ ) {
         fr_.connect(this);

         connected_ = true;
      }

      fr_.fold(state_, op);
   }


  /**
   * Return the previous State while resetting to a new initialState
   *
   * @return the old state
   *
   * Needs to be synchronized because it can be accessed by
   * either the local thread or by the FoldReducer.
   *
   * However, this lock should rarely be contested so the
   * overhead is very small.
   **/
  public synchronized Object resetState() {
    Object ret = state_;

    state_ = fr_.initialState();

    connected_ = false;

    return ret;
  }
}
