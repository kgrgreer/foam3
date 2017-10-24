//
//  Service.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-03.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class Service {
  lazy var boxContext: BoxContext = {
    return Context.GLOBAL.create(BoxContext.self)!
  }()
  lazy var X: Context = {
    return self.boxContext.__subContext__
  }()
  public var dao: ClientDAO!

  public enum ServiceError: ServiceErrorProtocol {
    case Failed
    case ConversionFailed
    public func description() -> String {
      switch(self) {
        case .Failed:
          return "Something went wrong."
        case .ConversionFailed:
          return "Could not convert object."
      }
    }
  }

  init(withURL url: ServiceURL) {
    // Need to touch this so it's created before any async business happens.
    // TODO(mcarcaso): make property initializers thread safe.
    _ = (boxContext.registry as? BoxRegistryBox)?.registry_

    let httpBox = X.create(HTTPBox.self)!
    httpBox.url = url.path()

    dao = X.create(ClientDAO.self)!
    dao.delegate = httpBox
  }
}

public protocol ServiceErrorProtocol: Error {
  func description() -> String
}
