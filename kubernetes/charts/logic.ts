import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { Logic } from "../lib/microservices/logic";

export class LogicChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new Logic(this, 'logic');
  }
}