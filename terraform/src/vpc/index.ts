import { DataAwsAvailabilityZones } from '@cdktf/provider-aws/lib/data-aws-availability-zones';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { VpcConstruct } from 'trn-components';
import { PRIVATE_SUBNETS, PUBLIC_SUBNETS } from './constant';
import { config } from '../../config';
import { VpcStackProps } from './interface';

export class Vpc extends TerraformStack {
  public readonly vpcInstance: VpcConstruct;

  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id);

    const { clusterName } = props;

    new AwsProvider(this, 'aws', {
      region: config.REGION,
    });

    new S3Backend(this, {
      bucket: config.REMOTE_BACKEND_NAME,
      key: 'dev/stacks/vpc/terraform.tfstate',
      region: config.REGION,
      dynamodbTable: config.REMOTE_BACKEND_LOCK_NAME,
    });

    const allAvailabilityZones = new DataAwsAvailabilityZones(
      this,
      'all-availability-zones',
      {
        state: 'available',
      },
    ).names;

    this.vpcInstance = new VpcConstruct(this, 'vpc-construct', {
      name: 'kubernetes-vpc',
      cidr: config.VPC_CIDR,
      azs: allAvailabilityZones,
      publicSubnets: PUBLIC_SUBNETS,
      privateSubnets: PRIVATE_SUBNETS,
      tags: {
        [`kubernetes.io/cluster/${clusterName}`]: 'shared',
      },
      publicSubnetTags: {
        [`kubernetes.io/cluster/${clusterName}`]: 'shared',
        'kubernetes.io/role/elb': '1',
      },
      privateSubnetTags: {
        [`kubernetes.io/cluster/${clusterName}`]: 'shared',
        'kubernetes.io/role/internal-elb': '1',
      },
    });
  }
}