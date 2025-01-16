/* global Opal */
// @ts-check

const { XMLParser } = require('fast-xml-parser')

function getActionSymbol (rule, action) {
  let actionOccurences = action.ActionOccurrences !== undefined ? action.ActionOccurrences.ActionOccurrence : undefined
  if (actionOccurences !== undefined) {
    let actionOccurrenceLinks = rule.ActionOccurrenceLink
    actionOccurrenceLinks = actionOccurrenceLinks.map(aO => aO['@link'])
    actionOccurences = actionOccurences.find(ao => actionOccurrenceLinks.includes(ao['@uId']))
    if (actionOccurences !== undefined) {
      return actionOccurences.Symbol['@value']
    }
  } else {
    let actionLinks = rule.ActionLink
    if (actionLinks === undefined) {
      actionLinks = rule.ActionOccurrenceLink
    }
    actionLinks = actionLinks.map(al => al['@link'])
    actionLinks = actionLinks.find(ao => ao === action['@uId'])
    if (actionLinks) {
      return 'X'
    }
  }
  return '-'
}

function getConditionSymbol (rule, condition) {
  let conditionOccurences = condition.ConditionOccurrences !== undefined ? condition.ConditionOccurrences.ConditionOccurrence : undefined
  if (conditionOccurences !== undefined) {
    let conditionOccurrenceLinks =
         rule.ConditionOccurrenceLink
    conditionOccurrenceLinks = conditionOccurrenceLinks.map(aO => aO['@link'])
    conditionOccurences = conditionOccurences.find(ao => conditionOccurrenceLinks.includes(ao['@uId']))
    if (conditionOccurences !== undefined) {
      return conditionOccurences.Symbol['@value']
    }
  } else {
    const conditionLink = rule.ConditionLink['@link']
    const conditionState = rule.ConditionLink['@conditionState']
    if (conditionLink === condition['@uId']) {
      if (conditionState === 'true') {
        return 'Y'
      } else {
        return 'N'
      }
    }
  }
  return '-'
}

function decisionTableBlockMacro (name, context) {
  return function () {
    const self = this
    self.named(name)
    self.process((parent, target, attrs) => {
      const vfs = context.vfs
      target = parent.applySubstitutions(target, ['attributes'])
      const rules = attrs.showOnlyRules ? attrs.showOnlyRules.split(',') : []

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@',
        isArray: (name, jpath, isLeafNode, isAttribute) => {
          if (jpath === 'LFET.Conditions.Condition') return true
          if (jpath === 'LFET.Rules.Rule') return true
          if (jpath === 'LFET.Actions.Action') return true
          if (jpath === 'LFET.Actions.Action.ActionOccurrences.ActionOccurrence') return true
          if (jpath === 'LFET.Conditions.Condition.ConditionOccurrences.ConditionOccurrence') return true
          if (jpath === 'LFET.Rules.Rule.ActionOccurrenceLink') return true
          if (jpath === 'LFET.Rules.Rule.ConditionOccurrenceLink') return true
          if (jpath === 'LFET.Rules.Rule.ActionLink') return true
          if (jpath === 'LFET.Rules.Rule.ConditionLink') return true
        }
      })
      const decisiontableXMLContent = parser.parse(vfs.read(target))

      const content = []
      const ruleElements = decisiontableXMLContent.LFET.Rules.Rule
      const ruleCount = ruleElements.length
      const conditionElements = decisiontableXMLContent.LFET.Conditions.Condition
      const actionElements = decisiontableXMLContent.LFET.Actions.Action
      const colsOptionString = [1, 3].concat(Array(rules.length === 0 ? ruleCount : rules.length).fill(2))

      content.push(`.${decisiontableXMLContent.LFET.Title['@value']}`)
      content.push('[.lf-decisiontable]')
      content.push(`[width="100%",options=header,cols="${colsOptionString.join(',')}",frame=none,grid=all]`)
      // table start
      content.push('|====')

      // create hader
      content.push('2+|')
      Array.from({ length: ruleCount }).map((u, i) => `${i + 1}`).forEach(i => {
        if ((rules.length > 0 && rules.find(it => it === i)) || rules.length === 0) {
          content.push(`^.^|R${i.padStart(2, '0')}`)
        }
      })

      for (let conditionIndex = 0; conditionIndex < conditionElements.length; conditionIndex++) {
        const condition = conditionElements[conditionIndex]

        const conditionColumnLabel = `${conditionIndex + 1}`.padStart(2, '0')
        content.push(`^.^h|C${conditionColumnLabel}`)
        content.push(`.^h|${condition.Title['@value']}`)

        ruleElements.forEach((rule, idx) => {
          if ((rules.length > 0 && rules.includes(`${idx + 1}`)) || rules.length === 0) {
            content.push(`^.^|${getConditionSymbol(rule, condition)}`)
          }
        })
      }

      content.push(`${(rules.length === 0 ? ruleCount : rules.length) + 2}+|`)

      for (let actionIndex = 0; actionIndex < actionElements.length; actionIndex++) {
        const action = actionElements[actionIndex]

        const actionColumnLabel = `${actionIndex + 1}`.padStart(2, '0')
        content.push(`^.^h|A${actionColumnLabel}`)
        content.push(`.^h|${action.Title['@value']}`)

        ruleElements.forEach((rule, idx) => {
          if ((rules.length > 0 && rules.includes(`${idx + 1}`)) || rules.length === 0) {
            content.push(`^.^|${getActionSymbol(rule, action)}`)
          }
        })
      }

      // table end
      content.push('|====')
      self.parseContent(parent, content.join('\n'), Opal.hash(attrs))

      return undefined
    })
  }
}

module.exports.register = function (registry, context = {}) {
  if (typeof context.contentCatalog !== 'undefined' && typeof context.contentCatalog.addFile === 'function' && typeof context.file !== 'undefined') {
    context.vfs = require('./antora-adapter.js')(context.file, context.contentCatalog, context.vfs)
  }
  context.logger = Opal.Asciidoctor.LoggerManager.getLogger()
  const names = [
    'lfet',
    'decisiontable',
    'dt'
  ]

  if (typeof registry.register === 'function') {
    registry.register(function () {
      for (const name of names) {
        this.blockMacro(decisionTableBlockMacro(name, context))
      }
    })
  } else if (typeof registry.block === 'function') {
    for (const name of names) {
      registry.blockMacro(decisionTableBlockMacro(name, context))
    }
  }
  return registry
}
