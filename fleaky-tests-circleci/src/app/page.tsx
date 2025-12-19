export default function HomePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>Kubiya Flaky Test Detection Demo</h1>
      <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
        This is an example repository demonstrating how Kubiya can intelligently detect and skip flaky tests,
        running only the tests relevant to your code changes.
      </p>

      <div style={{ marginTop: '40px' }}>
        <h2>Features</h2>
        <ul style={{ fontSize: '16px', lineHeight: '1.8' }}>
          <li><strong>Payment Processing</strong> - Process payments with validation</li>
          <li><strong>User Management</strong> - Create and manage users</li>
          <li><strong>Intelligent Testing</strong> - Kubiya analyzes changes and runs only relevant tests</li>
          <li><strong>Flaky Test Detection</strong> - Automatically identifies and skips unreliable tests</li>
        </ul>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Try it out</h2>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <a
            href="/payments"
            style={{
              padding: '15px 30px',
              backgroundColor: '#0070f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              display: 'inline-block',
            }}
          >
            Process Payment
          </a>
          <a
            href="/users"
            style={{
              padding: '15px 30px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              display: 'inline-block',
            }}
          >
            Manage Users
          </a>
        </div>
      </div>

      <div style={{ marginTop: '60px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h2>Before vs After Kubiya</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <div>
            <h3 style={{ color: '#dc3545' }}>Before</h3>
            <ul>
              <li>Runs all 12 tests</li>
              <li>4-6 tests fail (flaky)</li>
              <li>Takes 2-3 minutes</li>
              <li>False negatives block deployment</li>
            </ul>
          </div>
          <div>
            <h3 style={{ color: '#28a745' }}>After</h3>
            <ul>
              <li>Runs 4-6 relevant tests</li>
              <li>Skips flaky tests</li>
              <li>Takes 30-45 seconds</li>
              <li>Only real issues reported</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
