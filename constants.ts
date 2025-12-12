import { DBusService, MCPAgent, Skill, ExecutionProfile, Plugin } from './types';

// --- Execution Profiles ---
export const EXECUTION_PROFILES: ExecutionProfile[] = [
    {
        id: 'profile-realtime',
        name: 'Real-time Fast',
        description: 'Optimized for low latency and high throughput',
        modelPreferences: ['gemini-2.5-flash'],
        temperature: 0.1,
        timeoutMs: 5000,
        maxRetries: 1,
        icon: '⚡'
    },
    {
        id: 'profile-reasoning',
        name: 'Deep Reasoning',
        description: 'Complex problem solving and code generation',
        modelPreferences: ['claude-3-opus', 'gpt-4-turbo'],
        temperature: 0.2,
        timeoutMs: 60000,
        maxRetries: 2,
        icon: '🧠'
    },
    {
        id: 'profile-creative',
        name: 'Creative Flow',
        description: 'Content generation and brainstorming',
        modelPreferences: ['gpt-4-turbo', 'gemini-2.5-flash'],
        temperature: 0.8,
        timeoutMs: 30000,
        maxRetries: 0,
        icon: '🎨'
    },
    {
        id: 'profile-rust',
        name: 'Rust Pro',
        description: 'Expertise in Rust memory safety, concurrency, and zero-cost abstractions',
        modelPreferences: ['claude-3-opus', 'gemini-2.5-flash'],
        temperature: 0.1,
        timeoutMs: 45000,
        maxRetries: 2,
        icon: '🦀'
    },
    {
        id: 'profile-architect',
        name: 'Backend Architect',
        description: 'Scalable system design, database topology, and cloud patterns',
        modelPreferences: ['gpt-4-turbo', 'claude-3-opus'],
        temperature: 0.4,
        timeoutMs: 60000,
        maxRetries: 1,
        icon: '🏗️'
    }
];

// --- Plugins ---
export const PLUGINS: Plugin[] = [
    { id: 'plugin-core', name: 'Core System', description: 'Essential Linux system management tools', version: '1.0.0', icon: 'server' },
    { id: 'plugin-dev', name: 'Developer Tools', description: 'Code analysis, git, and testing utilities', version: '2.1.0', icon: 'code' },
    { id: 'plugin-data', name: 'Data Science', description: 'Data processing, SQL, and visualization', version: '1.5.0', icon: 'database' },
    { id: 'plugin-ops', name: 'DevOps & Cloud', description: 'Docker, K8s, and Infrastructure as Code', version: '1.2.0', icon: 'cloud' },
    { id: 'plugin-sec', name: 'Security Audit', description: 'Vulnerability scanning and log analysis', version: '1.0.1', icon: 'shield' },
    { id: 'plugin-research', name: 'Research & Web', description: 'Web search and synthesis agents', version: '3.0.0', icon: 'globe' },
    { id: 'plugin-creative', name: 'Creative Studio', description: 'Design and content generation tools', version: '1.0.0', icon: 'palette' },
    { id: 'plugin-biz', name: 'Business Intel', description: 'Finance and market analysis', version: '1.1.0', icon: 'briefcase' },
];

// --- DBus Services (Mock) ---
export const MOCK_SERVICES: DBusService[] = [
  {
    id: '1',
    name: 'org.freedesktop.systemd1',
    status: 'active',
    objects: [
      {
        path: '/org/freedesktop/systemd1',
        interfaces: [
          {
            name: 'org.freedesktop.systemd1.Manager',
            methods: [
              { name: 'GetUnit', args: [{ name: 'name', type: 's', direction: 'in' }, { name: 'unit', type: 'o', direction: 'out' }] },
              { name: 'StartUnit', args: [{ name: 'name', type: 's', direction: 'in' }, { name: 'mode', type: 's', direction: 'in' }, { name: 'job', type: 'o', direction: 'out' }] }
            ],
            properties: [
              { name: 'Version', type: 's', access: 'read' }
            ],
            signals: []
          }
        ]
      }
    ]
  },
  {
      id: '2',
      name: 'org.freedesktop.NetworkManager',
      status: 'active',
      objects: []
  }
];

// --- MCP Agents (Expanded) ---
export const MOCK_AGENTS: MCPAgent[] = [
    // DevOps
    { id: 'agent-docker', name: 'Docker Orchestrator', url: 'http://localhost:8081', status: 'connected', capabilities: ['list_containers', 'build_image', 'inspect_volume'], pluginId: 'plugin-ops', executionProfileId: 'profile-realtime' },
    { id: 'agent-k8s', name: 'K8s Cluster Mgr', url: 'http://localhost:8082', status: 'connected', capabilities: ['kubectl_apply', 'get_pods', 'describe_service'], pluginId: 'plugin-ops', executionProfileId: 'profile-reasoning' },
    { id: 'agent-terraform', name: 'Terraform Runner', url: 'http://localhost:8085', status: 'connected', capabilities: ['plan', 'apply', 'destroy'], pluginId: 'plugin-ops', executionProfileId: 'profile-reasoning' },
    
    // Developer
    { id: 'agent-git', name: 'Git Operations', url: 'http://localhost:8083', status: 'connected', capabilities: ['git_clone', 'git_commit', 'git_diff'], pluginId: 'plugin-dev', executionProfileId: 'profile-realtime' },
    { id: 'agent-review', name: 'Code Reviewer', url: 'http://localhost:8084', status: 'connected', capabilities: ['analyze_pr', 'suggest_refactor'], pluginId: 'plugin-dev', executionProfileId: 'profile-reasoning' },
    { id: 'agent-rust', name: 'Rust Compiler Agent', url: 'http://localhost:8095', status: 'connected', capabilities: ['cargo_check', 'borrow_analysis', 'expand_macros'], pluginId: 'plugin-dev', executionProfileId: 'profile-rust' },
    { id: 'agent-qa', name: 'QA Automation', url: 'http://localhost:8086', status: 'disconnected', capabilities: ['run_selenium', 'api_test'], pluginId: 'plugin-dev', executionProfileId: 'profile-reasoning' },
    
    // Architecture
    { id: 'agent-arch', name: 'System Architect', url: 'http://localhost:8096', status: 'connected', capabilities: ['design_review', 'capacity_planning', 'topology_gen'], pluginId: 'plugin-ops', executionProfileId: 'profile-architect' },

    // Data
    { id: 'agent-postgres', name: 'Postgres DBA', url: 'http://localhost:5432/mcp', status: 'disconnected', capabilities: ['query_db', 'analyze_index'], pluginId: 'plugin-data', executionProfileId: 'profile-realtime' },
    { id: 'agent-bi', name: 'BI Analyst', url: 'http://localhost:8087', status: 'connected', capabilities: ['gen_report', 'forecast_trend'], pluginId: 'plugin-data', executionProfileId: 'profile-reasoning' },
    
    // Research
    { id: 'agent-search', name: 'Deep Web Search', url: 'http://localhost:8090', status: 'connected', capabilities: ['web_search', 'extract_article'], pluginId: 'plugin-research', executionProfileId: 'profile-creative' },
    { id: 'agent-legal', name: 'Legal Analyst', url: 'http://localhost:8091', status: 'connected', capabilities: ['review_contract', 'find_precedent'], pluginId: 'plugin-research', executionProfileId: 'profile-reasoning' },

    // Creative
    { id: 'agent-ux', name: 'UX Designer', url: 'http://localhost:8092', status: 'connected', capabilities: ['analyze_flow', 'gen_wireframe'], pluginId: 'plugin-creative', executionProfileId: 'profile-creative' },
    { id: 'agent-copy', name: 'Copywriter', url: 'http://localhost:8093', status: 'connected', capabilities: ['write_blog', 'edit_copy'], pluginId: 'plugin-creative', executionProfileId: 'profile-creative' },
    
    // Security
    { id: 'agent-sec', name: 'SecOps Sentinel', url: 'http://localhost:8094', status: 'connected', capabilities: ['scan_vuln', 'audit_logs'], pluginId: 'plugin-sec', executionProfileId: 'profile-realtime' },
];

// --- Skills (Agent Skills Enabled - 47 Skills) ---
export const BUILTIN_SKILLS: Skill[] = [
    // --- Plugin: Core (5) ---
    { id: 'skill-sys-1', name: 'Log Analysis', category: 'analysis', description: 'Analyzes system logs for errors.', parameters: { logSource: 'string', lines: 'number' }, pluginId: 'plugin-core', executionProfileId: 'profile-realtime' },
    { id: 'skill-sys-2', name: 'Config Backup', category: 'system', description: 'Snapshots property states.', parameters: { service: 'string' }, pluginId: 'plugin-core', executionProfileId: 'profile-realtime' },
    { id: 'skill-sys-3', name: 'Process Killer', category: 'system', description: 'Safely terminates processes by name.', parameters: { processName: 'string' }, pluginId: 'plugin-core', executionProfileId: 'profile-realtime' },
    { id: 'skill-sys-4', name: 'System Health Check', category: 'system', description: 'Reports CPU, RAM, and Disk usage.', parameters: { detailLevel: 'low|high' }, pluginId: 'plugin-core', executionProfileId: 'profile-realtime' },
    { id: 'skill-sys-5', name: 'Disk Cleaner', category: 'system', description: 'Identifies and cleans temp files.', parameters: { path: 'string' }, pluginId: 'plugin-core', executionProfileId: 'profile-realtime' },
    
    // --- Plugin: DevTools (9) ---
    { id: 'skill-code-1', name: 'Code Review', category: 'coding', description: 'Reviews code for security flaws.', parameters: { code: 'string' }, pluginId: 'plugin-dev', executionProfileId: 'profile-reasoning' },
    { id: 'skill-code-2', name: 'Unit Test Gen', category: 'coding', description: 'Generates test suites.', parameters: { code: 'string' }, pluginId: 'plugin-dev', executionProfileId: 'profile-reasoning' },
    { id: 'skill-code-3', name: 'Regex Builder', category: 'coding', description: 'Creates regex from description.', parameters: { desc: 'string' }, pluginId: 'plugin-dev', executionProfileId: 'profile-reasoning' },
    { id: 'skill-code-4', name: 'Typescript Converter', category: 'coding', description: 'Converts JS to TS.', parameters: { code: 'string' }, pluginId: 'plugin-dev', executionProfileId: 'profile-reasoning' },
    { id: 'skill-code-5', name: 'API Mocker', category: 'coding', description: 'Generates mock JSON responses.', parameters: { schema: 'string' }, pluginId: 'plugin-dev', executionProfileId: 'profile-creative' },
    { id: 'skill-code-6', name: 'Docstring Gen', category: 'coding', description: 'Adds documentation to functions.', parameters: { code: 'string' }, pluginId: 'plugin-dev', executionProfileId: 'profile-reasoning' },
    { id: 'skill-code-7', name: 'Git Blame Analysis', category: 'coding', description: 'Analyzes commit history context.', parameters: { file: 'string' }, pluginId: 'plugin-dev', executionProfileId: 'profile-reasoning' },
    { id: 'skill-rust-1', name: 'Unsafe Code Audit', category: 'coding', description: 'Scans Rust code for unsafe blocks.', parameters: { path: 'string' }, pluginId: 'plugin-dev', executionProfileId: 'profile-rust' },
    { id: 'skill-rust-2', name: 'Struct Layout Opt', category: 'coding', description: 'Optimizes Rust struct memory padding.', parameters: { structDef: 'string' }, pluginId: 'plugin-dev', executionProfileId: 'profile-rust' },
    
    // --- Plugin: Data (7) ---
    { id: 'skill-data-1', name: 'Text to SQL', category: 'data', description: 'Converts NLP to SQL.', parameters: { query: 'string' }, pluginId: 'plugin-data', executionProfileId: 'profile-reasoning' },
    { id: 'skill-data-2', name: 'JSON Formatter', category: 'data', description: 'Validates JSON.', parameters: { json: 'string' }, pluginId: 'plugin-data', executionProfileId: 'profile-realtime' },
    { id: 'skill-data-3', name: 'CSV to JSON', category: 'data', description: 'Converts CSV formats.', parameters: { csv: 'string' }, pluginId: 'plugin-data', executionProfileId: 'profile-realtime' },
    { id: 'skill-data-4', name: 'Entity Extractor', category: 'data', description: 'Extracts named entities.', parameters: { text: 'string' }, pluginId: 'plugin-data', executionProfileId: 'profile-reasoning' },
    { id: 'skill-data-5', name: 'Data Visualizer', category: 'data', description: 'Suggests chart types for data.', parameters: { dataSample: 'string' }, pluginId: 'plugin-data', executionProfileId: 'profile-creative' },
    { id: 'skill-data-6', name: 'Schema Validator', category: 'data', description: 'Validates JSON against schema.', parameters: { json: 'string', schema: 'string' }, pluginId: 'plugin-data', executionProfileId: 'profile-realtime' },
    { id: 'skill-data-7', name: 'Pivot Table Gen', category: 'data', description: 'Aggregates tabular data.', parameters: { data: 'string' }, pluginId: 'plugin-data', executionProfileId: 'profile-reasoning' },

    // --- Plugin: Research (6) ---
    { id: 'skill-res-1', name: 'Summarizer', category: 'content', description: 'Summarizes long text.', parameters: { text: 'string' }, pluginId: 'plugin-research', executionProfileId: 'profile-reasoning' },
    { id: 'skill-res-2', name: 'Sentiment Analysis', category: 'analysis', description: 'Detects text tone.', parameters: { text: 'string' }, pluginId: 'plugin-research', executionProfileId: 'profile-realtime' },
    { id: 'skill-res-3', name: 'Citation Finder', category: 'research', description: 'Finds sources for claims.', parameters: { claim: 'string' }, pluginId: 'plugin-research', executionProfileId: 'profile-creative' },
    { id: 'skill-res-4', name: 'Report Generator', category: 'content', description: 'Generates markdown reports.', parameters: { topic: 'string' }, pluginId: 'plugin-research', executionProfileId: 'profile-reasoning' },
    { id: 'skill-res-5', name: 'Keyword Extractor', category: 'analysis', description: 'Extracts key topics.', parameters: { text: 'string' }, pluginId: 'plugin-research', executionProfileId: 'profile-realtime' },
    { id: 'skill-res-6', name: 'Translation', category: 'content', description: 'Translates text.', parameters: { text: 'string', targetLang: 'string' }, pluginId: 'plugin-research', executionProfileId: 'profile-realtime' },

    // --- Plugin: Ops (7) ---
    { id: 'skill-ops-1', name: 'Dockerfile Gen', category: 'devops', description: 'Creates Dockerfiles.', parameters: { stack: 'string' }, pluginId: 'plugin-ops', executionProfileId: 'profile-reasoning' },
    { id: 'skill-ops-2', name: 'K8s Manifest Gen', category: 'devops', description: 'Generates YAML manifests.', parameters: { service: 'string' }, pluginId: 'plugin-ops', executionProfileId: 'profile-reasoning' },
    { id: 'skill-ops-3', name: 'Log Rotator', category: 'devops', description: 'Configures log rotation.', parameters: { path: 'string' }, pluginId: 'plugin-ops', executionProfileId: 'profile-realtime' },
    { id: 'skill-ops-4', name: 'CI/CD Pipeline Gen', category: 'devops', description: 'Generates GitHub Actions.', parameters: { tech: 'string' }, pluginId: 'plugin-ops', executionProfileId: 'profile-reasoning' },
    { id: 'skill-ops-5', name: 'Terraform Plan', category: 'devops', description: 'Generates TF config.', parameters: { resources: 'string' }, pluginId: 'plugin-ops', executionProfileId: 'profile-reasoning' },
    { id: 'skill-arch-1', name: 'System Topology Gen', category: 'devops', description: 'Generates PlantUML for architecture.', parameters: { requirements: 'string' }, pluginId: 'plugin-ops', executionProfileId: 'profile-architect' },
    { id: 'skill-arch-2', name: 'Cost Estimator', category: 'business', description: 'Estimates AWS/GCP cloud costs.', parameters: { resources: 'string' }, pluginId: 'plugin-ops', executionProfileId: 'profile-architect' },

    // --- Plugin: Security (5) ---
    { id: 'skill-sec-1', name: 'Password Auditor', category: 'security', description: 'Checks password strength.', parameters: { policy: 'string' }, pluginId: 'plugin-sec', executionProfileId: 'profile-reasoning' },
    { id: 'skill-sec-2', name: 'CVE Lookup', category: 'security', description: 'Finds CVEs for package.', parameters: { package: 'string' }, pluginId: 'plugin-sec', executionProfileId: 'profile-realtime' },
    { id: 'skill-sec-3', name: 'Port Scanner', category: 'security', description: 'Checks open ports.', parameters: { host: 'string' }, pluginId: 'plugin-sec', executionProfileId: 'profile-realtime' },
    { id: 'skill-sec-4', name: 'SQL Injection Check', category: 'security', description: 'Analyzes query for flaws.', parameters: { query: 'string' }, pluginId: 'plugin-sec', executionProfileId: 'profile-reasoning' },
    { id: 'skill-sec-5', name: 'Header Analyzer', category: 'security', description: 'Checks security headers.', parameters: { url: 'string' }, pluginId: 'plugin-sec', executionProfileId: 'profile-realtime' },

    // --- Plugin: Creative (4) ---
    { id: 'skill-crt-1', name: 'Image Prompt Enhancer', category: 'creative', description: 'Optimizes prompts for DALL-E/Midjourney.', parameters: { idea: 'string' }, pluginId: 'plugin-creative', executionProfileId: 'profile-creative' },
    { id: 'skill-crt-2', name: 'Color Palette Gen', category: 'creative', description: 'Generates UI color schemes.', parameters: { mood: 'string' }, pluginId: 'plugin-creative', executionProfileId: 'profile-creative' },
    { id: 'skill-crt-3', name: 'Blog Post Outliner', category: 'content', description: 'Creates structured outlines.', parameters: { title: 'string' }, pluginId: 'plugin-creative', executionProfileId: 'profile-creative' },
    { id: 'skill-crt-4', name: 'Social Media Caption', category: 'content', description: 'Generates engaging captions.', parameters: { content: 'string' }, pluginId: 'plugin-creative', executionProfileId: 'profile-creative' },

    // --- Plugin: Business (3) ---
    { id: 'skill-biz-1', name: 'Currency Converter', category: 'business', description: 'Real-time exchange rates.', parameters: { from: 'string', to: 'string' }, pluginId: 'plugin-biz', executionProfileId: 'profile-realtime' },
    { id: 'skill-biz-2', name: 'ROI Calculator', category: 'business', description: 'Calculates investment return.', parameters: { cost: 'number', revenue: 'number' }, pluginId: 'plugin-biz', executionProfileId: 'profile-reasoning' },
    { id: 'skill-biz-3', name: 'Tax Estimator', category: 'business', description: 'Estimates sales tax.', parameters: { amount: 'number', region: 'string' }, pluginId: 'plugin-biz', executionProfileId: 'profile-realtime' },
    
    // --- Plugin: Utility (5) ---
    { id: 'skill-util-1', name: 'Timezone Converter', category: 'utility', description: 'Converts date/time.', parameters: { time: 'string', toZone: 'string' }, pluginId: 'plugin-core', executionProfileId: 'profile-realtime' },
    { id: 'skill-util-2', name: 'UUID Generator', category: 'utility', description: 'Generates V4 UUIDs.', parameters: { count: 'number' }, pluginId: 'plugin-core', executionProfileId: 'profile-realtime' },
    { id: 'skill-util-3', name: 'Cron Expression Gen', category: 'utility', description: 'Natural language to Cron.', parameters: { desc: 'string' }, pluginId: 'plugin-core', executionProfileId: 'profile-reasoning' },
    { id: 'skill-util-4', name: 'Base64 Encoder', category: 'utility', description: 'Encodes/Decodes Base64.', parameters: { text: 'string' }, pluginId: 'plugin-core', executionProfileId: 'profile-realtime' },
    { id: 'skill-util-5', name: 'Markdown Previewer', category: 'utility', description: 'Renders Markdown to HTML.', parameters: { md: 'string' }, pluginId: 'plugin-core', executionProfileId: 'profile-realtime' },
];