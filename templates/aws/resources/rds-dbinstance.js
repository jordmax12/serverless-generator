const template = (args) => {
    const { engine, db_name } = args;
    const _template = {
        Type: "AWS::RDS::DBInstance",
        Properties: {
           AllowMajorVersionUpgrade: false,
           AutoMinorVersionUpgrade: true,
           AllocatedStorage: 100,
           AvailabilityZone: "${self:provider.region}a",
           PubliclyAccessible: true,
           StorageType: "gp2",
           DBInstanceClass: "${self:custom.db_instance_size.${self:provider.stage}}",
           DBInstanceIdentifier: "${self:provider.stackTags.name}",
           DBName: db_name,
           StorageEncrypted: true,
           VPCSecurityGroups: [
              {
                 Ref: "RDSSecurityGroup"
              }
           ],
           DBSubnetGroupName: {
              Ref: "RDSSubnetGroup"
           },
           MasterUsername: "root",
           MasterUserPassword: "root_password"
        },
        DeletionPolicy: "Snapshot"
    }
    if(engine === "mysql") {
        _template.Properties.Engine = 'mysql';
        _template.Properties.EngineVersion = '5.7.26';
    } else if(engine === "postgres") {
        _template.Properties.Engine = 'aurora-postgresql';
    }

    return _template;
}

exports.default = template;