const template1 = require('./template1');
const template2 = require('./template2');
const template4 = require('./template4');
const template8 = require('./template8');

module.exports = function getTemplateData(values) {
    const templateId = parseInt(values.selectedTemplate) || 1;

    let texDoc = '';
    switch (templateId) {
        case 1: texDoc = template1(values); break;
        case 2: texDoc = template2(values); break;
        case 4: texDoc = template4(values); break;
        case 8: texDoc = template8(values); break;
        default: texDoc = template1(values); break;
    }

    return { texDoc, opts: {} };
};
