const template = (args) => {
   return{
      Resources: {
         VPC: {
            Type: "AWS::EC2::VPC",
            Properties: {
               CidrBlock: "172.30.0.0/16",
               EnableDnsHostnames: true,
               EnableDnsSupport: true,
               InstanceTenancy: "default",
               Tags: [
                  {
                     Key: "Name",
                     Value: "${self:provider.stackTags.name}"
                  }
               ]
            }
         },
         SubnetGroup: {
            Type: "AWS::RDS::DBSubnetGroup",
            Properties: {
               DBSubnetGroupDescription: "${self:provider.stackTags.name}",
               DBSubnetGroupName: "${self:provider.stackTags.name}",
               SubnetIds: [
                  {
                     Ref: "SubnetA"
                  },
                  {
                     Ref: "SubnetB"
                  },
                  {
                     Ref: "SubnetC"
                  }
               ],
               Tags: [
                  {
                     Key: "Name",
                     Value: "${self:provider.stackTags.name}"
                  }
               ]
            }
         },
         SubnetA: {
            Type: "AWS::EC2::Subnet",
            Properties: {
               AvailabilityZone: "${self:provider.region}a",
               CidrBlock: "172.30.0.0/24",
               VpcId: {
                  Ref: "VPC"
               },
               Tags: [
                  {
                     Key: "Name",
                     Value: "${self:provider.stackTags.name}"
                  }
               ]
            }
         },
         SubnetB: {
            Type: "AWS::EC2::Subnet",
            Properties: {
               AvailabilityZone: "${self:provider.region}b",
               CidrBlock: "172.30.1.0/24",
               VpcId: {
                  Ref: "VPC"
               },
               Tags: [
                  {
                     Key: "Name",
                     Value: "${self:provider.stackTags.name}"
                  }
               ]
            }
         },
         SubnetC: {
            Type: "AWS::EC2::Subnet",
            Properties: {
               AvailabilityZone: "${self:provider.region}c",
               CidrBlock: "172.30.2.0/24",
               VpcId: {
                  Ref: "VPC"
               },
               Tags: [
                  {
                     Key: "Name",
                     Value: "${self:provider.stackTags.name}"
                  }
               ]
            }
         },
         InternetGateway: {
            Type: "AWS::EC2::InternetGateway",
            Properties: {
               Tags: [
                  {
                     Key: "Name",
                     Value: "${self:provider.stackTags.name}"
                  }
               ]
            }
         },
         VPCGatewayAttachment: {
            Type: "AWS::EC2::VPCGatewayAttachment",
            Properties: {
               InternetGatewayId: {
                  Ref: "InternetGateway"
               },
               VpcId: {
                  Ref: "VPC"
               }
            }
         },
         EIPA: {
            Type: "AWS::EC2::EIP",
            DependsOn: "VPCGatewayAttachment",
            Properties: {
               Domain: "vpc"
            }
         },
         EIPB: {
            Type: "AWS::EC2::EIP",
            DependsOn: "VPCGatewayAttachment",
            Properties: {
               Domain: "vpc"
            }
         },
         EIPC: {
            Type: "AWS::EC2::EIP",
            DependsOn: "VPCGatewayAttachment",
            Properties: {
               Domain: "vpc"
            }
         },
         NatGatewayA: {
            Type: "AWS::EC2::NatGateway",
            Properties: {
               AllocationId: null,
               SubnetId: {
                  Ref: "SubnetA"
               }
            }
         },
         NatGatewayB: {
            Type: "AWS::EC2::NatGateway",
            Properties: {
               AllocationId: null,
               SubnetId: {
                  Ref: "SubnetB"
               }
            }
         },
         NatGatewayC: {
            Type: "AWS::EC2::NatGateway",
            Properties: {
               AllocationId: null,
               SubnetId: {
                  Ref: "SubnetC"
               }
            }
         },
         RouteTable: {
            Type: "AWS::EC2::RouteTable",
            Properties: {
               VpcId: {
                  Ref: "VPC"
               },
               Tags: [
                  {
                     Key: "Name",
                     Value: "${self:provider.stackTags.name}"
                  }
               ]
            }
         },
         Route: {
            Type: "AWS::EC2::Route",
            DependsOn: "VPCGatewayAttachment",
            Properties: {
               RouteTableId: {
                  Ref: "RouteTable"
               },
               DestinationCidrBlock: "0.0.0.0/0",
               GatewayId: {
                  Ref: "InternetGateway"
               }
            }
         },
         SubnetARouteTableAssociation: {
            Type: "AWS::EC2::SubnetRouteTableAssociation",
            Properties: {
               RouteTableId: {
                  Ref: "RouteTable"
               },
               SubnetId: {
                  Ref: "SubnetA"
               }
            }
         },
         SubnetBRouteTableAssociation: {
            Type: "AWS::EC2::SubnetRouteTableAssociation",
            Properties: {
               RouteTableId: {
                  Ref: "RouteTable"
               },
               SubnetId: {
                  Ref: "SubnetB"
               }
            }
         },
         SubnetCRouteTableAssociation: {
            Type: "AWS::EC2::SubnetRouteTableAssociation",
            Properties: {
               RouteTableId: {
                  Ref: "RouteTable"
               },
               SubnetId: {
                  Ref: "SubnetC"
               }
            }
         },
         SecurityGroup: {
            Type: "AWS::EC2::SecurityGroup",
            Properties: {
               GroupDescription: "Access to DB",
               VpcId: {
                  Ref: "VPC"
               },
               SecurityGroupIngress: "${self:custom.security_group.database.inbound}",
               Tags: [
                  {
                     Key: "Name",
                     Value: "${self:provider.stackTags.name}-database"
                  }
               ]
            }
         },
         LambdaSecurityGroup: {
            Type: "AWS::EC2::SecurityGroup",
            Properties: {
               GroupDescription: "Access to Lambda",
               VpcId: {
                  Ref: "VPC"
               },
               SecurityGroupIngress: "${self:custom.security_group.lambda.inbound}",
               SecurityGroupEgress: "${self:custom.security_group.lambda.outbound}",
               Tags: [
                  {
                     Key: "Name",
                     Value: "${self:provider.stackTags.name}-lambda"
                  }
               ]
            }
         }
      }
   }
}

exports.default = template;