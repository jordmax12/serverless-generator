const template = () => {
   return {
      Resources: {
         // [`${db_name.replace(/-/g, '').trim()}DB`]: {
         //    Type: "AWS::RDS::DBInstance",
         //    Properties: {
         //       AllowMajorVersionUpgrade: false,
         //       AutoMinorVersionUpgrade: true,
         //       AllocatedStorage: 100,
         //       AvailabilityZone: "${self:provider.region}a",
         //       PubliclyAccessible: true,
         //       StorageType: "gp2",
         //       DBInstanceClass: "${self:custom.db_instance_size.${self:provider.stage}}",
         //       DBInstanceIdentifier: "${self:provider.stackTags.name}",
         //       DBName: db_name,
         //       StorageEncrypted: true,
         //       VPCSecurityGroups: [
         //          {
         //             Ref: "RDSSecurityGroup"
         //          }
         //       ],
         //       DBSubnetGroupName: {
         //          Ref: "RDSSubnetGroup"
         //       },
         //       Engine: "mysql",
         //       EngineVersion: "5.7.26",
         //       MasterUsername: "root",
         //       MasterUserPassword: "root_password"
         //    },
         //    DeletionPolicy: "Snapshot"
         // }
      } 
   }
}

exports.default = template;