const file = require('./file');
const {addCustom, addPlugin, addIamRole, addResources} = require('./serverless');
const {default: local_env_template} = require('../templates/aws/envs/local');
const {addPackage, create: create_package_json} = require('./package-json');

const _addPlugin = async () => {
    const plugin = 'serverless-dynamodb-local';
    return addPlugin(plugin);
};

const _addServerlessVariables = async () => {
    const security_group_custom = {
        key: 'ddb_recovery',
        value: {
            local: false,
            dev: false,
            qa: false,
            uat: true,
            prod: true
        }
    };

    await addCustom(security_group_custom);

    const db_instance_size_custom = {
        key: 'dynamodb',
        value: {
            stages: ['local'],
            start: {
                port: 4000,
                inMemory: true,
                migrate: true,
                seed: true
            }
        }
    };

    await addCustom(db_instance_size_custom);
};

const _addEnvironmentVariables = async (db_name) => {
    const directories = ['aws', 'aws/envs'];
    await file.doesLocalDirectoriesExist(directories);
    const local_env_path = `${file.root(true)}aws/envs/local.yml`;
    const local_env_exists = await file.path_exists(local_env_path);
    if (!local_env_exists) {
        // const
        await file.write_yaml(`${file.root(true)}aws/envs/local.yml`, local_env_template);
    }
    const local_env = await file.read_yaml(local_env_path);
    local_env.environment[
        `DYNAMO_${db_name.replace(/-/g, '_').toUpperCase()}`
    ] = `\${self:provider.stackTags.name}-${db_name}`;

    await file.write_yaml(local_env_path, local_env);

    const cloud_env_path = `${file.root(true)}aws/envs/cloud.yml`;
    const cloud_env_exists = await file.path_exists(cloud_env_path);

    if (!cloud_env_exists) {
        // const
        await file.write_yaml(`${file.root(true)}aws/envs/cloud.yml`, local_env_template);
    }

    const cloud_env = await file.read_yaml(cloud_env_path);
    cloud_env.environment[
        `DYNAMO_${db_name.replace(/-/g, '_').toUpperCase()}`
    ] = `\${self:provider.stackTags.name}-${db_name}`;
    return file.write_yaml(`${file.root(true)}aws/envs/cloud.yml`, cloud_env);
};

const _addDynamoDBResources = async (db_name, range_key) => {
    const resources = ['dynamodb'];
    return addResources(resources, {
        db_name,
        range_key
    });
};

const _iamRoles = async () => {
    return addIamRole('./aws/iamroles/dynamodb.yml', 'dynamodb');
};

const _addPackageJsonPackages = async () => {
    const packages = [
        {
            name: 'serverless-dynamodb-local',
            version: '^0.2.38',
            isDev: true
        },
        {
            name: 'serverless-offline',
            version: '5.12.1',
            isDev: true
        }
    ];

    return addPackage(packages);
    // return _createVersionerFunction();
};

const _verifyPackageJsonExists = async (project_name = 'default-generated-project-name') => {
    return create_package_json(project_name);
};

exports.init = async (args) => {
    await _verifyPackageJsonExists();
    await _addPackageJsonPackages();
    await _iamRoles();
    await _addDynamoDBResources(args.db_name, args.range_key);
    await _addEnvironmentVariables(args.db_name);
    await _addServerlessVariables();
    await _addPlugin();
};
