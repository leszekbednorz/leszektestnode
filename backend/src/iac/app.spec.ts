import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { SynthUtils } from '@aws-cdk/assert'
import { AssetCode } from '@aws-cdk/aws-lambda'
import { Bundling } from '@aws-cdk/aws-lambda-nodejs/lib/bundling.js'

import { App } from './app.js'

describe('App', () => {
  const moduleDir = fileURLToPath(import.meta.url)
  const cdkConfigFile = path.resolve(moduleDir, '../../../cdk.json')
  const cdkConfig = JSON.parse(fs.readFileSync(cdkConfigFile, 'utf-8'))
  let app: App

  const context = {
    ...cdkConfig.context,
    prefix: 'test'
  }

  beforeEach(() => {
    // disabling bundling to speed up unit testing
    const dummyCode = {
      s3Location: 'no-such-code',
      bind: () => dummyCode,
      bindToResource: () => { /* noop */ }
    } as unknown as AssetCode
    Bundling.bundle = () => dummyCode
  })

  afterEach(() => {
    if (app?.outdir != null) {
      fs.rmdirSync(app.outdir, { recursive: true })
    }
  })

  test('Synthesis of CloudFormation template', async () => {
    app = new App({ context })
    await app.build()
    expect(SynthUtils.toCloudFormation(app.persistentStack)).toBeDefined()
    expect(SynthUtils.toCloudFormation(app.executionStack)).toBeDefined()
  })

  // If you're refactoring, then enable this until done
  // We don't keep it on always because it just compares before/after snapshots
  test.skip('Synthesis is unchanged', async () => {
    app = new App({ context })
    await app.build()
    expect(SynthUtils.toCloudFormation(app.persistentStack))
      .toMatchSnapshot('persistent-stack')
    expect(SynthUtils.toCloudFormation(app.executionStack))
      .toMatchSnapshot('execution-stack')
  })
})
