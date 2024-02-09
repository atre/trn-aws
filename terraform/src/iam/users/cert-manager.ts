import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { Fn, TerraformOutput, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { config } from "../../../config";
import { DataAwsRoute53Zone } from "@cdktf/provider-aws/lib/data-aws-route53-zone";
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { DataAwsEksCluster } from "@cdktf/provider-aws/lib/data-aws-eks-cluster";
import { IamPolicyAttachment } from "@cdktf/provider-aws/lib/iam-policy-attachment";

export class CertManagerIAMUserStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: { hostedZoneName: string, clusterName: string}) {
    super(scope, id);

    new AwsProvider(this, 'Aws', {
      region: config.REGION,
    });

    const eksCluster = new DataAwsEksCluster(this, 'eks-cluster', {
      name: props.clusterName,
    });

    const hostedZone = new DataAwsRoute53Zone(this, 'route53-hosted-zone', {
      name: props.hostedZoneName
    })

    const certManagerPolicy = new IamPolicy(this, 'cert-manager-policy', {
      name: 'CertManagerPolicy',
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 'route53:GetChange',
            Resource: 'arn:aws:route53:::change/*',
          },
          {
            Effect: 'Allow',
            Action: [
              'route53:ChangeResourceRecordSets',
              'route53:ListResourceRecordSets',
            ],
            Resource: `arn:aws:route53:::hostedzone/${hostedZone.id}`,
          },
          {
            Effect: 'Allow',
            Action: 'route53:ListHostedZonesByName',
            Resource: '*',
          },
        ],
      }),
    });

    const oidcIssuer = this.parseOIDC(eksCluster.identity.get(0).oidc.get(0).issuer);

    new TerraformOutput(this, 'oidc', {
      value: oidcIssuer
    });

    const certManagerRole = new IamRole(this, 'cert-manager-role', {
      name: "CertManagerIAMRole",
      assumeRolePolicy: new DataAwsIamPolicyDocument(this, 'assume-role-policy', {
        statement: [{
          actions: ["sts:AssumeRoleWithWebIdentity"],
          principals: [{
            type: "Federated",
            identifiers: [oidcIssuer],
          }],
          condition: [{
            test: "StringEquals",
            variable: `${oidcIssuer}:sub`,
            values: ["system:serviceaccount:cert-manager:cert-manager"],
          }],
        }],
      }).json,
    });

    new IamPolicyAttachment(this, 'cert-manager-policy-attachment', {
      name: 'CertManagerPolicy',
      policyArn: certManagerPolicy.arn,
      roles: [certManagerRole.name],
    });
  }

  private parseOIDC(issuerUrl: string) {
    const oidcParts = Fn.split('/id/', issuerUrl);
    const regionAndId = Fn.split('.eks.', Fn.element(oidcParts, 0));
    const region = Fn.element(regionAndId, 1);
    const oidcId = Fn.element(oidcParts, 1);

    // Dynamically construct the OIDC provider ARN
    const oidcProviderArn = Fn.format(
      'arn:aws:iam::894208094359:oidc-provider/oidc.eks.%s.amazonaws.com/id/%s',
      [region, oidcId],
    );
    return oidcProviderArn;
  }
}
