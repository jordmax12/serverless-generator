const file = require('./file');
const serverless_helper = require('./serverless');
const {default: local_env_template} = require('../templates/aws/envs/local');
const {default: local_postgres_template} = require('../templates/aws/local/postgres');

const _localPostgres = async () => {
    const _path = `${file.root(true)}aws/local/postgres.yml`;
    const directories = ['aws', 'aws/local'];
    await file.doesLocalDirectoriesExist(directories);
    await file.write_yaml(_path, local_postgres_template);
};

const _environmentVariables = async (db_name) => {
    const directories = ['aws', 'aws/envs'];
    await file.doesLocalDirectoriesExist(directories);
    const local_env_path = `${file.root(true)}aws/envs/local.yml`;
    const local_env_exists = await file.path_exists(local_env_path);
    if (!local_env_exists) {
        // const
        await file.write_yaml(local_env_path, local_env_template);
    }
    const local_env = await file.read_yaml(local_env_path);
    local_env.environment.POSTGRES_DB_NAME = db_name;

    await file.write_yaml(local_env_path, local_env);

    const cloud_env_path = `${file.root(true)}aws/envs/cloud.yml`;
    const cloud_env_exists = await file.path_exists(cloud_env_path);

    if (!cloud_env_exists) {
        // const
        await file.write_yaml(cloud_env_path, local_env_template);
    }

    const cloud_env = await file.read_yaml(cloud_env_path);
    cloud_env.environment.POSTGRES_DB_NAME = db_name;
    return file.write_yaml(cloud_env_path, cloud_env);
};

const _addPostgresResources = async (args) => {
    const resources = ['rds-postgres', 'security-group-rules', 'security-group', 'vpc-rds'];

    return serverless_helper.addResources(resources, args);
};

const _iamRoles = async (api_name) => {
    return serverless_helper.addIamRole('./aws/iamroles/ssm.yml', 'ssm', api_name);
};

const _addServerlessVariables = async () => {
    const security_group_custom = {
        key: 'security_group',
        value: '${file(./aws/resources/security-group-rules.yml):groups}'
    };

    await serverless_helper.addCustom(security_group_custom);

    const db_instance_size_custom = {
        key: 'db_instance_size',
        value: {
            local: 'db.t2.small',
            dev: 'db.t2.small',
            qa: 'db.m4.large',
            uat: 'db.m4.large',
            prod: 'db.m4.large'
        }
    };

    await serverless_helper.addCustom(db_instance_size_custom);
};

exports.init = async (args) => {
    await _addPostgresResources(args);
    await _environmentVariables(args.db_name);
    await _addServerlessVariables();
    await _iamRoles(args.api_name);
    await _localPostgres(args.db_name);
    return true;
};
