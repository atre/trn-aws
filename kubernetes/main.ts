import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { Management } from './lib/management';
import { PostgresDatabase } from './lib/postgres';

export class TRNApp extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new PostgresDatabase(this, 'postgres-db');
    new Management(this, 'management');
  }
}

const app = new App();
new TRNApp(app, 'trn-cdk8s');
app.synth();
