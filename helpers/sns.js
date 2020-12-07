const file = require('./file');
const serverless_helper = require('./serverless');
const {addIamRole, addCustom} = require('./serverless');
const {default: local_env_template} = require('../templates/aws/envs/local');

const _environmentVariables = async () => {
    const directories = ['aws', 'aws/envs'];
    await file.doesLocalDirectoriesExist(directories);
    const local_env_path = `${file.root(true)}aws/envs/local.yml`;
    const local_env_exists = await file.path_exists(local_env_path);
    if (!local_env_exists) {
        await file.write_yaml(local_env_path, local_env_template);
    }
    const local_env = await file.read_yaml(local_env_path);
    if (local_env.policies) {
        local_env.policies.sns = '${cf:${self:provider.stage}-platform-model-revisions.ModelRevisionTopicName}';
    } else {
        local_env.policies = {
            sns: '${cf:${self:provider.stage}-platform-model-revisions.ModelRevisionTopicName}'
        };
    }

    await file.write_yaml(local_env_path, local_env);

    const cloud_env_path = `${file.root(true)}aws/envs/cloud.yml`;
    const cloud_env_exists = await file.path_exists(cloud_env_path);

    if (!cloud_env_exists) {
        await file.write_yaml(cloud_env_path, local_env_template);
    }

    const cloud_env = await file.read_yaml(cloud_env_path);
    if (cloud_env.policies) {
        cloud_env.policies.sns = '${cf:${self:provider.stage}-platform-model-revisions.ModelRevisionTopicName}';
    } else {
        cloud_env.policies = {
            sns: '${cf:${self:provider.stage}-platform-model-revisions.ModelRevisionTopicName}'
        };
    }
    return file.write_yaml(cloud_env_path, cloud_env);
};

const _addServerlessVariables = async () => {
    const accounts = {
        key: 'accounts',
        value: {
            local: '0000000000',
            dev: '1111111111',
            qa: '2222222222',
            uat: '3333333333',
            prod: '4444444444'
        }
    };

    return addCustom(accounts);
};

const _addIamRoles = async (topic_name) => {
    return addIamRole('./aws/iamroles/sns.yml', 'sns', null, null, null, topic_name);
};

const _addResource = async (topic_name, queue_name, is_subscription, dedup) => {
    const resource = ['sns'];
    return serverless_helper.addResources(resource, {topic_name, queue_name, is_subscription, dedup});
};

exports.addTopic = async (args) => {
    const {topic_name, dedup} = args;
    await _addServerlessVariables();
    await _addIamRoles(topic_name);
    await _addResource(topic_name, null, false, dedup);
    return true;
};

exports.addSubscription = async (args) => {
    const {topic_name, queue_name} = args;
    // await _environmentVariables();
    // await _addServerlessVariables();
    await _addIamRoles();
    await _addResource(topic_name, queue_name, true);
    return true;
};
