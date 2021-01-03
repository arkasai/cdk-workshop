import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export interface HitCounterProps {
    /** the function for which we want to count url hits **/
    downstream: lambda.IFunction;
}

export class HitCounter extends cdk.Construct {
    public readonly handler: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: {
                name: 'path',
                type: dynamodb.AttributeType.STRING
            }
        })

        this.handler = new lambda.Function(this, 'HitCounterHandler', {
            code: lambda.Code.fromAsset('lambda'),
            handler: 'hitcounter.handler',
            runtime: lambda.Runtime.NODEJS_12_X,
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        })

        table.grantReadWriteData(this.handler);
    }
}
