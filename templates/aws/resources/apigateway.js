const template = (args = {}) => {
    const {domain_name = 'syndpe.com', custom_uri_suffix = 'api'} = args;
    return {
        Resources: {
            ApiGatewayStage: {
                Type: "AWS::ApiGateway::Stage",
                DependsOn: "ApiGatewayMethodAny",
                Properties: {
                    StageName: "${self:provider.stage}",
                    DeploymentId: {
                        Ref: "__deployment__"
                    },
                    RestApiId: {
                        Ref: "ApiGatewayRestApi"
                    },
                    MethodSettings: [
                        {
                        ResourcePath: "/*",
                        HttpMethod: "*",
                        LoggingLevel: "INFO",
                        DataTraceEnabled: true,
                        MetricsEnabled: true
                        }
                    ]
                }
            },
            ApiGatewayPublicBasePathMapping: {
                Type: "AWS::ApiGateway::BasePathMapping",
                DependsOn: "ApiGatewayStage",
                Properties: {
                    BasePath: "${self:service}",
                    DomainName: `\${self:provider.stage}-${custom_uri_suffix}.${domain_name}`,
                    RestApiId: {
                        Ref: "ApiGatewayRestApi"
                    },
                    Stage: {
                        Ref: "ApiGatewayStage"
                    }
                }
            }
        }
    }
}

exports.default = template;