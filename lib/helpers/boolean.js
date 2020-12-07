exports.acceptableBoolean = (value) => {
    const _value = value && (typeof value === "string" || typeof value === "boolean") ? value.toLowerCase() : null;
    switch(_value) {
        case 'yes':
        case 't':
        case 'y':
        case 'true':
        case 'yeah':
        case 'ye':
        case 'ya':
        case 'yah':
        case 'yeh':
            return true;
        default:
            return false;
    }
}