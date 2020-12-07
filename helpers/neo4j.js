const formatter = require('esformatter');
const file = require('./file');
const mock = require('../test/mock/data');
const serverless_helper = require('./serverless');
const packagejson_helper = require('./package-json');
const neo4j_local_template = require('../templates/aws/local/neo4j');
const {default: local_env_template} = require('../templates/aws/envs/local');
const {addScript, create: create_package_json} = require('./package-json');

const _addLocalNeo4j = async () => {
    const _path = `${file.root(true)}aws/local/neo4j.yml`;
    const directories = ['aws', 'aws/local'];
    await file.doesLocalDirectoriesExist(directories);
    await file.write_yaml(_path, neo4j_local_template);
    return true;
};

const _addServerlessVariables = async () => {
    const data = {
        key: 'neo4j_config',
        value: {
            local: {
                host: 'bolt://localhost:7687',
                user: 'neo4j',
                password: 'password',
                encrypted: 'ENCRYPTION_OFF'
            }
        }
    };

    return serverless_helper.addCustom(data);
};

const _addEnvironmentVariables = async () => {
    const directories = ['aws', 'aws/envs'];
    await file.doesLocalDirectoriesExist(directories);
    const _path = `${file.root(true)}aws/envs/local.yml`;
    const local_env_exists = await file.path_exists(_path);
    if (!local_env_exists) {
        // const
        await file.write_yaml(_path, local_env_template);
    }
    const local_env = await file.read_yaml(_path);
    local_env.environment.NEO4J_HOST = mock.properties.neo4j_host;
    local_env.environment.NEO4J_USER = mock.properties.neo4j_user;
    local_env.environment.NEO4J_PASSWORD = mock.properties.neo4j_password;
    local_env.environment.NEO4J_ENCRYPTED = mock.properties.neo4j_encrypted;

    return file.write_yaml(_path, local_env);
};


const _verifyPackageJsonExists = async (project_name = 'default-generated-project-name') => {
    return create_package_json(project_name);
};

const _addStarterScriptsToPackageJson = async () => {
    const scripts = [
        {
            name: 'start',
            value:
                'concurrently "docker-compose -f aws/local/neo4j.yml up -d" "serverless offline start --stage local --aws_envs local --profile local --region us-east-2"'
        }
        // {
        //     name: 'version',
        //     value: "serverless invoke local --function v1-console-database-versioner --stage local --aws_envs local --region us-east-2"
        // }
    ];

    return addScript(scripts);
};

exports.init = async () => {
    await _verifyPackageJsonExists();
    await _addStarterScriptsToPackageJson();
    await _addLocalNeo4j();
    await _addEnvironmentVariables();
    await _addServerlessVariables();
    return true;
};
