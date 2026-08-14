export const portfolioProjects = [
    // FINANCE: Algorithmic Risk Modeling
    {
        id: 'finance-risk-modeling',
        title: 'Algorithmic Risk Analytics Platform',
        client: 'FinTech Demo',
        categories: ['Data & Analytics', 'AI & Engineering', 'Finance'],
        tags: ['Microsoft Fabric', 'Databricks', 'PySpark', 'Power BI'],
        industry: 'Finance',
        image: '/portfolio/finance-dashboard.png',
        description: 'End-to-end risk modeling platform processing 1M+ transactions daily for real-time fraud detection and liquidity forecasting.',
        challenge: 'Financial institutions require sub-second risk assessment on high-velocity transaction streams. Legacy batch processing systems introduced dangerous latency in fraud detection.',
        solution: 'Architected a lakehouse solution on Microsoft Fabric using Databricks for real-time stream processing. Implemented Delta Lake for ACID transactions and Power BI for executive risk dashboards.',
        results: [
            'Sub-second fraud detection latency',
            'Unified batch and streaming architecture',
            '30% reduction in compute costs via autoscaling',
            'Regulatory compliance automated reporting'
        ],
        technologies: ['Microsoft Fabric', 'Azure Databricks', 'Delta Lake', 'PySpark', 'Power BI'],
        duration: '4 months',
        year: '2025',
        architecture: {
            summary: 'Lambda Architecture implemented on Microsoft Fabric using OneLake as the central storage layer.',
            diagram: '/portfolio/arch/finance-arch.png',
            components: [
                { name: 'Ingestion Layer', desc: 'Event Hubs capturing 50k events/sec from transactional systems.' },
                { name: 'Stream Processing', desc: 'Spark Structured Streaming jobs in Fabric for real-time fraud scoring.' },
                { name: 'Serving Layer', desc: 'Power BI Direct Lake mode for sub-second dashboard updates.' }
            ]
        },
        implementation: {
            files: [
                { name: 'fraud_detection.py', lang: 'python', code: `from pyspark.sql.functions import *\n\n# Read from Event Hub\ndf = spark.readStream.format("eventhubs").options(**ehConf).load()\n\n# Apply ML Model\npredictions = model.transform(df)\n\n# Write to Delta Table\npredictions.writeStream.format("delta").outputMode("append").table("fraud_alerts")` },
                { name: 'infrastructure.tf', lang: 'hcl', code: `resource "azurerm_fabric_capacity" "main" {\n  name                = "fintech-fabric"\n  resource_group_name = azurerm_resource_group.rg.name\n  sku_name            = "F64"\n  admin_members       = ["admin@cloudbaud.com"]\n}` }
            ]
        }
    },

    // HEALTHCARE: HIPAA-Compliant Data Lake
    {
        id: 'healthcare-data-lake',
        title: 'Secure HIPAA-Compliant Data Lake',
        client: 'HealthCare Demo',
        categories: ['Cloud Platform', 'Security & Compliance', 'Data & Analytics', 'Healthcare'],
        tags: ['Azure', 'Terraform', 'Security', 'Compliance'],
        industry: 'Healthcare',
        image: '/portfolio/healthcare-architecture.png',
        description: 'Zero-trust cloud infrastructure for securing sensitive patient health information (PHI) at scale.',
        challenge: 'Healthcare providers struggle to innovate with data due to strict HIPAA compliance requirements. Manual infrastructure provisioning was error-prone and unscalable.',
        solution: 'Deployed a fully automated Azure landing zone using Terraform. Implemented strict network isolation, encryption in transit/rest, and automated compliance auditing policies.',
        results: [
            '100% Infrastructure-as-Code (Terraform)',
            'Automated HIPAA compliance validation',
            'Zero-trust network architecture',
            'Secure research enclaves for data scientists'
        ],
        technologies: ['Azure', 'Terraform', 'Azure Policy', 'Key Vault', 'Sentinel'],
        duration: '3 months',
        year: '2024',
        architecture: {
            summary: 'Hub-and-Spoke network topology with Azure Firewall and private endpoints for all PaaS services.',
            diagram: '/portfolio/arch/healthcare-arch.png',
            components: [
                { name: 'Hub VNet', desc: 'Centralized firewall, VPN gateway, and bastion hosts.' },
                { name: 'Spoke VNets', desc: 'Isolated environments for Dev, Test, and Prod with NSG enforcement.' },
                { name: 'Data Landing Zone', desc: 'Storage Accounts with private endpoints and CMK encryption.' }
            ]
        },
        implementation: {
            files: [
                { name: 'policy_definitions.tf', lang: 'hcl', code: `resource "azurerm_policy_definition" "hipaa_audit" {\n  name         = "audit-hipaa-compliance"\n  policy_type  = "Custom"\n  mode         = "All"\n  display_name = "Audit HIPAA Compliance"\n\n  metadata = <<METADATA\n    {\n      "category": "Regulatory Compliance"\n    }\n  METADATA\n}` },
                { name: 'network.tf', lang: 'hcl', code: `module "hub_network" {\n  source              = "./modules/hub"\n  resource_group_name = var.rg_name\n  location            = var.location\n  vnet_address_space  = ["10.0.0.0/16"]\n}` }
            ]
        }
    },

    // SUPPLY CHAIN: IoT Real-time Tracking
    {
        id: 'supply-chain-iot',
        title: 'Global Supply Chain Control Tower',
        client: 'Logistics Demo',
        categories: ['App Innovation', 'Data & Analytics', 'Supply Chain'],
        tags: ['IoT Hub', 'Stream Analytics', 'Cosmos DB', 'React'],
        industry: 'Supply Chain',
        image: '/portfolio/supply-chain-map.png',
        description: 'Real-time visibility platform tracking shipment telemetry (location, temp, shock) across global logistics networks.',
        challenge: 'Global logistics firms lack visibility into shipment conditions in transit, leading to spoilage and lost inventory. Legacy EDI systems provided only milestone updates.',
        solution: 'Built an IoT ingestion pipeline using Azure IoT Hub and Stream Analytics. Data is visualized in a real-time React dashboard backed by Cosmos DB for low-latency geo-spatial queries.',
        results: [
            'Real-time telemetry for 50k+ active shipments',
            'Predictive delay alerts via ML',
            'Reduced spoilage by 15% via temp monitoring',
            'Global comprehensive visibility'
        ],
        technologies: ['Azure IoT Hub', 'Stream Analytics', 'Cosmos DB', 'React', 'Azure Maps'],
        duration: '5 months',
        year: '2024',
        architecture: {
            summary: 'Event-driven IoT architecture leveraging Azure Digital Twins for shipment modeling.',
            diagram: '/portfolio/arch/supply-chain-arch.png',
            components: [
                { name: 'IoT Hub', desc: 'Bi-directional communication with edge devices on shipping containers.' },
                { name: 'Stream Analytics', desc: 'Geo-fencing logic to detect route deviations in real-time.' },
                { name: 'Cosmos DB', desc: 'Multi-master write capability for global logistics synchronization.' }
            ]
        },
        implementation: {
            files: [
                { name: 'telemetry_processor.sql', lang: 'sql', code: `SELECT\n    DeviceId,\n    Temperature,\n    Location,\n    System.Timestamp AS EventTime\nINTO\n    [CosmosDBOutput]\nFROM\n    [IoTHubInput]\nWHERE\n    Temperature > 25 OR Temperature < 2` },
                { name: 'MapComponent.jsx', lang: 'javascript', code: `import { AzureMapsProvider, IMapProps } from 'react-azure-maps';\n\nconst ShipmentMap = ({ shipments }) => (\n    <AzureMapsProvider>\n        <MapController center={shipments[0].coordinates} zoom={10}>\n            {shipments.map(s => <Pin data={s} />)}\n        </MapController>\n    </AzureMapsProvider>\n);` }
            ]
        }
    },

    // PUBLIC SECTOR: Transparency Portal
    {
        id: 'public-sector-transparency',
        title: 'State Budget Transparency Portal',
        client: 'GovTech Demo',
        categories: ['Data & Analytics', 'App Innovation', 'Public Sector'],
        tags: ['Power BI', 'Fabric', 'Open Data', 'Accessibility'],
        industry: 'Public Sector',
        image: '/portfolio/gov-portal.png',
        description: 'Citizen-facing open data portal visualizing state budget allocation, expenditure, and performance metrics.',
        challenge: 'Government agencies needed to build trust with citizens by making budget data accessible and understandable, moving away from opaque PDF reports.',
        solution: 'Developed a high-concurrency public dashboard using Power BI Embedded backed by Microsoft Fabric OneLake. Designed with strict WCAG 2.1 accessibility standards.',
        results: [
            'WCAG 2.1 AA Compliant',
            'Supports 100k+ concurrent citizen viewers',
            'Automated data refresh from ERP systems',
            'Interactive drill-down capabilities'
        ],
        technologies: ['Microsoft Fabric', 'Power BI Embedded', 'React', 'Azure CDN'],
        duration: '3 months',
        year: '2025',
        architecture: {
            summary: 'High-availability public dashboard system using React front-end and Power BI Embedded back-end.',
            diagram: '/portfolio/arch/gov-arch.png',
            components: [
                { name: 'Azure CDN', desc: 'Accelerates static asset delivery to citizens statewide.' },
                { name: 'App Gateway', desc: 'Secure load balancing with WAF protection against DDoS.' },
                { name: 'Power BI Capacity', desc: 'Dedicated capacity (P1) for handling 100k concurrent render requests.' }
            ]
        },
        implementation: {
            files: [
                { name: 'EmbedReport.jsx', lang: 'javascript', code: `import { PowerBIEmbed } from 'powerbi-client-react';\n\n<PowerBIEmbed\n    embedConfig={{\n        type: 'report',\n        id: reportId,\n        embedUrl: embedUrl,\n        accessToken: token\n    }}\n    cssClassName="h-[600px] w-full"\n/>` },
                { name: 'accessibility_check.js', lang: 'javascript', code: `// Automated AXE Core checks\naxe.run(document, (err, results) => {\n  if (results.violations.length) throw new Error("Accessibility violation detected");\n});` }
            ]
        }
    },

    // EDUCATION: Scalable LMS Infrastructure
    {
        id: 'education-lms-scale',
        title: 'Hyper-Scale LMS Infrastructure',
        client: 'EdTech Demo',
        categories: ['Cloud Platform', 'DevOps & Automation', 'Education'],
        tags: ['Kubernetes', 'AKS', 'Redis', 'Microservices'],
        industry: 'Education',
        image: '/portfolio/edtech-infra.png',
        description: 'Cloud-native infrastructure supporting millions of concurrent students for online learning platforms.',
        challenge: 'An EdTech platform faced crashing during exam periods due to inability to handle massive concurrent user spikes.',
        solution: 'Re-architected the monolithic application into microservices running on Azure Kubernetes Service (AKS). Implemented KEDA for event-driven autoscaling based on HTTP traffic.',
        results: [
            'Auto-scales from 10 to 1,000 pods in minutes',
            '99.99% uptime during peak exam windows',
            '50% cost reduction during off-peak hours',
            'Global content delivery acceleration'
        ],
        technologies: ['Azure Kubernetes Service', 'KEDA', 'Redis', 'Terraform', 'Helm'],
        duration: '6 months',
        year: '2024',
        architecture: {
            summary: 'Kubernetes-based microservices architecture with event-driven autoscaling (KEDA).',
            diagram: '/portfolio/arch/edtech-arch.png',
            components: [
                { name: 'AKS Cluster', desc: 'Node pools separated by workload type (General vs Compute Optimized).' },
                { name: 'KEDA Scaler', desc: 'Scales based on HTTP request rate and Service Bus queue dept.' },
                { name: 'Redis Cache', desc: 'Session state offloading for stateless 12-factor apps.' }
            ]
        },
        implementation: {
            files: [
                { name: 'scaledobject.yaml', lang: 'yaml', code: `apiVersion: keda.sh/v1alpha1\nkind: ScaledObject\nmetadata:\n  name: lms-api-scaler\nspec:\n  scaleTargetRef:\n    name: lms-api\n  triggers:\n  - type: prometheus\n    metadata:\n      serverAddress: http://prometheus-server\n      metricName: http_requests_total\n      threshold: '100'` },
                { name: 'helm_values.yaml', lang: 'yaml', code: `replicaCount: 2\nautoscaling:\n  enabled: true\n  minReplicas: 2\n  maxReplicas: 50\nresources:\n  requests:\n    cpu: 200m\n    memory: 256Mi` }
            ]
        }
    },

    // E-COMMERCE: Personalization Engine
    {
        id: 'ecommerce-personalization',
        title: 'Real-time Personalization Engine',
        client: 'Retail Demo',
        categories: ['AI & Engineering', 'Data & Analytics', 'E-commerce'],
        tags: ['Databricks', 'MLflow', 'Redis', 'API'],
        industry: 'E-commerce',
        image: '/portfolio/retail-rec.png',
        description: 'Machine learning API delivering sub-50ms personalized product recommendations based on user behavior.',
        challenge: 'E-commerce retailer needed to increase conversion rates by showing relevant products to users in real-time, replacing static rules-based recommendations.',
        solution: 'Built a recommendation engine using PySpark on Databricks. Models are trained nightly and served via a high-performance API using Redis for feature caching.',
        results: [
            '25% increase in conversion rate',
            'Sub-50ms API response time',
            'A/B testing framework for model evaluation',
            'Scalable to millions of users'
        ],
        technologies: ['Databricks', 'MLflow', 'Python', 'Redis', 'FastAPI'],
        duration: '4 months',
        year: '2025',
        architecture: {
            summary: 'Hybrid Batch/Real-time Recommendation System using Databricks and FastAPI.',
            diagram: '/portfolio/arch/retail-arch.png',
            components: [
                { name: 'Training Pipeline', desc: 'Databricks Jobs retraining Collaborative Filtering models nightly.' },
                { name: 'Inference API', desc: 'FastAPI service on Azure Container Apps with Redis feature store.' },
                { name: 'MLflow Registry', desc: 'Model versioning and stage promotion (Staging -> Prod).' }
            ]
        },
        implementation: {
            files: [
                { name: 'recommend_api.py', lang: 'python', code: `from fastapi import FastAPI\nimport redis\n\napp = FastAPI()\nr = redis.Redis(host='cache', port=6379)\n\n@app.get("/recommend/{user_id}")\ndef get_recommendations(user_id: str):\n    # Fetch pre-computed recs from Redis (sub-5ms)\n    cached = r.get(f"rec:{user_id}")\n    if cached: return json.loads(cached)\n    \n    # Fallback to model inference\n    return model.predict(user_id)` },
                { name: 'train_model.py', lang: 'python', code: `with mlflow.start_run():\n    als = ALS(userCol="user", itemCol="item", ratingCol="rating")\n    model = als.fit(training_df)\n    mlflow.spark.log_model(model, "als-model")` }
            ]
        }
    }
];

export const categories = [
    'All Projects',
    'Data & Analytics',
    'AI & Engineering',
    'Cloud Platform',
    'Security & Compliance',
    'App Innovation',
    'DevOps & Automation'
];

export const industries = [
    'Finance',
    'Healthcare',
    'Supply Chain',
    'Public Sector',
    'Education',
    'E-commerce'
];
