const template = (domain_name) => {
    return {
      Type: "AWS::Elasticsearch::Domain",
      Properties: {
         AccessPolicies: {
            Version: "2012-10-17",
            Statement: [
               {
                  Effect: "Allow",
                  Principal: {
                     AWS: "*"
                  },
                  Action: "es:ESHttp*",
                  Resource: `arn:aws:es:\${self:provider.region}:#{AWS::AccountId}:domain/\${self:custom.es.${domain_name}.domain}/*`
               }
            ]
         },
         DomainName: `\${self:custom.es.${domain_name}.domain}`,
         EBSOptions: {
            EBSEnabled: true,
            VolumeSize: `\${self:custom.es.${domain_name}.volumes.\${self:provider.stage}}`,
            VolumeType: "gp2"
         },
         ElasticsearchClusterConfig: {
            InstanceCount: `\${self:custom.es.${domain_name}.instance_count}`,
            InstanceType: `\${self:custom.es.${domain_name}.instance_size.\${self:provider.stage}}`
         },
         ElasticsearchVersion: `\${self:custom.es.${domain_name}.version}`
      }
   }
}

exports.default = template;

const custom_es = (domain_name, index, type, region) => {
   // TODO: l7p5piqzo3efmssb6zpbsnxbsm whats this and what do we need to replace it with?
   return {
      es: null,
      domain: `\${self:provider.stackName}-${domain_name}-search`,
      index,
      type,
      version: 7.7,
      endpoints: {
         local: `search-\${self:custom.es.${domain_name}.domain}-l7p5piqzo3efmssb6zpbsnxbsm.${region}.es.amazonaws.com`
      },
      volumes: {
         local: 10,
         dev: 10,
         qa: 10,
         uat: 20,
         prod: 20
      },
      instance_size: {
         local: "t2.medium.elasticsearch",
         dev: "t2.medium.elasticsearch",
         qa: "t2.medium.elasticsearch",
         uat: "r5.xlarge.elasticsearch",
         prod: "r5.xlarge.elasticsearch"
      },
      instance_count: "1"
   }
   
}

exports.custom_es = custom_es;