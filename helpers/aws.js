const os = require('os');
const fs = require('fs');
const file = require('./file');

const _write_default_config = async (region) => {
    await fs.appendFileSync(file.aws_config_route(), `[profile default]${os.EOL}`);
    await fs.appendFileSync(file.aws_config_route(), `region=${region}${os.EOL}`);
    await fs.appendFileSync(file.aws_config_route(), `output=json${os.EOL}`);
    return true;
};

const _does_env_variable_exist = async () => {
    // This is way too complicated to try to do for windows.
    if (process.platform === 'win') {
        console.warn(
            'UNSUPPORTED OPERATING SYSTEM FOR AUTOMATIC LOADING OF AWS_SDK_LOAD_CONFIG, PLEASE MAKE SURE YOU ADD THIS TO YOUR ENVIRONMENT ON YOUR RESPECTIVE OS.'
        );
        return true;
    }
    const env_variable = process.env.AWS_SDK_LOAD_CONFIG;
    if (!env_variable || (env_variable && env_variable === 1)) {
        const shell = process.env.SHELL;
        let _path = null;

        switch (shell) {
            case '/bin/bash':
                _path = `${os.homedir()}/.bashrc`;
                break;
            case '/bin/zsh':
                _path = `${os.homedir()}/.zshrc`;
                break;
            default:
                console.warn(
                    'UNSUPPORTED OPERATING SYSTEM FOR AUTOMATIC LOADING OF AWS_SDK_LOAD_CONFIG, PLEASE MAKE SURE YOU ADD THIS TO YOUR ENVIRONMENT ON YOUR RESPECTIVE SHELL CONFIGURATION.'
                );
                return true;
        }

        const exists = await file.path_exists(_path);
        if (exists && !env_variable) {
            process.env.AWS_SDK_LOAD_CONFIG = 1;
            await fs.appendFileSync(_path, `export AWS_SDK_LOAD_CONFIG=1${os.EOL}`);
        }
    }
};

const _doesProfileExist = async (profile_name, isConfig) => {
    const _path = isConfig ? file.aws_config_route() : file.aws_credentials_route();
    const get_profiles = await fs.readFileSync(_path, 'utf-8');
    try {
        const profiles = get_profiles.split('\n');
        let found_profile = false;
        for (const profile of profiles) {
            if (profile.indexOf('[') > -1 && profile.indexOf(']') > -1) {
                let _profile_name = profile.replace('[', '').replace(']', '');
                if (isConfig) _profile_name = _profile_name.split('profile ')[1];
                if (_profile_name.trim().toLowerCase() === profile_name.trim().toLowerCase()) found_profile = true;
            }
        }
        return found_profile;
    } catch (e) {
        console.warn('logging error in looking for profile, will return false printing error', e);
        return false;
    }
};

const _writeDefaults = async (region) => {
    try {
        const directories = [`${file.aws_route()}`];
        await file.doesLocalDirectoriesExist(directories);

        const config_exists = await file.read_file(file.aws_config_route());
        if (!config_exists) {
            await _write_default_config(region);
        } else {
            const default_profile_exists = await _doesProfileExist('default', true);
            if (!default_profile_exists) await _write_default_config(region);
        }
        const credentials_exist = await file.read_file(file.aws_credentials_route());
        if (!credentials_exist) await fs.appendFileSync(file.aws_credentials_route(), '');

        await _does_env_variable_exist();
        return true;
    } catch (error) {
        console.warn(error);
        return true;
    }
};

const _addProfile = async (profile_name, account_id, role_name, mfa_serial = false) => {
    const config_exists = await file.read_file(file.aws_config_route());
    if (!config_exists) {
        await _write_default_config();
    }

    const profile_exists = await _doesProfileExist(profile_name, true);
    if (!profile_exists) {
        await fs.appendFileSync(file.aws_config_route(), `[profile ${profile_name}]${os.EOL}`);
        await fs.appendFileSync(
            file.aws_config_route(),
            `role_arn=arn:aws:iam::${account_id}:role/${role_name}${os.EOL}`
        );
        if (mfa_serial) await fs.appendFileSync(file.aws_config_route(), `mfa_serial=${mfa_serial}${os.EOL}`);
    }

    return true;
};

const _addCredentials = async (access_key, secret_key, profile_name = 'local') => {
    const profile_exists = await _doesProfileExist(profile_name);
    if (!profile_exists) {
        await fs.appendFileSync(file.aws_credentials_route(), `[${profile_name}]${os.EOL}`);
        await fs.appendFileSync(file.aws_credentials_route(), `aws_access_key_id=${access_key}${os.EOL}`);
        await fs.appendFileSync(file.aws_credentials_route(), `aws_secret_access_key=${secret_key}${os.EOL}`);
    }

    return true;
};

exports.addProfile = async (profile_name, account_id, role_name, mfa_serial = false, region = 'us-east-2') => {
    await _writeDefaults(region);
    return _addProfile(profile_name, account_id, role_name, mfa_serial);
};

exports.addCredentials = async (access_key, secret_key, name, region = 'us-east-2') => {
    await _writeDefaults(region);
    return _addCredentials(access_key, secret_key, name);
};

exports.writeDefaults = async (region = 'us-east-2') => {
    return _writeDefaults(region);
};

exports.doesProfileExist = async (profile_name, isConfig) => {
    return _doesProfileExist(profile_name, isConfig);
};
