import { Chart } from "cdk8s";
import { Construct } from "constructs";
import { Cert } from "../lib/cert";

export class CertificateChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Cert(this, 'certificate');
  }
}