import { Chart } from "cdk8s";
import { Construct } from "constructs";
import { ArgoCD } from "../lib/argocd";

export class ArgoCDChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new ArgoCD(this, 'argocd');
  }
}