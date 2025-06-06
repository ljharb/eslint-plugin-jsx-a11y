/**
 * @fileoverview Enforce label tags have an associated control.
 * @author Jesse Beach
 */

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

import RuleTester from '../../__util__/RuleTester';
import parserOptionsMapper from '../../__util__/parserOptionsMapper';
import parsers from '../../__util__/helpers/parsers';
import rule from '../../../src/rules/label-has-associated-control';
import ruleOptionsMapperFactory from '../../__util__/ruleOptionsMapperFactory';

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const ruleTester = new RuleTester();

const ruleName = 'label-has-associated-control';

const errorMessages = {
  accessibleLabel: 'A form label must have accessible text.',
  htmlFor: 'A form label must have a valid htmlFor attribute.',
  nesting: 'A form label must have an associated control as a descendant.',
  either: 'A form label must either have a valid htmlFor attribute or a control as a descendant.',
  both: 'A form label must have a valid htmlFor attribute and a control as a descendant.',
};
const expectedErrors = {};
Object.keys(errorMessages).forEach((key) => {
  expectedErrors[key] = {
    message: errorMessages[key],
    type: 'JSXOpeningElement',
  };
});

const componentsSettings = {
  'jsx-a11y': {
    components: {
      CustomInput: 'input',
      CustomLabel: 'label',
    },
  },
};

const attributesSettings = {
  'jsx-a11y': {
    attributes: {
      for: ['htmlFor', 'for'],
    },
  },
};

const htmlForValid = [
  { code: '<label htmlFor="js_id"><span><span><span>A label</span></span></span></label>', options: [{ depth: 4 }] },
  { code: '<label htmlFor="js_id" aria-label="A label" />' },
  { code: '<label htmlFor="js_id" aria-labelledby="A label" />' },
  { code: '<div><label htmlFor="js_id">A label</label><input id="js_id" /></div>' },
  { code: '<label for="js_id"><span><span><span>A label</span></span></span></label>', options: [{ depth: 4 }], settings: attributesSettings },
  { code: '<label for="js_id" aria-label="A label" />', settings: attributesSettings },
  { code: '<label for="js_id" aria-labelledby="A label" />', settings: attributesSettings },
  { code: '<div><label for="js_id">A label</label><input id="js_id" /></div>', settings: attributesSettings },
  // Custom label component.
  { code: '<CustomLabel htmlFor="js_id" aria-label="A label" />', options: [{ labelComponents: ['CustomLabel'] }] },
  { code: '<CustomLabel htmlFor="js_id" label="A label" />', options: [{ labelAttributes: ['label'], labelComponents: ['CustomLabel'] }] },
  { code: '<CustomLabel htmlFor="js_id" aria-label="A label" />', settings: componentsSettings },
  { code: '<MUILabel htmlFor="js_id" aria-label="A label" />', options: [{ labelComponents: ['*Label'] }] },
  { code: '<LabelCustom htmlFor="js_id" label="A label" />', options: [{ labelAttributes: ['label'], labelComponents: ['Label*'] }] },
  // Custom label attributes.
  { code: '<label htmlFor="js_id" label="A label" />', options: [{ labelAttributes: ['label'] }] },
  // Glob support for controlComponents option.
  { code: '<CustomLabel htmlFor="js_id" aria-label="A label" />', options: [{ controlComponents: ['Custom*'] }] },
  { code: '<CustomLabel htmlFor="js_id" aria-label="A label" />', options: [{ controlComponents: ['*Label'] }] },
  // Rule does not error if presence of accessible label cannot be determined
  { code: '<div><label htmlFor="js_id"><CustomText /></label><input id="js_id" /></div>' },
];
const nestingValid = [
  { code: '<label>A label<input /></label>' },
  { code: '<label>A label<textarea /></label>' },
  { code: '<label><img alt="A label" /><input /></label>' },
  { code: '<label><img aria-label="A label" /><input /></label>' },
  { code: '<label><span>A label<input /></span></label>' },
  { code: '<label><span><span>A label<input /></span></span></label>', options: [{ depth: 3 }] },
  { code: '<label><span><span><span>A label<input /></span></span></span></label>', options: [{ depth: 4 }] },
  { code: '<label><span><span><span><span>A label</span><input /></span></span></span></label>', options: [{ depth: 5 }] },
  { code: '<label><span><span><span><span aria-label="A label" /><input /></span></span></span></label>', options: [{ depth: 5 }] },
  { code: '<label><span><span><span><input aria-label="A label" /></span></span></span></label>', options: [{ depth: 5 }] },
  // Other controls
  { code: '<label>foo<meter /></label>' },
  { code: '<label>foo<output /></label>' },
  { code: '<label>foo<progress /></label>' },
  { code: '<label>foo<textarea /></label>' },
  // Custom controlComponents.
  { code: '<label>A label<CustomInput /></label>', options: [{ controlComponents: ['CustomInput'] }] },
  { code: '<label><span>A label<CustomInput /></span></label>', options: [{ controlComponents: ['CustomInput'] }] },
  { code: '<label><span>A label<CustomInput /></span></label>', settings: componentsSettings },
  { code: '<CustomLabel><span>A label<CustomInput /></span></CustomLabel>', options: [{ controlComponents: ['CustomInput'], labelComponents: ['CustomLabel'] }] },
  { code: '<CustomLabel><span label="A label"><CustomInput /></span></CustomLabel>', options: [{ controlComponents: ['CustomInput'], labelComponents: ['CustomLabel'], labelAttributes: ['label'] }] },
  // Glob support for controlComponents option.
  { code: '<label><span>A label<CustomInput /></span></label>', options: [{ controlComponents: ['Custom*'] }] },
  { code: '<label><span>A label<CustomInput /></span></label>', options: [{ controlComponents: ['*Input'] }] },
  { code: '<label><span>A label<TextInput /></span></label>', options: [{ controlComponents: ['????Input'] }] },
  // Rule does not error if presence of accessible label cannot be determined
  { code: '<label><CustomText /><input /></label>' },
];

const bothValid = [
  { code: '<label htmlFor="js_id"><span><span><span>A label<input /></span></span></span></label>', options: [{ depth: 4 }] },
  { code: '<label htmlFor="js_id" aria-label="A label"><input /></label>' },
  { code: '<label htmlFor="js_id" aria-labelledby="A label"><input /></label>' },
  { code: '<label htmlFor="js_id" aria-labelledby="A label"><textarea /></label>' },
  // Custom label component.
  { code: '<CustomLabel htmlFor="js_id" aria-label="A label"><input /></CustomLabel>', options: [{ labelComponents: ['CustomLabel'] }] },
  { code: '<CustomLabel htmlFor="js_id" label="A label"><input /></CustomLabel>', options: [{ labelAttributes: ['label'], labelComponents: ['CustomLabel'] }] },
  { code: '<CustomLabel htmlFor="js_id" label="A label"><input /></CustomLabel>', options: [{ labelAttributes: ['label'], labelComponents: ['*Label'] }] },
  { code: '<CustomLabel htmlFor="js_id" aria-label="A label"><input /></CustomLabel>', settings: componentsSettings },
  { code: '<CustomLabel htmlFor="js_id" aria-label="A label"><CustomInput /></CustomLabel>', settings: componentsSettings },
  // Custom label attributes.
  { code: '<label htmlFor="js_id" label="A label"><input /></label>', options: [{ labelAttributes: ['label'] }] },
  { code: '<label htmlFor="selectInput">Some text<select id="selectInput" /></label>' },
];

const alwaysValid = [
  { code: '<div />' },
  { code: '<CustomElement />' },
  { code: '<input type="hidden" />' },
];

const htmlForInvalid = (assertType) => {
  const expectedError = expectedErrors[assertType];
  return [
    { code: '<label htmlFor="js_id"><span><span><span>A label</span></span></span></label>', options: [{ depth: 4 }], errors: [expectedError] },
    { code: '<label htmlFor="js_id" aria-label="A label" />', errors: [expectedError] },
    { code: '<label htmlFor="js_id" aria-labelledby="A label" />', errors: [expectedError] },
    // Custom label component.
    { code: '<CustomLabel htmlFor="js_id" aria-label="A label" />', options: [{ labelComponents: ['CustomLabel'] }], errors: [expectedError] },
    { code: '<CustomLabel htmlFor="js_id" label="A label" />', options: [{ labelAttributes: ['label'], labelComponents: ['CustomLabel'] }], errors: [expectedError] },
    { code: '<CustomLabel htmlFor="js_id" aria-label="A label" />', settings: componentsSettings, errors: [expectedError] },
    // Custom label attributes.
    { code: '<label htmlFor="js_id" label="A label" />', options: [{ labelAttributes: ['label'] }], errors: [expectedError] },
  ];
};
const nestingInvalid = (assertType) => {
  const expectedError = expectedErrors[assertType];
  return [
    { code: '<label>A label<input /></label>', errors: [expectedError] },
    { code: '<label>A label<textarea /></label>', errors: [expectedError] },
    { code: '<label><img alt="A label" /><input /></label>', errors: [expectedError] },
    { code: '<label><img aria-label="A label" /><input /></label>', errors: [expectedError] },
    { code: '<label><span>A label<input /></span></label>', errors: [expectedError] },
    { code: '<label><span><span>A label<input /></span></span></label>', options: [{ depth: 3 }], errors: [expectedError] },
    { code: '<label><span><span><span>A label<input /></span></span></span></label>', options: [{ depth: 4 }], errors: [expectedError] },
    { code: '<label><span><span><span><span>A label</span><input /></span></span></span></label>', options: [{ depth: 5 }], errors: [expectedError] },
    { code: '<label><span><span><span><span aria-label="A label" /><input /></span></span></span></label>', options: [{ depth: 5 }], errors: [expectedError] },
    { code: '<label><span><span><span><input aria-label="A label" /></span></span></span></label>', options: [{ depth: 5 }], errors: [expectedError] },
    // Custom controlComponents.
    { code: '<label>A label<OtherCustomInput /></label>', options: [{ controlComponents: ['CustomInput'] }], errors: [expectedError] },
    { code: '<label><span>A label<CustomInput /></span></label>', options: [{ controlComponents: ['CustomInput'] }], errors: [expectedError] },
    { code: '<CustomLabel><span>A label<CustomInput /></span></CustomLabel>', options: [{ controlComponents: ['CustomInput'], labelComponents: ['CustomLabel'] }], errors: [expectedError] },
    { code: '<CustomLabel><span label="A label"><CustomInput /></span></CustomLabel>', options: [{ controlComponents: ['CustomInput'], labelComponents: ['CustomLabel'], labelAttributes: ['label'] }], errors: [expectedError] },
    { code: '<label><span>A label<CustomInput /></span></label>', settings: componentsSettings, errors: [expectedError] },
    { code: '<CustomLabel><span>A label<CustomInput /></span></CustomLabel>', settings: componentsSettings, errors: [expectedError] },
  ];
};

const neverValid = (assertType) => {
  const expectedError = expectedErrors[assertType];
  return [
    { code: '<label htmlFor="js_id" />', errors: [expectedErrors.accessibleLabel] },
    { code: '<label htmlFor="js_id"><input /></label>', errors: [expectedErrors.accessibleLabel] },
    { code: '<label htmlFor="js_id"><textarea /></label>', errors: [expectedErrors.accessibleLabel] },
    { code: '<label></label>', errors: [expectedErrors.accessibleLabel] },
    { code: '<label>A label</label>', errors: [expectedError] },
    { code: '<div><label /><input /></div>', errors: [expectedErrors.accessibleLabel] },
    { code: '<div><label>A label</label><input /></div>', errors: [expectedError] },
    // Custom label component.
    { code: '<CustomLabel aria-label="A label" />', options: [{ labelComponents: ['CustomLabel'] }], errors: [expectedError] },
    { code: '<MUILabel aria-label="A label" />', options: [{ labelComponents: ['???Label'] }], errors: [expectedError] },
    { code: '<CustomLabel label="A label" />', options: [{ labelAttributes: ['label'], labelComponents: ['CustomLabel'] }], errors: [expectedError] },
    { code: '<CustomLabel aria-label="A label" />', settings: componentsSettings, errors: [expectedError] },
    // Custom label attributes.
    { code: '<label label="A label" />', options: [{ labelAttributes: ['label'] }], errors: [expectedError] },
    // Custom controlComponents.
    { code: '<label><span><CustomInput /></span></label>', options: [{ controlComponents: ['CustomInput'] }], errors: [expectedErrors.accessibleLabel] },
    { code: '<CustomLabel><span><CustomInput /></span></CustomLabel>', options: [{ controlComponents: ['CustomInput'], labelComponents: ['CustomLabel'] }], errors: [expectedErrors.accessibleLabel] },
    { code: '<CustomLabel><span><CustomInput /></span></CustomLabel>', options: [{ controlComponents: ['CustomInput'], labelComponents: ['CustomLabel'], labelAttributes: ['label'] }], errors: [expectedErrors.accessibleLabel] },
    { code: '<label><span><CustomInput /></span></label>', settings: componentsSettings, errors: [expectedErrors.accessibleLabel] },
    { code: '<CustomLabel><span><CustomInput /></span></CustomLabel>', settings: componentsSettings, errors: [expectedErrors.accessibleLabel] },
  ];
};
// htmlFor valid
ruleTester.run(ruleName, rule, {
  valid: parsers.all([].concat(
    ...alwaysValid,
    ...htmlForValid,
  ))
    .map(ruleOptionsMapperFactory({
      assert: 'htmlFor',
    }))
    .map(parserOptionsMapper),
  invalid: parsers.all([].concat(
    ...neverValid('htmlFor'),
    ...nestingInvalid('htmlFor'),
  ))
    .map(ruleOptionsMapperFactory({
      assert: 'htmlFor',
    }))
    .map(parserOptionsMapper),
});

// nesting valid
ruleTester.run(ruleName, rule, {
  valid: parsers.all([].concat(
    ...alwaysValid,
    ...nestingValid,
  ))
    .map(ruleOptionsMapperFactory({
      assert: 'nesting',
    }))
    .map(parserOptionsMapper),
  invalid: parsers.all([].concat(
    ...neverValid('nesting'),
    ...htmlForInvalid('nesting'),
  ))
    .map(ruleOptionsMapperFactory({
      assert: 'nesting',
    }))
    .map(parserOptionsMapper),
});

// either valid
ruleTester.run(ruleName, rule, {
  valid: parsers.all([].concat(
    ...alwaysValid,
    ...htmlForValid,
    ...nestingValid,
  ))
    .map(ruleOptionsMapperFactory({
      assert: 'either',
    }))
    .map(parserOptionsMapper),
  invalid: parsers.all([].concat(
    ...neverValid('either'),
  )).map(ruleOptionsMapperFactory({
    assert: 'either',
  })).map(parserOptionsMapper),
});

// both valid
ruleTester.run(ruleName, rule, {
  valid: parsers.all([].concat(
    ...alwaysValid,
    ...bothValid,
  ))
    .map(ruleOptionsMapperFactory({
      assert: 'both',
    }))
    .map(parserOptionsMapper),
  invalid: parsers.all([].concat(
    ...neverValid('both'),
    ...htmlForInvalid('both'),
    ...nestingInvalid('both'),
  )).map(ruleOptionsMapperFactory({
    assert: 'both',
  })).map(parserOptionsMapper),
});
