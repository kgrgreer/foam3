//
//  TransactionService.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-03.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class TransactionService: Service {
  public static let instance = TransactionService()

  public enum TransactionError: ServiceErrorProtocol {
    case TransactionNotFound

    func description() -> String {
      switch(self) {
        case .TransactionNotFound:
          return "Transaction not found."
      }
    }
  }

  init() {
    super.init(withURL: ServiceURL.Transaction)
  }

  public func transferValueBy(transaction: Transaction,
                              putDispatchQueue: DispatchQueue = DispatchQueue.global(qos: .background),
                              callbackDispatchQueue: DispatchQueue = DispatchQueue.main,
                              callback: @escaping (Any?) -> Void)
  {
    // TODO: Add User Authenticity
    putDispatchQueue.async {
      do {
        let placedTransaction = (try self.dao.put(transaction)) as? Transaction
        callbackDispatchQueue.async {
          callback(placedTransaction)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        callbackDispatchQueue.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }

  public func getTransactions(startingAt skip:  Int? = 0,
                              withLimit  limit: Int? = 100,
                              callback:  @escaping (Any?) -> Void)
  {
    // TODO: Add User Authenticity
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        let sink = (try self.dao.skip(skip!).limit(limit!).select(ArraySink())) as? ArraySink
        DispatchQueue.main.async {
          callback(sink?.array)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }

  public func getTransactionBy(id: Int, callback:  @escaping (Any?) -> Void) {
    DispatchQueue.global(qos: .userInitiated).async {
      guard let error = UserService.instance.isUserFullyVerified() else {
        do {
          //        let sink = (try self.dao.skip(skip!).limit(limit!).select(ArraySink())) as? ArraySink
          DispatchQueue.main.async {
            
          }
        } catch let e {
          NSLog(((e as? FoamError)?.toString()) ?? "Error!")
          DispatchQueue.main.async {
            callback(ServiceError.Failed)
          }
        }
        return
      }
      DispatchQueue.main.async {
        callback(error)
      }
    }
  }
}
