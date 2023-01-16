import * as dynamodb from '@aws-cdk/aws-dynamodb'

import { App } from './app.js'

export class DynamoDbTable extends dynamodb.Table {
  private readonly app: App
  public readonly partitionKeyName: string
  public readonly sortKeyName: string

  constructor (app: App) {
    const tableName = app.node.tryGetContext('dynamodb-table-name')
    const partitionKeyName = app.node.tryGetContext('dynamodb-table-pk-name')
    const sortKeyName = app.node.tryGetContext('dynamodb-table-sk-name')

    super(app.persistentStack, 'DynamodbTable', {
      tableName: app.name(tableName),
      partitionKey: {
        name: String(partitionKeyName),
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: String(sortKeyName),
        type: dynamodb.AttributeType.STRING
      }
    })

    this.app = app
    this.partitionKeyName = partitionKeyName
    this.sortKeyName = sortKeyName

    this.createOutputs()
  }

  private createOutputs (): void {
    this.app.persistentStack.addOutputs({
      DynamodbPkName: this.partitionKeyName,
      // The region definition comes from the setting on ~/.aws/config or the AWS_REGION env variable
      DynamodbRegion: String(this.stack.region),
      DynamodbSkName: this.sortKeyName,
      DynamodbTableName: String(this.tableName)
    })
  }
}
