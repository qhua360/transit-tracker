var helpers = module.exports = {};

helpers.buildStringFromList = (list, format) => {
    let str = '';
    if (list.length) {
        list.forEach(function (item, i) {
            if (list.length > 1 && i == list.length - 1) str += 'and ';
            str += format(item);
            if (i != list.length - 1) {
                if (list.length > 1) str += ',';
                str += ' ';
            }
        });
    }
    return str;
};

helpers.getDiffFromTimeString = str => {
    let date = new Date(str);
    let now = new Date();
    const dayMs = 1000 * 60 * 60 * 24, hMs = 1000 * 60 * 60, minMs = 1000 * 60;
    const hm = Math.floor(((date - now) % dayMs) / hMs);
    return Math.floor((((date - now) % dayMs) % hMs) / minMs) + (hm ? hm * 60 : 0);
}
