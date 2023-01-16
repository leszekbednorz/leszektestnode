import { App } from './app.js'

export default (async () => {
  const app = new App()
  await app.build()
  app.synth()
})().catch(/* istanbul ignore next */ err => {
  console.error(err)
  process.exit(1)
})
