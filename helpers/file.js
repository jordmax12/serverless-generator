const fs = require('fs');
const os = require('os');
const fs_extra = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const rimraf = require('rimraf');
const logger = require('./logger');
const config = require('./config');

const _find_aws_root_path = () => {
    switch (process.platform) {
        case 'win':
            return '%USERPROFILE%\\.aws\\config';
        case 'darwin':
        case 'linux':
            return `${os.homedir()}/.aws/`;
        default:
            throw new Error(`unsupported operating system ${process.platform}`);
    }
};

const _aws_config_route = () => {
    return `${_find_aws_root_path()}${process.env.VERBOSE_SERVERLESS_GENERATOR_DEBUG ? 'config2' : 'config'}`;
};

const _aws_credentials_route = () => {
    return `${_find_aws_root_path()}${process.env.VERBOSE_SERVERLESS_GENERATOR_DEBUG ? 'credentials2' : 'credentials'}`;
};

const _read_file = (_path, do_not_parse_json) => {
    return new Promise((resolve) => {
        fs.readFile(_path, null, (err, data) => {
            if (err) {
                logger.warn(err);
                resolve(null);
                return;
            }
            if (do_not_parse_json) resolve(data);
            else {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            }
        });
    });
};

const _path_exists = (_path) => {
    return new Promise((resolve) => {
        fs.access(_path, (err) => {
            if (!err) {
                resolve(true);
                return;
            }
            resolve(false);
        });
    });
};

const _create_directory = (_path) => {
    return new Promise(async (resolve) => {
        fs.access(_path, (err) => {
            if (!err) {
                resolve();
                return;
            }

            fs.mkdir(_path, null, () => {
                resolve();
            });
        });
    });
};

const _write_file = (_path, data) => {
    return new Promise(async (resolve) => {
        try {
            fs.writeFile(_path, data, null, () => {
                resolve(true);
            });
        } catch (e) {
            console.log('logging e', e);
            throw new Error(e);
        }
    });
};

const _write_yaml = (target_path, obj) => {
    return new Promise(async (resolve) => {
        let convert_object_to_yaml = yaml.safeDump(obj, {indent: 4});
        convert_object_to_yaml = convert_object_to_yaml.replace(/'Fn::GetAtt'/g, 'Fn::GetAtt');
        convert_object_to_yaml = convert_object_to_yaml.replace(/'Ref'/g, 'Ref');
        fs.writeFile(target_path, convert_object_to_yaml, (err) => {
            if (err) {
                logger.warn(err);
                resolve(false);
            }

            resolve(true);
        });
    });
};

const _get_root_project_directory = (is_target_root) => {
    let root_path = `${path.join(__dirname, '..')}/`;
    if (is_target_root && !config.DEBUG) {
        root_path = `${process.cwd()}/`;
    }

    return root_path;
};

exports.doesLocalDirectoriesExist = async (directories, is_target_root = true) => {
    for (const dir of directories) {
        const does_exist = await _path_exists(dir);
        if (!does_exist) await _create_directory(`${_get_root_project_directory(is_target_root)}${dir}`);
    }

    return true;
};

exports.create_directory = async (_path) => {
    return _create_directory(_path);
};

exports.copy_directory = async (src, dest) => {
    fs_extra.copy(src, dest, (err) => {
        if (err) return console.error(err);
    });
};

exports.copy_file = async (src, dest) => {
    return _copy_file(src, dest);
};

exports.delete_directory = async (_path) => {
    if (fs.existsSync(_path)) {
        fs.rmdir(_path, (err) => {
            if (err) throw new Error(err);
            Promise.resolve(true);
        });
    }
};

exports.force_delete_directory = (_path) => {
    return new Promise((resolve) => {
        try {
            rimraf(_path, () => {
                resolve();
            });
        } catch (e) {
            logger.error(e, null, false);
            resolve();
        }
    });
};

exports.read_file = (_path, do_not_parse_json) => {
    return _read_file(_path, do_not_parse_json);
};

exports.read_yaml = async (_path) => {
    const exists = await _read_file(_path, true);
    if (!exists) return null;
    return yaml.safeLoad(fs.readFileSync(_path, 'utf8'));
};

exports.write_yaml = async (target_path, json) => {
    return _write_yaml(target_path, json);
};

exports.write_file = async (_path, data) => {
    return _write_file(_path, data);
};

exports.delete_file = async (_path) => {
    try {
        return fs.unlinkSync(_path);
    } catch (err) {
        logger.error(err, false, false);
    }
};

exports.path_exists = async (_path) => {
    return _path_exists(_path);
};

exports.root = (is_target_root) => {
    return _get_root_project_directory(is_target_root);
};

exports.aws_config_route = () => {
    return _aws_config_route();
};

exports.aws_credentials_route = () => {
    return _aws_credentials_route();
};

exports.aws_route = () => {
    return _find_aws_root_path();
};
