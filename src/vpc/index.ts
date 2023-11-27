import { DataAwsAvailabilityZones } from '@cdktf/provider-aws/lib/data-aws-availability-zones';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { VpcConstruct } from 'trn-components/lib/aws/vpc';
import { PRIVATE_SUBNETS, PUBLIC_SUBNETS } from './constant';
import { config } from '../../config';

export class Vpc extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, 'aws', {
      region: config.REGION,
    });

    const allAvailabilityZones = new DataAwsAvailabilityZones(
      this,
      'all-availability-zones',
      {
        state: 'available',
      },
    ).names;

    new VpcConstruct(this, 'vpc', {
      name: 'kubernetes-vpc',
      cidr: config.VPC_CIDR,
      azs: allAvailabilityZones,
      publicSubnets: PUBLIC_SUBNETS,
      privateSubnets: PRIVATE_SUBNETS,
      tags: {
        ['kubernetes.io/cluster/kubernetes']: 'shared',
      },
      publicSubnetTags: {
        ['kubernetes.io/cluster/kubernetes']: 'shared',
        'kubernetes.io/role/elb': '1',
      },
      privateSubnetTags: {
        ['kubernetes.io/cluster/kubernetes']: 'shared',
        'kubernetes.io/role/internal-elb': '1',
      },
    });
  }
}