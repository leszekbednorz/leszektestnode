import { Handler } from 'aws-lambda'

import { Logger, LambdaConfig } from '@trilogy-group/eng-base'

// eslint-disable-next-line @typescript-eslint/no-empty-interface -- there are no input parameters
export interface Input {}

export interface Output {
  message: string
}

export const handler: Handler<Input, Output> = async (event, context) => {
  Logger.info('hello-world', event, context)
  return { message: 'Hello, world!' }
}

export const configuration: LambdaConfig = {
  memoryInMB: 128,
  timeoutInSeconds: 30
}
