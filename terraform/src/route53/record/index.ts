import { Construct } from 'constructs';
import { TerraformStack, S3Backend } from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { config } from '../../../config';
import { DataAwsRoute53Zone } from '@cdktf/provider-aws/lib/data-aws-route53-zone';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';
import { IRoute53RecordProps } from './interface';
import { DataAwsLb } from '@cdktf/provider-aws/lib/data-aws-lb';

export class Route53RecordStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: IRoute53RecordProps ) {
    super(scope, id);

    const { clusterName, hostedZoneName } = props;

    new AwsProvider(this, 'Aws', {
      region: config.REGION,
    });

    new S3Backend(this, {
      bucket: config.REMOTE_BACKEND_NAME,
      key: `dev/stacks/route53/${id}/terraform.tfstate`,
      region: config.REGION,
      dynamodbTable: config.REMOTE_BACKEND_LOCK_NAME,
    });

    const hostedZone = new DataAwsRoute53Zone(this, 'route53-hosted-zone', {
      name: hostedZoneName,
    });

    const loadBalancer = new DataAwsLb(this, 'load-balancer', {
      tags: {
       [`kubernetes.io/cluster/${clusterName}`]: 'owned'
      }
    });

    new Route53Record(this, 'route53-record', {
      zoneId: hostedZone.zoneId,
      name: hostedZone.name,
      type: 'A',
      alias: {
        name: loadBalancer.dnsName,
        zoneId: loadBalancer.zoneId,
        evaluateTargetHealth: true,
      }
    });
  }
}
