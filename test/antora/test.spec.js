/* global describe before it */
const { rimrafSync } = require('rimraf')
const path = require('path')
const generateSite = require('@antora/site-generator-default')

describe('Antora integration', function () {
  this.timeout(5000)
  before(async function () {
    rimrafSync(path.join(__dirname, 'public'), {})
    await generateSite([`--playbook=${path.join(__dirname, 'antora-playbook.yml')}`])
  })

  it('blockmacro', async () => {

  })
})
