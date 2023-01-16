import { jest } from '@jest/globals'
import { Context } from 'aws-lambda'

import { handler } from './hello-world'

jest.mock('@trilogy-group/eng-base')

describe('hello-world', () => {
  test('handle it', async () => {
    const event = {}
    const context = {} as unknown as Context
    const callback = jest.fn()
    const output = await handler(event, context, callback)
    expect(output).toEqual({ message: 'Hello, world!' })
  })
})
