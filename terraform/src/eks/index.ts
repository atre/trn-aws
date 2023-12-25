import { DataAwsSubnets } from '@cdktf/provider-aws/lib/data-aws-subnets';
import { DataAwsVpc } from '@cdktf/provider-aws/lib/data-aws-vpc';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { SecurityGroup } from '@cdktf/provider-aws/lib/security-group';
import { SecurityGroupRule } from '@cdktf/provider-aws/lib/security-group-rule';
import { VpcEndpoint } from '@cdktf/provider-aws/lib/vpc-endpoint';
import { Fn, S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { EksConstruct } from 'trn-components';
import { EksStackConfig } from './interface';
import { config } from '../../config';

export class Eks extends TerraformStack {
  constructor(scope: Construct, id: string, opts: EksStackConfig ) {
    super(scope, id);

    new AwsProvider(this, 'aws', {
      region: config.REGION,
    });

    new S3Backend(this, {
      bucket: config.REMOTE_BACKEND_NAME,
      key: 'dev/stacks/eks/terraform.tfstate',
      region: config.REGION,
      dynamodbTable: config.REMOTE_BACKEND_LOCK_NAME,
    });

    const vpcData = new DataAwsVpc(this, 'vpcData', {
      filter: [
        {
          name: 'tag:Name',
          values: ['kubernetes-vpc'],
        },
      ],
    });

    const publicSubnetsData = new DataAwsSubnets(this, 'publicDubnetsData', {
      filter: [
        {
          name: 'vpc-id',
          values: [vpcData.id],
        },
        {
          name: 'tag:kubernetes.io/role/elb',
          values: ['1'],
        },
      ],
    });

    const privateSubnetsData = new DataAwsSubnets(this, 'privateSubnetsData', {
      filter: [
        {
          name: 'vpc-id',
          values: [vpcData.id],
        },
        {
          name: 'tag:kubernetes.io/role/internal-elb',
          values: ['1'],
        },
      ],
    });

    const clusterSG = new SecurityGroup(this, 'eks-cluster-sg', {
      vpcId: vpcData.id,
      lifecycle: {
        createBeforeDestroy: true,
      },
      description: 'Cluster security group',
      tags: {
        Name: `${opts.name}-cluster-sg`,
        ...opts.tags,
      },
    });

    new SecurityGroupRule(this, 'eks-cluster-sg-rule-ingress', {
      securityGroupId: clusterSG.id,
      description: 'Node groups to cluster API',
      fromPort: 443,
      toPort: 443,
      protocol: 'tcp',
      type: 'ingress',
      cidrBlocks: [config.VPC_CIDR],
    });

    new SecurityGroupRule(this, 'eks-cluster-sg-rule-ingress2', {
      securityGroupId: clusterSG.id,
      description: 'Node groups to cluster API',
      fromPort: 80,
      toPort: 80,
      protocol: 'tcp',
      type: 'ingress',
      cidrBlocks: [config.VPC_CIDR],
    });

    // todo specify sg
    new SecurityGroupRule(this, 'eks-cluster-sg-ssh-rule-ingress', {
      securityGroupId: clusterSG.id,
      description: 'ssh connect to cluster API',
      fromPort: 0,
      toPort: 0,
      protocol: '-1',
      type: 'ingress',
      cidrBlocks: ['0.0.0.0/0'],
    });

    new SecurityGroupRule(this, 'eks-cluster-sg-ssh-rule-egress', {
      securityGroupId: clusterSG.id,
      description: 'ssh connect to cluster API',
      fromPort: 0,
      toPort: 0,
      protocol: '-1',
      type: 'egress',
      cidrBlocks: ['0.0.0.0/0'],
    });

    new VpcEndpoint(this, 'eks-vpc-endpoint', {
      vpcId: vpcData.id,
      serviceName: `com.amazonaws.${config.REGION}.eks`,
      subnetIds: Fn.flatten(privateSubnetsData.ids),
      vpcEndpointType: 'Interface',
      privateDnsEnabled: true,

      securityGroupIds: [clusterSG.id],
    });

    new EksConstruct(this, 'eks', {
      name: opts.name,
      vpcId: vpcData.id,
      subnetIds: Fn.flatten([privateSubnetsData.ids, publicSubnetsData.ids]),
      cidrBlocks: [config.VPC_CIDR],
      securityGroupIds: [clusterSG.id],
      tags: opts.tags,
    });
  }
}