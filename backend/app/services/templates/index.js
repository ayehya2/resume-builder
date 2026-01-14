const template1 = require('./template1');
const template2 = require('./template2');
const template3 = require('./template3');
const template4 = require('./template4');
const template5 = require('./template5');
const template6 = require('./template6');
const template7 = require('./template7');
const template8 = require('./template8');
const template9 = require('./template9');

module.exports = function getTemplateData(values) {
    const templateId = parseInt(values.selectedTemplate) || 1;

    let texDoc = '';
    switch (templateId) {
        case 1: texDoc = template1(values); break;
        case 2: texDoc = template2(values); break;
        case 3: texDoc = template3(values); break;
        case 4: texDoc = template4(values); break;
        case 5: texDoc = template5(values); break;
        case 6: texDoc = template6(values); break;
        case 7: texDoc = template7(values); break;
        case 8: texDoc = template8(values); break;
        case 9: texDoc = template9(values); break;
        default: texDoc = template1(values); break;
    }

    return { texDoc, opts: {} };
};
