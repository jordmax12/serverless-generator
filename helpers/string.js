const _capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

exports.validResourceName = (s) => {
    return _capitalize(s).replace(/-/g, '');
};
