import { readFileSync } from 'fs'

import { SeedData } from '../src/models/seed-data.model'
import { ConfigurationReader } from '../src/models/configuration-reader.model'
import { SeederConfig } from '../src/models/seeder-config.model'
import { DataSeederService } from '../src/services/data-seeder.service'

const [, , seedDataFile] = process.argv
const { DEFAULT_PASSWORD: defaultPassword } = process.env
const tableName = ConfigurationReader.get('DynamodbTableName')
const tableRegion = ConfigurationReader.get('DynamodbRegion')
const userPoolId = ConfigurationReader.get('UserPoolId')
const identityPoolId = ConfigurationReader.get('IdentityPoolId')
const seederConfig: SeederConfig = {
  tableName,
  userPoolId,
  identityPoolId
}

if (seedDataFile === undefined) {
  throw new Error('Path to seed data file should be specified')
}

const rawDataFile = readFileSync(seedDataFile)
const seedData = JSON.parse(rawDataFile.toString()) as SeedData
const dataSeeder = new DataSeederService(seederConfig, tableRegion, String(defaultPassword))

dataSeeder
  .verifyClients()
  .then(async () => {
    await dataSeeder.truncate()
  })
  .then(async () => {
    await dataSeeder.seed(seedData)
  })
  .catch((error) => {
    console.error('Data seed failed: ', error)
  })
