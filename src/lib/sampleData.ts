export interface SampleDataset {
  label: string;
  description: string;
  json: object;
}

export const sampleDatasets: SampleDataset[] = [
  {
    label: "HTTP Request Log",
    description: "Web server access log entry",
    json: {
      timestamp: "2026-05-30T07:12:33.441Z",
      method: "POST",
      path: "/api/v2/events",
      status: 201,
      duration_ms: 142,
      client_ip: "10.0.12.55",
      user_agent: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36",
      request_id: "req_8f3a2b1c",
      content_length: 2048,
      response_size: 512,
      headers: {
        "x-forwarded-for": "203.0.113.42",
        "x-request-id": "req_8f3a2b1c",
        authorization: "Bearer ***"
      },
      geo: {
        country: "US",
        region: "us-west-2",
        city: "Portland"
      }
    }
  },
  {
    label: "Security Alert",
    description: "IDS/SIEM security event",
    json: {
      alert_id: "ALT-2026-0530-7842",
      severity: "high",
      category: "intrusion_attempt",
      timestamp: "2026-05-30T06:58:12Z",
      source_ip: "185.220.101.34",
      destination_ip: "10.0.4.22",
      destination_port: 443,
      protocol: "TCP",
      rule_id: "ET-2024-8831",
      rule_name: "Potential SQL Injection via URI",
      payload_sample: "GET /search?q=1' OR '1'='1",
      action_taken: "blocked",
      sensor: "ids-node-03.prod",
      mitre_attack: {
        tactic: "Initial Access",
        technique: "T1190",
        subtechnique: "Exploit Public-Facing Application"
      },
      context: {
        session_id: "sess_f9c12de4",
        previous_alerts: 3,
        risk_score: 87
      }
    }
  },
  {
    label: "Kubernetes Event",
    description: "K8s pod lifecycle event",
    json: {
      apiVersion: "v1",
      kind: "Event",
      metadata: {
        name: "web-frontend-6d4b8c-crash.17a3f2b",
        namespace: "production",
        uid: "e4f8a1b2-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
        creationTimestamp: "2026-05-30T07:01:44Z"
      },
      reason: "BackOff",
      message: "Back-off restarting failed container web-frontend in pod web-frontend-6d4b8c",
      type: "Warning",
      count: 5,
      firstTimestamp: "2026-05-30T06:45:12Z",
      lastTimestamp: "2026-05-30T07:01:44Z",
      involvedObject: {
        kind: "Pod",
        name: "web-frontend-6d4b8c",
        namespace: "production",
        uid: "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
      },
      source: {
        component: "kubelet",
        host: "node-pool-3-vm-12"
      }
    }
  },
  {
    label: "Cloud Audit Event",
    description: "AWS CloudTrail audit log",
    json: {
      eventVersion: "1.09",
      eventSource: "s3.amazonaws.com",
      eventName: "PutObject",
      eventTime: "2026-05-30T06:30:00Z",
      awsRegion: "us-east-1",
      sourceIPAddress: "72.21.198.66",
      userAgent: "aws-cli/2.15.0 Python/3.11.6",
      userIdentity: {
        type: "AssumedRole",
        arn: "arn:aws:sts::123456789012:assumed-role/DataEngineer/alice",
        accountId: "123456789012",
        principalId: "AROA3XFRBF23XYZABC123:alice",
        sessionContext: {
          sessionIssuer: {
            type: "Role",
            arn: "arn:aws:iam::123456789012:role/DataEngineer"
          },
          attributes: {
            mfaAuthenticated: "true",
            creationDate: "2026-05-30T06:00:00Z"
          }
        }
      },
      requestParameters: {
        bucketName: "prod-data-lake",
        key: "raw/events/2026/05/30/batch_001.parquet",
        contentLength: 15728640
      },
      responseElements: {
        "x-amz-request-id": "ABIA5AU2CNZL3EXAMPLE",
        "x-amz-id-2": "vlR7PnpV2Ce81l0PRw6jlUpck7aVTkTZ..."
      }
    }
  }
];
