const file = require('./file');
const serverless_helper = require('./serverless');
const {addIamRole} = require('./serverless');
const {default: local_env_template} = require('../templates/aws/envs/local');

const _environmentVariables = async (bucket_name) => {
    const directories = ['aws', 'aws/envs'];
    await file.doesLocalDirectoriesExist(directories);
    const local_env_path = `${file.root(true)}aws/envs/local.yml`;
    const local_env_exists = await file.path_exists(local_env_path);
    if (!local_env_exists) {
        await file.write_yaml(local_env_path, local_env_template);
    }
    const local_env = await file.read_yaml(local_env_path);
    local_env.environment[
        `${bucket_name.replace(/-/g, '_').toUpperCase()}_S3_BUCKET`
    ] = `\${self:provider.stackTags.name}-${bucket_name}-storage`;

    await file.write_yaml(local_env_path, local_env);

    const cloud_env_path = `${file.root(true)}aws/envs/cloud.yml`;
    const cloud_env_exists = await file.path_exists(cloud_env_path);

    if (!cloud_env_exists) {
        await file.write_yaml(cloud_env_path, local_env_template);
    }

    const cloud_env = await file.read_yaml(cloud_env_path);
    cloud_env.environment[
        `${bucket_name.replace(/-/g, '_').toUpperCase()}_S3_BUCKET`
    ] = `\${self:provider.stackTags.name}-${bucket_name}-storage`;
    
    return file.write_yaml(cloud_env_path, cloud_env);
};

const _addIamRoles = async (bucket_name) => {
    return addIamRole('./aws/iamroles/s3.yml', 's3', null, bucket_name);
};

const _addResource = async (args) => {
    const resource = ['s3'];
    return serverless_helper.addResources(resource, args);
};

exports.init = async (args) => {
    const {bucket_name} = args;
    await _environmentVariables(bucket_name);
    // await _addServerlessVariables();
    await _addIamRoles(bucket_name);
    await _addResource(args);
    return true;
};
