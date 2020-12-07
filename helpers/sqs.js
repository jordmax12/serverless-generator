const file = require('./file');
const {addIamRole, addResources, addCustom} = require('./serverless');
const {default: local_env_template} = require('../templates/aws/envs/local');
const { validResourceName } = require('./string');

const _environmentVariables = async (queue_name) => {
    const directories = ['aws', 'aws/envs'];
    await file.doesLocalDirectoriesExist(directories);
    const local_env_path = `${file.root(true)}aws/envs/local.yml`;
    const local_env_exists = await file.path_exists(local_env_path);
    if (!local_env_exists) {
        await file.write_yaml(local_env_path, local_env_template);
    }
    const local_env = await file.read_yaml(local_env_path);
    local_env.environment[`${validResourceName(queue_name)}_QUEUE`] = `\${self:provider.stackTags.name}-${queue_name}-sqs`
    local_env.environment[`${validResourceName(queue_name)}_QUEUE_URL`] = `https://sqs.\${self:provider.region}.amazonaws.com/#{AWS::AccountId}/\${self:provider.stackTags.name}-${queue_name}-sqs`

    await file.write_yaml(local_env_path, local_env);

    const cloud_env_path = `${file.root(true)}aws/envs/cloud.yml`;
    const cloud_env_exists = await file.path_exists(cloud_env_path);

    if (!cloud_env_exists) {
        await file.write_yaml(cloud_env_path, local_env_template);
    }

    const cloud_env = await file.read_yaml(cloud_env_path);

    cloud_env.environment[`${validResourceName(queue_name)}_QUEUE`] = `\${self:provider.stackTags.name}-${queue_name}-sqs`
    cloud_env.environment[`${validResourceName(queue_name)}_QUEUE_URL`] = `https://sqs.\${self:provider.region}.amazonaws.com/#{AWS::AccountId}/\${self:provider.stackTags.name}-${queue_name}-sqs`
    return file.write_yaml(cloud_env_path, cloud_env);
};

const _addIamRoles = async (queue_name) => {
    return addIamRole('./aws/iamroles/sqs.yml', 'sqs', null, null, queue_name);
};

const _addResource = async (args) => {
    const resources = ['sqs'];
    return addResources(resources, args);
};

exports.init = async (args) => {
    await _addIamRoles(args.queue_name);
    await _environmentVariables(args.queue_name);
    await _addResource(args);
    return true;
};
