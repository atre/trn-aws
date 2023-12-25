import { DataAwsEksCluster } from '@cdktf/provider-aws/lib/data-aws-eks-cluster';
import { DataAwsSubnets } from '@cdktf/provider-aws/lib/data-aws-subnets';
import { DataAwsVpc } from '@cdktf/provider-aws/lib/data-aws-vpc';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { EksNodeGroupConstruct } from 'trn-components';
import { INodeGroupStackConfig } from './interface';
import { config } from '../../config';

export class NodeGroupStack extends TerraformStack {
  constructor(scope: Construct, id: string, opts: INodeGroupStackConfig ) {
    super(scope, id);

    const { name, clusterName } = opts;

    new AwsProvider(this, 'aws', {
      region: config.REGION,
    });

    new S3Backend(this, {
      bucket: config.REMOTE_BACKEND_NAME,
      key: 'dev/stacks/eks/node-group/terraform.tfstate',
      region: config.REGION,
      dynamodbTable: config.REMOTE_BACKEND_LOCK_NAME,
    });

    const cluster = new DataAwsEksCluster(this, 'eks-cluster', {
      name: clusterName,
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

    new EksNodeGroupConstruct(this, 'eks-node-group', {
      name,
      clusterName: cluster.name,
      privateSubnetIds: privateSubnetsData.ids,
    });
  }
}