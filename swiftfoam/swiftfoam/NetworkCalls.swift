//
//  NetworkCalls.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-09-25.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

import Foundation

let host: String = "http://localhost:8080/"
enum ServiceURL: String {
  func path() -> String {
    return "\(host)\(self.rawValue)"
  }

  case Transaction = "transactionDAO"
}

public class TransactionService {
  public static let instance = TransactionService()

  private lazy var boxContext: BoxContext = {
    return Context.GLOBAL.create(BoxContext.self)!
  }()
  private lazy var X: Context = {
    return self.boxContext.__subContext__
  }()
  private var dao: ClientDAO!

  init() {
    FOAM_utils.registerClasses()
    X = boxContext.__subContext__

    let httpBox = X.create(HTTPBox.self)!
    httpBox.url = ServiceURL.Transaction.path()

    dao = X.create(ClientDAO.self)!
    dao.delegate = httpBox
  }

  public func transferValueBy(transaction: Transaction, callback: @escaping (Any?) -> Void) {
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        let placedTransaction = (try self.dao.put(transaction)) as? Transaction
        DispatchQueue.main.async {
          callback(placedTransaction)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(nil)
        }
      }
    }
  }

  public func transferValueBy(payer payerId: Int,
                              payee payeeId: Int,
                              amount: Int,
                              rate: Float? = 1,
                              purpose: TransactionPurpose?,
                              fees: Int? = 0,
                              notes: String? = "",
                              callback: @escaping (Any?) -> Void)
  {
    DispatchQueue.global(qos: .userInitiated).async {
      let transaction = self.X.create(Transaction.self)!
      transaction.payerId = payerId
      transaction.payeeId = payeeId
      transaction.amount = amount
      transaction.rate = rate!
      transaction.fees = fees!
      transaction.notes = notes!

      do {
        let placedTransaction = (try self.dao.put(transaction)) as? Transaction
        DispatchQueue.main.async {
          callback(placedTransaction)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(nil)
        }
      }
    }
  }

  public func getTransactions(startingAt skip:  Int? = 0,
                              withLimit  limit: Int? = 100,
                              callback:  @escaping ([Any?]?) -> Void)
  {
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        let sink = (try self.dao.skip(skip!).limit(limit!).select(ArraySink())) as? ArraySink
        DispatchQueue.main.async {
          callback(sink?.array)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(nil)
        }
      }
    }
  }
}


