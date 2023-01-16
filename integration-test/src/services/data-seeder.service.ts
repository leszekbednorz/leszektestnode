import { DynamoDB } from 'aws-sdk'
import chunk from 'lodash.chunk'

import { SeedData } from '../models/seed-data.model'
import { DataProvider } from '../models/data-provider.model'
import { UserDataProvider } from './user-data-provider.service'
import { OrganizationDataProvider } from './organization-data-provider.service'
import { MembershipDataProvider } from './membership-data-provider.service'
import { CognitoSeederService } from './cognito-seeder.service'
import { SeederConfig } from '../models/seeder-config.model'
import { ConfigurationReader } from '../models/configuration-reader.model'

export class DataSeederService {
  private readonly dynamoBatchWriteLimit = 25
  private readonly pkSkProjection = [
    ConfigurationReader.get('DynamodbPkName'),
    ConfigurationReader.get('DynamodbSkName')
  ].join(',')

  private readonly dynamoClient: DynamoDB
  private readonly cognitoSeeder: CognitoSeederService
  private readonly dataProviders: DataProvider[] = [
    new UserDataProvider(),
    new OrganizationDataProvider(),
    new MembershipDataProvider()
  ]

  constructor (private readonly seederConfig: SeederConfig, region: string, defaultPassword: string) {
    this.dynamoClient = new DynamoDB({ region })
    this.cognitoSeeder = new CognitoSeederService(seederConfig, defaultPassword, region)
  }

  /**
   * Removes all data from the DynamoDb table. Since tables may be connected to cloudformation we should not delete
   * and re-create them. Instead we delete them one-by-one.
   */
  public async truncate (): Promise<void> {
    let nextKey: DynamoDB.Key | undefined
    do {
      const {
        Items: items,
        LastEvaluatedKey: lastEvaluatedKey
      } = await this.dynamoClient
        .scan({
          TableName: this.seederConfig.tableName,
          ExclusiveStartKey: nextKey,
          ProjectionExpression: this.pkSkProjection
        })
        .promise()
      nextKey = lastEvaluatedKey
      const itemsLength = items?.length ?? 0

      if (itemsLength > 0) {
        await Promise.all(
          chunk(items, this.dynamoBatchWriteLimit).map(
            async (chunkedItem) =>
              await this.dynamoClient
                .batchWriteItem({
                  RequestItems: {
                    [this.seederConfig.tableName]: chunkedItem.map((item) => ({
                      DeleteRequest: {
                        Key: item
                      }
                    }))
                  }
                })
                .promise()
          )
        )
      }
    } while (nextKey !== undefined)

    await this.cognitoSeeder.truncate()
  }

  public async verifyClients (): Promise<void> {
    await this.dynamoClient
      .describeTable({
        TableName: this.seederConfig.tableName
      })
      .promise()

    await this.cognitoSeeder.verifyUserPool()
  }

  /**
   * Populates the table with data.
   *
   * @param seedData data to seed
   */
  public async seed (seedData: SeedData): Promise<void> {
    const rowData = this.dataProviders
      .map((provider) => provider.extract(seedData))
      .reduce((acc, val) => acc.concat(val), [])

    await Promise.all(
      chunk(rowData, this.dynamoBatchWriteLimit).map(
        async (chunkedItem) =>
          await this.dynamoClient
            .batchWriteItem({
              RequestItems: {
                [this.seederConfig.tableName]: chunkedItem.map((item) => ({
                  PutRequest: {
                    Item: item
                  }
                }))
              }
            })
            .promise()
      )
    )

    await this.cognitoSeeder.seedCognito(seedData)
  }
}
