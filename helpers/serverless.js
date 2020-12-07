const formatter = require('esformatter');
const file = require('./file');
const {validResourceName} = require('./string');
const packagejson_helper = require('./package-json');
const {default: es_template} = require('../templates/aws/resources/elasticsearch');
const {default: apigateway_template} = require('../templates/aws/resources/apigateway');
const {default: dynamodb_table_template} = require('../templates/aws/resources/dynamodb/table');
const {default: dynamodb_database_template} = require('../templates/aws/resources/dynamodb/database');
const {default: rds_postgres_template} = require('../templates/aws/resources/postgres/rds-postgres');
const {default: rds_mysql_template} = require('../templates/aws/resources/mysql/rds-mysql');
const {default: rds_dbinstance_template} = require('../templates/aws/resources/rds-dbinstance');
const {default: security_group_template} = require('../templates/aws/resources/mysql/security-group');
const {default: security_group_rules_template} = require('../templates/aws/resources/mysql/security-group-rules');
const {default: vpc_rds_template} = require('../templates/aws/resources/vpc');
const {default: sqs_queue_template} = require('../templates/aws/resources/sqs');
const {default: local_env_template} = require('../templates/aws/envs/local');
const {topic: sns_topic_template, subscription: sns_subscription_template} = require('../templates/aws/resources/sns');
const {bucket, public_policy} = require('../templates/aws/resources/s3');
const {ddbTemplate, s3Template, snsTemplate, sqsTemplate, ssmTemplate} = require('../templates/aws/iamRoles');

const _initEnv = async () => {
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
        return file.write_yaml(cloud_env_path, local_env_template);
    }

    return true;
};

const _initServerless = async (service, runtime = 'nodejs12.x') => {
    const _path = `${file.root(true)}serverless.yml`;
    const exists = await file.path_exists(_path);
    let doc = null;
    if (!exists) {
        doc = await file.read_yaml(`${file.root()}templates/serverless/serverless.yml`);
    } else {
        doc = await file.read_yaml(_path);
    }
    if (!doc) {
        doc = {};
    }
    // doc.app = app;
    doc.service = service;
    doc.provider.runtime = runtime;
    await _addBaseFiles(runtime);
    await packagejson_helper.create(`api-node-${service}`);
    return file.write_yaml(`${file.root(true)}serverless.yml`, doc);
};

const _addBaseFiles = async (runtime = 'nodejs12.x') => {
    const directories = [
        '.github'
        // 'application'
    ];
    await file.doesLocalDirectoriesExist(directories);
    const templates = [
        {
            src: '.github',
            target: '.github/',
            dir: true
        },
        {
            src: '.nvmrc',
            target: '.nvmrc'
        }
    ];

    for (const template of templates) {
        const _path = `${file.root(true)}${template.target}`;
        if (template.dir) {
            await file.copy_directory(`${file.root()}templates/basic/${template.src}`, _path);
        } else {
            await file.copy_directory(`${file.root()}templates/basic/${template.src}`, _path);
        }
    }

    await _initEnv();
    // await file.copy_directory(`${file.root()}templates/application`, `${file.root(true)}/application`);

    return true;
};

const _apigatewayHandler = async (args) => {
    const {version, type, name, executor, memorySize = 256, timeout = 30} = args;

    const doc = await file.read_yaml(`${file.root()}templates/serverless/serverless.yml`);
    const function_name = `${version}-${type}-${name}`;
    const apigateway_function = {
        name: `\${self:provider.stackTags.name}-${function_name}`,
        description: 'API Router handler',
        handler: `application/${version}/controller/${type}/_router.${executor}`,
        memorySize,
        timeout
    };

    if (!doc.functions) {
        doc.functions = {};
    }

    doc.functions['v1-apigateway-handler'] = apigateway_function;
    return {
        new_function: apigateway_function,
        name: function_name
    };
};

const _databaseVersioner = async (args) => {
    const {version, executor, memorySize = 256, timeout = 900} = args;
    const doc = await file.read_yaml(`${file.root(true)}serverless.yml`);
    const function_name = `${version}-database-versioner`;
    const database_versioner_function = {
        name: `\${self:provider.stackTags.name}-${function_name}`,
        description: 'Applies versions to DB',
        handler: `application/${version}/controller/console/database-versioner.${executor}`,
        memorySize,
        timeout
    };

    if (!doc.functions) {
        doc.functions = {};
    }

    doc.functions['v1-database-versioner'] = database_versioner_function;
    return {
        new_function: database_versioner_function,
        name: function_name
    };
};
/* eslint-disable no-unused-vars */
const _sqsListener = async (args) => {
    const {version, name, executor, queue, memorySize = 256, timeout = 15} = args;
    const doc = await file.read_yaml(`${file.root(true)}serverless.yml`);
    const function_name = `${version}-${name}`;
    const sqs_listener_function = {
        name: `\${self:provider.stackTags.name}-${function_name}`,
        description: `Generic SQS Listener function for ${name}`,
        handler: `application/${version}/sqs/${name}.${executor}`,
        memorySize,
        timeout,
        events: [
            {
                sqs: {
                    arn: {
                        'FN::GetAtt': `[ ${queue}, 'Arn' ]`
                    }
                }
            }
        ]
    };

    if (!doc.functions) {
        doc.functions = {};
    }

    doc.functions[`${version}-${name}`] = sqs_listener_function;
    return {
        new_function: sqs_listener_function,
        name: function_name
    };
};

const functionHashMapper = new Map([
    ['apigateway-handler', _apigatewayHandler],
    ['console-database-versioner', _databaseVersioner]
    // v1-sqs-listener need to figure out how to make this work...
]);

const _ddbIamRoleHandler = async () => {
    return file.write_yaml(`${file.root(true)}aws/iamroles/dynamodb.yml`, ddbTemplate());
};

const _s3IamRoleHandler = async (bucket_name) => {
    const _path = `${file.root(true)}aws/iamroles/s3.yml`;
    const path_exists = await file.path_exists(_path);

    if (!path_exists) {
        return file.write_yaml(`${file.root(true)}aws/iamroles/s3.yml`, s3Template(bucket_name));
    }

    const read_resource = await file.read_yaml(_path);
    const {Resource} = read_resource;
    // 'arn:aws:s3:::${self:provider.stackTags.name}-pdf-storage/*'
    const expected_arn = `arn:aws:s3:::\${self:provider.stackTags.name}-${bucket_name}/*`;
    const find = Resource.find((x) => x === expected_arn);
    if (!find) {
        read_resource.Resource.push(expected_arn);
    }

    return file.write_yaml(`${file.root(true)}aws/iamroles/s3.yml`, read_resource);
};

const _snsIamRoleHandler = async (topic_name, region = 'us-east-2') => {
    const _path = `${file.root(true)}aws/iamroles/sns.yml`;
    const _exists = await file.path_exists(_path);
    const _arn = `arn:aws:sns:${region}:#{AWS::AccountId}:${validResourceName(
        topic_name
    )}`;
    if (!_exists) return file.write_yaml(_path, snsTemplate(_arn));

    const read_resource = await file.read_yaml(_path);
    read_resource.Resource.push(_arn);
    return file.write_yaml(_path, read_resource);
};

const _sqsIamRoleHandler = async (queue_name, region = 'us-east-2') => {
    const _path = `${file.root(true)}aws/iamroles/sqs.yml`;
    const _exists = await file.path_exists(_path);
    const _arn = `arn:aws:sqs:${region}:#{AWS::AccountId}:${validResourceName(
        queue_name
    )}`;
    if (!_exists) return file.write_yaml(_path, sqsTemplate(_arn));

    const read_resource = await file.read_yaml(_path);
    read_resource.Resource.push(_arn);
    return file.write_yaml(_path, read_resource);
};

const _ssmIamRoleHandler = async (api_name) => {
    const _path = `${file.root(true)}aws/iamroles/ssm.yml`;
    const path_exists = await file.path_exists(_path);

    if (!path_exists) {
        return file.write_yaml(`${file.root(true)}aws/iamroles/ssm.yml`, ssmTemplate(api_name));
    }

    const read_resource = await file.read_yaml(_path);
    const {Resource} = read_resource;
    const expected_arn = `arn:aws:ssm:\${self:provider.region}:*:parameter/\${self:provider.stackTags.name}/*`;
    const find = Resource.find((x) => x === expected_arn);
    if (!find) {
        read_resource.Resource.push(expected_arn);
    }

    return file.write_yaml(`${file.root(true)}aws/iamroles/ssm.yml`, read_resource);
};

const _addFunction = async (args) => {
    const {hash_type} = args;
    const doc = await file.read_yaml(`${file.root(true)}serverless.yml`);
    const new_function = await functionHashMapper.get(hash_type)(args);
    if (!doc.functions) {
        doc.functions = {};
    }
    doc.functions[new_function.name] = new_function.new_function;
    await file.write_yaml(`${file.root(true)}serverless.yml`, doc);
    return new_function;
};

const dynamodb_resource_handler = async (args) => {
    const _resource_path = `${file.root(true)}aws/resources/dynamodb.yml`;
    const does_resource_exist = await file.path_exists(_resource_path);
    let read_resource = null;
    if (!does_resource_exist) {
        read_resource = dynamodb_database_template();
    } else {
        read_resource = await file.read_yaml(_resource_path);
    }
    read_resource.Resources[validResourceName(args.db_name)] = dynamodb_table_template(args.db_name, args.range_key);
    return read_resource;
};

const _addVpcPort = async (args, engine) => {
    let port = null;

    const _resource_path = `${file.root(true)}aws/resources/security-group-rules.yml`;
    const does_resource_exist = await file.path_exists(_resource_path);

    if (!does_resource_exist) {
        await file.write_yaml(_resource_path, await security_group_rules_template(args));
    }

    const read_resource = await file.read_yaml(_resource_path);

    switch (engine) {
        case 'mysql':
            port = 3306;
            break;
        case 'postgres':
            port = 5432;
            break;
        default:
            throw new Error('Unsupported DB engine.');
    }

    const envs = ['dev', 'qa', 'prod'];

    for (const env of envs) {
        const new_port = [
            {
                SourceSecurityGroupId: {
                    Ref: 'LambdaSecurityGroup'
                },
                IpProtocol: 'tcp',
                FromPort: port,
                ToPort: port
            },
            {
                IpProtocol: 'tcp',
                CidrIp: '0.0.0.0/0',
                FromPort: port,
                ToPort: port
            }
        ];
        if (!read_resource.groups[env].rds) {
            read_resource.groups[env].rds = {};
            read_resource.groups[env].rds.inbound = new_port;
        } else {
            const does_this_port_exist = read_resource.groups[env].rds.inbound
                .filter((x) => x.FromPort === port)
                .shift();
            if (!does_this_port_exist) {
                read_resource.groups[env].rds.inbound.push(new_port[0]);
                read_resource.groups[env].rds.inbound.push(new_port[1]);
            }
        }
    }

    return file.write_yaml(_resource_path, read_resource);
};

const rds_mysql_resource_handler = async (args) => {
    const _resource_path = `${file.root(true)}aws/resources/rds-mysql.yml`;
    const does_resource_exist = await file.path_exists(_resource_path);
    let read_resource = null;
    if (!does_resource_exist) {
        read_resource = rds_mysql_template(args);
    } else {
        read_resource = await file.read_yaml(_resource_path);
    }
    read_resource.Resources[`${validResourceName(args.db_name)}DB`] = rds_dbinstance_template(args);
    // add correct vpc port
    await _addVpcPort(args, 'mysql');
    return read_resource;
};

const rds_postgres_resource_handler = async (args) => {
    const _resource_path = `${file.root(true)}aws/resources/rds-postgres.yml`;
    const does_resource_exist = await file.path_exists(_resource_path);
    let read_resource = null;
    if (!does_resource_exist) {
        read_resource = rds_postgres_template(args);
    } else {
        read_resource = await file.read_yaml(_resource_path);
    }
    read_resource.Resources[`${validResourceName(args.db_name)}DB`] = rds_dbinstance_template(args);
    // add correct vpc port
    await _addVpcPort(args, 'postgres');
    return read_resource;
};

const security_group_rules_resource_handler = async () => {
    const _resource_path = `${file.root(true)}aws/resources/security-group-rules.yml`;
    const does_resource_exist = await file.path_exists(_resource_path);
    let read_resource = null;
    if (!does_resource_exist) {
        read_resource = security_group_rules_template();
    } else {
        read_resource = await file.read_yaml(_resource_path);
    }

    return read_resource;
};

const s3_resource_handler = async (args) => {
    const _path = `${file.root(true)}aws/resources/s3.yml`;

    const path_exists = await file.path_exists(_path);
    let read_resource = {
        Resources: {}
    };

    if (path_exists) {
        read_resource = await file.read_yaml(_path);
    }

    const template = bucket(args.bucket_name);
    read_resource.Resources[`${validResourceName(args.bucket_name)}Storage`] = template;
    if (args.isPublic) {
        const public_policy_template = public_policy(args.bucket_name);
        read_resource.Resources[
            `AttachmentsBucketAllowPublicReadPolicy${validResourceName(args.bucket_name)}`
        ] = public_policy_template;
    }

    return read_resource;
};

const sqs_resource_handler = async (args) => {
    const {queue_name, isFifo = false, includeDLQ = false, timeout = 30, maxRedriveReceiveCount = 5} = args;
    const template = sqs_queue_template(queue_name, isFifo, includeDLQ, timeout, maxRedriveReceiveCount);

    const _path = `${file.root(true)}aws/resources/sqs.yml`;
    const path_exists = await file.path_exists(_path);
    let read_resource = {
        Resources: {}
    };
    if (path_exists) {
        read_resource = await file.read_yaml(_path);
    }

    read_resource.Resources = {...read_resource.Resources, ...template};
    return read_resource;
};

const _addTopic = async (topic_name, dedup = false) => {
    const _path = `${file.root(true)}aws/resources/sns.yml`;

    const path_exists = await file.path_exists(_path);
    let read_resource = {
        Resources: {}
    };

    if (path_exists) {
        read_resource = await file.read_yaml(_path);
    }

    const template = sns_topic_template(topic_name, dedup);
    read_resource.Resources[`${validResourceName(topic_name)}Topic`] = template;
    // return file.write_yaml(_path, read_resource);
    return read_resource;
};

const _addSubscription = async (topic_name, queue_name) => {
    const _path = `${file.root(true)}aws/resources/sns.yml`;
    const path_exists = await file.path_exists(_path);
    let read_resource = {
        Resources: {}
    };
    if (path_exists) {
        read_resource = await file.read_yaml(_path);
    }

    const template = sns_subscription_template(topic_name, queue_name);
    read_resource.Resources[`${validResourceName(topic_name)}Subscription`] = template;
    // return file.write_yaml(_path, read_resource);
    return read_resource;
};

const sns_resource_handler = async (args) => {
    const {is_subscription, topic_name, queue_name, dedup} = args;

    if (is_subscription) {
        return _addSubscription(topic_name, queue_name);
    }
    return _addTopic(topic_name, dedup);
};

const elasticsearch_resource_handler = async (args) => {
    const _path = `${file.root(true)}aws/resources/elasticsearch.yml`;
    const {domain_name} = args;
    const base = {
        Resources: {},
        Outputs: {}
    };

    const does_exist = await file.path_exists(_path);
    if (!does_exist) {
        await file.write_yaml(_path, base);
    }

    const read_resource = await file.read_yaml(_path);
    read_resource.Resources[validResourceName(domain_name)] = es_template(domain_name);
    read_resource.Outputs[`Elasticsearch${validResourceName(domain_name)}Domain`] = {
        Value: {
            Ref: validResourceName(domain_name)
        }
    };

    read_resource.Outputs[`Elasticsearch${validResourceName(domain_name)}Arn`] = {
        Value: null
    };

    read_resource.Outputs[`Elasticsearch${validResourceName(domain_name)}Endpoint`] = {
        Value: null
    };

    return read_resource;
};

const _createResource = async (args) => {
    let fn = null;
    switch (args.resource) {
        case 'apigateway':
            fn = apigateway_template;
            break;
        case 'dynamodb':
            fn = dynamodb_resource_handler;
            break;
        case 'rds-mysql':
            fn = rds_mysql_resource_handler;
            break;
        case 'rds-postgres':
            fn = rds_postgres_resource_handler;
            break;
        case 'security-group-rules':
            fn = security_group_rules_resource_handler;
            break;
        case 'security-group':
            fn = security_group_template;
            break;
        case 'vpc-rds':
            fn = vpc_rds_template;
            break;
        case 's3':
            fn = s3_resource_handler;
            break;
        case 'sqs':
            fn = sqs_resource_handler;
            break;
        case 'sns':
            fn = sns_resource_handler;
            break;
        case 'elasticsearch':
            fn = elasticsearch_resource_handler;
            break;
        default:
            throw new Error('invalid resource');
    }

    if (!fn) return null;
    return file.write_yaml(`${file.root(true)}aws/resources/${args.resource}.yml`, await fn(args));
};

const _addResource = async (resource, args) => {
    await _resourcesDirectoriesExist();
    const doc = await file.read_yaml(`${file.root(true)}serverless.yml`);
    if (!doc.resources) {
        doc.resources = [];
    }

    const black_list_resources_from_serverless_file = ['security-group-rules'];
    const _resource = `\${file(./aws/resources/${resource}.yml)}`;
    const found = doc.resources.find((x) => x === _resource);
    if (!black_list_resources_from_serverless_file.includes(resource) && !found) doc.resources.push(_resource);
    await _createResource({resource, ...args});
    return file.write_yaml(`${file.root(true)}serverless.yml`, doc);
};

const available_iamroles = ['dynamodb', 's3', 'sns', 'sqs', 'ssm'];

const _resourcesDirectoriesExist = async () => {
    const directories = ['aws', 'aws/resources'];
    for (const dir of directories) {
        const does_exist = await file.path_exists(`${file.root(true)}${dir}`);
        if (!does_exist) await file.create_directory(`${file.root(true)}${dir}`);
    }

    return true;
};

const _iamRoleDirectoriesExist = async () => {
    const directories = ['aws', 'aws/iamroles'];
    for (const dir of directories) {
        const does_exist = await file.path_exists(`${file.root(true)}${dir}`);
        if (!does_exist) await file.create_directory(`${file.root(true)}${dir}`);
    }

    return true;
};

const _addPlugin = async (plugin) => {
    const _path = `${file.root(true)}serverless.yml`;
    const doc = await file.read_yaml(_path);
    const {plugins} = doc;
    if (!plugins) {
        doc.plugins = [];
    }

    doc.plugins.push(plugin);
    return file.write_yaml(_path, doc);
};

const _addIamRole = async (_path, add_to_aws_directory, service, api_name, bucket_name, queue_name, topic_name) => {
    await _iamRoleDirectoriesExist();
    const doc = await file.read_yaml(`${file.root(true)}serverless.yml`);
    const {provider} = doc;
    const {iamRoleStatements} = provider;
    const iamrole = `\${file(${_path})}`;
    if (!iamRoleStatements) {
        doc.provider.iamRoleStatements = [];
    }
    // if(doc.provider.iamRoleStatements.indexOf(iamrole) === -1 && service !== 'apigateway') {
    if (service !== 'apigateway') {
        if (doc.provider.iamRoleStatements.indexOf(iamrole) === -1) {
            doc.provider.iamRoleStatements.push(iamrole);
            await file.write_yaml(`${file.root(true)}serverless.yml`, doc);
        }

        if (add_to_aws_directory) {
            switch (service) {
                case 'dynamodb':
                    await _ddbIamRoleHandler();
                    break;
                case 's3':
                    await _s3IamRoleHandler(bucket_name);
                    break;
                case 'sns':
                    await _snsIamRoleHandler(topic_name);
                    break;
                case 'sqs':
                    await _sqsIamRoleHandler(queue_name);
                    break;
                case 'ssm':
                    await _ssmIamRoleHandler(api_name);
                    break;
                default:
                    break;
            }
        }
    }
    return iamrole;
};

const _isPlainObject = (input) => {
    return input && !Array.isArray(input) && typeof input === 'object';
};
/**
 * @description initiates the serverless file, and will create a barebones one.
 * @param {service} service the service name
 */
exports.init = async (service, runtime = 'nodejs12.x') => {
    return _initServerless(service, runtime);
};
/**
 *
 * @param {args} args args should contain everything needed to create a function in the serverless file. (version, hash_type, type, name, executor, memorySize, timeout)
 */
exports.addFunction = async (args) => {
    // const { version, hash_type, type, name, executor, memorySize, timeout } = args;
    return _addFunction(args);
};
/**
 *
 * @param {path} path this is the path that will be added to the serverless file. (required)
 * @param {service} service this is the service you are adding, it will create the other files needed for said service (required)
 * @param {api_name} api_name this is the api_name, if it applies. (Optional)
 * @param {bucket_name} bucket_name this is the bucket_name, if it applies. (Optional)
 */
exports.addIamRole = async (path, service, api_name, bucket_name, queue_name, topic_name) => {
    let add_to_aws_directory = false;
    if (available_iamroles.indexOf(service) > -1) add_to_aws_directory = true;
    return _addIamRole(path, add_to_aws_directory, service, api_name, bucket_name, queue_name, topic_name);
};
/**
 *
 * @param {data} data data is a key/value object that simply contains a key and a value to add to the custom serverless variables.
 */
exports.addCustom = async (data) => {
    const doc = await file.read_yaml(`${file.root(true)}serverless.yml`);
    doc.custom[data.key] = data.value;
    await file.write_yaml(`${file.root(true)}serverless.yml`, doc);
};
/**
 *
 * @param {resources} resources  resources can be a singular script or an array of resources (just resource path string or array of resource path strings)
 */
exports.addResources = async (resources, args) => {
    let _resources = [];

    if (_isPlainObject(resources)) {
        _resources.push(resources);
    } else if (!(resources.constructor === Array)) {
        throw new Error('invalid resources type sent.');
    } else _resources = resources;

    for (const resource of _resources) {
        await _addResource(resource, args);
    }

    return true;
};
/**
 *
 * @param {plugin} plugin plugin is just a string of the plugin you wish to add, or an array of plugin strings.
 */
exports.addPlugin = async (plugins) => {
    let _plugins = [];

    if (plugins.constructor === Array) {
        _plugins = plugins;
    } else _plugins.push(plugins);

    for (const plugin of _plugins) {
        await _addPlugin(plugin);
    }

    return true;
};
