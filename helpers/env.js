const file = require('./file');
const {default: local_env_template} = require('../templates/aws/envs/local');

const _validate_params = (variable, env) => {
    if (typeof variable !== 'object' || variable === null) return false;
    if (env !== 'local' && env !== 'cloud') return false;
    if (!variable.key || !variable.value) return false;
    return true;
};

const _init_envs = async () => {
    const directories = ['aws', 'aws/envs'];
    await file.doesLocalDirectoriesExist(directories);
    const local_env_path = `${file.root(true)}aws/envs/local.yml`;
    const local_env_exists = await file.path_exists(local_env_path);
    if (!local_env_exists) {
        await file.write_yaml(local_env_path, local_env_template);
    }

    const cloud_env_path = `${file.root(true)}aws/envs/cloud.yml`;
    const cloud_env_exists = await file.path_exists(cloud_env_path);

    if (!cloud_env_exists) {
        await file.write_yaml(cloud_env_path, local_env_template);
    }

    return true;
};
/**
 *
 * @param {variables} variables key/value array pairing of what you want to put into the env (key: value).
 */
exports.addEnvVariable = async (variable, env = 'local') => {
    if (!_validate_params(variable, env))
        throw new Error('invalid variable or env supplied to addEnvVariable function.');

    await _init_envs();
    const _path = `${file.root(true)}aws/envs/${env}.yml`;

    const read_resource = await file.read_yaml(_path);
    read_resource.environment[variable.key] = variable.value;
    return file.write_yaml(_path, read_resource);
};
/**
 *
 * @param {variables} variables key of the env variable(s) you want to remove (array of strings).
 */
exports.removeEnvVariables = async (variables) => {
    const local_path = `${file.root(true)}aws/envs/local.yml`;
    const cloud_path = `${file.root(true)}aws/envs/cloud.yml`;
    const local_exists = await file.path_exists(local_path);
    const cloud_exists = await file.path_exists(cloud_path);

    if (!local_exists && !cloud_exists) return true;

    let _variables = [];

    if (!variables) return true;
    if (variables.constructor === Array) {
        _variables = variables;
    } else _variables.push(variables);

    if (local_exists) {
        const read_resource = await file.read_yaml(local_path);
        const {environment} = read_resource;
        let variable_exists = false;

        for (const variable of _variables) {
            if (environment[variable]) {
                variable_exists = true;
                delete read_resource.environment[variable];
            }
        }
        if (variable_exists) {
            await file.write_yaml(local_path, read_resource);
        }
    }

    if (cloud_exists) {
        const read_resource = await file.read_yaml(cloud_path);
        const {environment} = read_resource;
        let variable_exists = false;

        for (const variable of _variables) {
            if (environment[variable]) {
                variable_exists = true;
                delete read_resource.environment[variable];
            }
        }

        if (variable_exists) {
            await file.write_yaml(local_path, read_resource);
        }
    }

    return true;
};
