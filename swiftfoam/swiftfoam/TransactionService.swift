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
    putDispatchQueue.async {
      let auth = UserService.instance.isUserFullyVerified()
      guard auth.isFullyVerified else {
        callbackDispatchQueue.async {
          callback(auth.error)
        }
        return
      }
      do {
        guard let newTransaction = (try self.dao.put(transaction)) as? Transaction else {
          callbackDispatchQueue.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }
        callbackDispatchQueue.async {
          callback(newTransaction)
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
    DispatchQueue.global(qos: .userInitiated).async {
      guard let user = UserService.instance.getLoggedInUser() else {
        callback(UserService.UserError.UserNotLoggedIn)
        return
      }
      do {
        // predicate to return transactions that have the logged in user involved
        let orPred = [
          self.X.create(Eq.self, args: [
            "arg1": Transaction.classInfo().axiom(byName: "payerId"),
            "arg2": user.id,
          ]),
          self.X.create(Eq.self, args: [
            "arg1": Transaction.classInfo().axiom(byName: "payeeId"),
            "arg2": user.id,
          ])
        ]
        let pred = self.X.create(Or.self, args: [
          "args": orPred
        ])

        guard let sink = (try self.dao.`where`(pred).skip(skip!).limit(limit!).select(ArraySink())) as? ArraySink else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }
        DispatchQueue.main.async {
          callback(sink.array)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }

  public func getTransactionBy(transactionId id: Int, callback:  @escaping (Any?) -> Void) {
    DispatchQueue.global(qos: .userInitiated).async {
      guard let user = UserService.instance.getLoggedInUser() else {
        callback(UserService.UserError.UserNotLoggedIn)
        return
      }
      do {
        // predicate to return the transaction that the logged in user was involved in
        let orPred = [
          self.X.create(Eq.self, args: [
            "arg1": Transaction.classInfo().axiom(byName: "payerId"),
            "arg2": user.id
          ]),
          self.X.create(Eq.self, args: [
            "arg1": Transaction.classInfo().axiom(byName: "payeeId"),
            "arg2": user.id
          ])
        ]
        let andPred = [
          self.X.create(Eq.self, args: [
            "arg1": Transaction.classInfo().axiom(byName: "id"),
            "arg2": id
          ]),
          self.X.create(Or.self, args: [
            "args": orPred
          ])
        ]
        let pred = self.X.create(And.self, args: [
          "args": andPred
        ])

        guard let sink = (try self.dao.`where`(pred).skip(0).limit(1).select(ArraySink())) as? ArraySink else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard sink.array.count > 0 else {
          // User Not Found.
          DispatchQueue.main.async {
            callback(TransactionError.TransactionNotFound)
          }
          return
        }

        DispatchQueue.main.async {
          callback(sink.array[0])
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }
}
