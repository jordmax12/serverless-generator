const yaml = require('js-yaml');
const fs = require('fs');
const file = require('../../helpers/file');
const mock_guid = 'ce3710ae-aef8-4997-a349-a71e331e4cbb';
const mock_date = '2020-08-12T01:15:36.062Z';
const mock_serverless_json = yaml.safeLoad(fs.readFileSync(`${file.root()}templates/serverless/serverless.yml`, 'utf8'));
const mock_service = 'grower-contracts';
const mock_version = 'v1';
const mock_apigateway_type = 'apigateway';
const mock_apigateway_name = 'handler';
const mock_apigateway_executor = 'route';
const mock_apigateway_memorySize = 256;
const mock_apigateway_timeout = 30;
const mock_console_type = 'console';
const mock_console_name = 'handler';
const mock_console_executor = 'run';
const mock_console_memorySize = 256;
const mock_console_timeout = 30;
const mock_neo4j_host = '${self:custom.neo4j_config.${self:provider.stage}.host}';
const mock_neo4j_user = '${self:custom.neo4j_config.${self:provider.stage}.user}';
const mock_neo4j_password = '${self:custom.neo4j_config.${self:provider.stage}.password}';
const mock_neo4j_encrypted = false;
const mock_mysql_db_uri = 'mysql://root:root_password@127.0.0.1:3306/local';

exports.properties = {
    guid: mock_guid,
    date: mock_date,
    service: mock_service,
    version: mock_version,
    apigateway_type: mock_apigateway_type,
    apigateway_name: mock_apigateway_name,
    apigateway_executor: mock_apigateway_executor,
    apigateway_memorySize: mock_apigateway_memorySize,
    apigateway_timeout: mock_apigateway_timeout,
    console_type: mock_console_type,
    console_name: mock_console_name,
    console_executor: mock_console_executor,
    console_memorySize: mock_console_memorySize,
    console_timeout: mock_console_timeout,
    serverless_json: mock_serverless_json,
    neo4j_host: mock_neo4j_host,
    neo4j_user: mock_neo4j_user,
    neo4j_password: mock_neo4j_password,
    neo4j_encrypted: mock_neo4j_encrypted,
    mysql_uri: mock_mysql_db_uri
}
