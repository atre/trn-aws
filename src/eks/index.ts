import { DataAwsSubnets } from '@cdktf/provider-aws/lib/data-aws-subnets';
import { DataAwsVpc } from '@cdktf/provider-aws/lib/data-aws-vpc';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { EksConstruct } from 'trn-components/lib/aws/eks';
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

    const privateSubnetsData = new DataAwsSubnets(this, 'subnetsData', {
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

    new EksConstruct(this, 'eks', {
      vpcId: vpcData.id,
      subnetIds: privateSubnetsData.ids,
      cidrBlocks: [config.VPC_CIDR],
      tags: opts.tags,
    } );
  }
}