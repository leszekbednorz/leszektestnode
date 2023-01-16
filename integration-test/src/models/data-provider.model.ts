import { AttributeMap } from 'aws-sdk/clients/dynamodb'

import { SeedData } from './seed-data.model'

export interface DataProvider {
  extract: (data: SeedData) => AttributeMap[]
}
