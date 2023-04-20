/* global describe it beforeEach */
const rimrafSync = require('rimraf')
const generateSite = require('@antora/site-generator-default')

describe('Antora integration', function () {
    this.timeout(5000)
    before(async function () {
        rimrafSync(`${__dirname}/public`, function (error) {})
        await generateSite([`--playbook=${__dirname}/antora-playbook.yml`])
    })

    it('blockmacro', async () => {

    })

})