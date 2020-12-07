const file = require('./file');
const serverless_helper = require('./serverless');
const {custom_es} = require('../templates/aws/resources/elasticsearch');
const {addEnvVariable} = require('./env');

const _environmentVariables = async (domain_name, index, type) => {
    const directories = ['aws', 'aws/envs'];
    await file.doesLocalDirectoriesExist(directories);
    const local_env_path = `${file.root(true)}aws/envs/local.yml`;
    const local_env_exists = await file.path_exists(local_env_path);

    if (!local_env_exists) {
        await file.write_yaml(`${file.root(true)}aws/envs/local.yml`, local_env_template);
    }

    const local_variables = {
        [`ELASTICSEARCH_${domain_name.replace(/-/g, '_')}_INDEX`]: index,
        [`ELASTICSEARCH_${domain_name.replace(/-/g, '_')}_TYPE`]: type,
        [`ELASTICSEARCH_${domain_name.replace(/-/g, '_').toUpperCase()}_DOMAIN`]: domain_name
    };

    for (const [key, value] of Object.entries(local_variables)) {
        await addEnvVariable({key, value}, 'local');
    }

    const cloud_env_path = `${file.root(true)}aws/envs/cloud.yml`;
    const cloud_env_exists = await file.path_exists(cloud_env_path);

    if (!cloud_env_exists) {
        await file.write_yaml(`${file.root(true)}aws/envs/cloud.yml`, local_env_template);
    }

    // const cloud_env = await file.read_yaml(cloud_env_path);
    const cloud_variables = {
        [`ELASTICSEARCH_${domain_name.replace(/-/g, '_')}_INDEX`]: index,
        [`ELASTICSEARCH_${domain_name.replace(/-/g, '_')}_TYPE`]: type,
        [`ELASTICSEARCH_${domain_name.replace(/-/g, '_').toUpperCase()}_DOMAIN`]: {
            'FN::GetAtt': [`ElasticSearch${domain_name}`, 'DomainEndpoint']
        }
    };

    for (const [key, value] of Object.entries(cloud_variables)) {
        await addEnvVariable({key, value}, 'cloud');
    }

    return true;
};

const _addServerlessVariables = async (domain_name, index, type, region) => {
    const _path = `${file.root(true)}serverless.yml`;
    const read_yaml = await file.read_yaml(_path);
    const {custom} = read_yaml;
    const {es} = custom;
    if (!es) {
        read_yaml.custom.es = {};
    }

    read_yaml.custom.es[domain_name] = custom_es(domain_name, index, type, region);

    const _es = {
        key: 'es',
        value: read_yaml.custom.es
    };

    return serverless_helper.addCustom(_es);
};

const _addResource = async (domain_name) => {
    const resource = ['elasticsearch'];
    return serverless_helper.addResources(resource, {domain_name});
};

exports.init = async (args) => {
    const {domain_name, index, type, region = 'us-east-2'} = args;
    await _environmentVariables(domain_name, index, type);
    await _addServerlessVariables(domain_name, index, type, region);
    await _addResource(domain_name);
    return true;
};
