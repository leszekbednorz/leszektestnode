import { ApolloClient, ApolloLink, gql, InMemoryCache } from 'apollo-boost'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import { createHttpLink } from 'apollo-link-http'
import { AUTH_TYPE, createAuthLink } from 'aws-appsync-auth-link'
import { fetch } from 'cross-fetch'

import { ConfigurationReader } from '../models/configuration-reader.model'

export class GraphqlService {
  private readonly client: ApolloClient<NormalizedCacheObject>

  constructor (jwtToken: string) {
    const link = ApolloLink.from([
      createAuthLink({
        url: ConfigurationReader.get('GraphqlApiBaseUrl'),
        region: ConfigurationReader.get('DynamodbRegion'),
        auth: {
          jwtToken,
          type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS
        }
      }) as unknown as ApolloLink,
      createHttpLink({
        fetch,
        uri: ConfigurationReader.get('GraphqlApiBaseUrl')
      })
    ])
    this.client = new ApolloClient({
      link,
      cache: new InMemoryCache()
    })
  }

  async request<T, V>(query: string, variables: V): Promise<T> {
    return await this.client
      .query<T>({
      query: gql(query),
      variables
    })
      .then((response) => response.data)
  }
}
