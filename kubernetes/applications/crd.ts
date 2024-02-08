import { Chart, ChartProps, Include } from "cdk8s";
import { Construct } from "constructs";

export class PrometheusCRDChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new Include(this, 'prometheus_crd', {
      url: 'https://github.com/prometheus-operator/prometheus-operator/releases/download/v0.70.0/bundle.yaml',
    });  
  }
}