const file = require('./file');
const config = require('./config');
const package_json_template = require('../templates/package');

const _isPlainObject = (input) => {
    return input && !Array.isArray(input) && typeof input === 'object';
};
/**
 *
 * @param {packages} packages either singular package object or array of package objects. (consists of name, an optional version (Will use * if none provided.), and isDev (defaults to false))
 */
exports.addPackage = async (packages) => {
    const _path = config.DEBUG ? 'package2.json' : 'package.json';
    const package_json = await file.read_file(`${file.root(true)}${_path}`);
    let _packages = [];

    if (_isPlainObject(packages)) {
        _packages.push(packages);
    } else if (!(packages.constructor === Array)) {
        throw new Error('invalid packages type sent.');
    } else _packages = packages;
    for (const _package of _packages) {
        const key = _package.isDev ? 'devDependencies' : 'dependencies';
        if (package_json[key] && Object.keys(package_json[key]).length > 0) {
            package_json[key][_package.name] = _package.version || '*';
        } else {
            package_json[key] = {
                [_package.name]: _package.version || '*'
            };
        }
    }

    return file.write_file(`${file.root(true)}${_path}`, JSON.stringify(package_json, null, 4));
};
/**
 *
 * @param {scripts} scripts can be a singular script or an array of scripts objects. (consits of name and value)
 */
exports.addScript = async (scripts) => {
    const _path = config.DEBUG ? 'package2.json' : 'package.json';
    const package_json = await file.read_file(`${file.root(true)}${_path}`);
    let _scripts = [];

    if (_isPlainObject(scripts)) {
        _scripts.push(scripts);
    } else if (!(scripts.constructor === Array)) {
        throw new Error('invalid scripts type sent.');
    } else _scripts = scripts;
    for (const script of _scripts) {
        if (package_json.scripts && Object.keys(package_json.scripts).length > 0) {
            package_json.scripts[script.name] = script.value;
        } else {
            package_json.scripts = {
                [script.name]: script.value
            };
        }
    }

    return file.write_file(`${file.root(true)}${_path}`, JSON.stringify(package_json, null, 4));
};
/**
 * will create a package.json file
 */
exports.create = async (project_name) => {
    const _path = config.DEBUG ? 'package2.json' : 'package.json';
    const package_json_path_exists = await file.path_exists(`${file.root(true)}${_path}`);
    if (!package_json_path_exists) {
        const package_json = package_json_template.packagejson(project_name);
        await file.write_file(`${file.root(true)}${_path}`, JSON.stringify(package_json, null, 4));
    }

    return true;
};
/**
 * will return the package.json file as json
 */
exports.read_me = async () => {
    const _path = config.DEBUG ? 'package2.json' : 'package.json';
    return file.read_file(`${file.root(true)}${_path}`);
};
/**
 * Will delete the package2.json folder (only works in debug mode)
 */
exports.delete_me = async () => {
    const _path = 'package2.json';
    try {
        return file.delete_file(_path);
    } catch (e) {
        return true;
    }
};
