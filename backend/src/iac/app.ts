import { BaseApp, GraphqlApi } from '@trilogy-group/eng-base'
import { DynamoDbTable } from './dynamodb.table.js'

export class App extends BaseApp {
  public moduleUrl = import.meta.url
  public db?: DynamoDbTable
  public graphql?: GraphqlApi

  addConstructs (): void {
    this.db = new DynamoDbTable(this)
    this.graphql = new GraphqlApi(this)
  }
}
