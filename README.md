<div>

<h1>🍹 HumTum POS System (V2.1 — Production Grade ERP)</h1>

<p>
A <b>premium, production-ready Restaurant POS & Management System</b> built for <b>HumTum Bar & Restaurant</b>.
Engineered with <b>enterprise-level architecture, atomic data integrity, and modern UI/UX</b>, this system goes beyond a traditional POS and delivers a <b>full-scale hospitality ERP solution</b>.
</p>

<hr/>

<h2>🏆 System Overview</h2>
<p>
HumTum POS V2.1 introduces a strict separation architecture, high-performance billing, and role-secured operations,
making it suitable for real-world restaurant environments with high concurrency.
</p>

<hr/>

<h2>🏗️ Core Architecture (Separation of Concerns)</h2>

<h3>🍽️ Kitchen Menu (Food Layer)</h3>
<ul>
<li>Managed via <b>Menu Collection</b></li>
<li>Food-only items (Biryanis, Starters, Main Course)</li>
<li>No stock dependency → faster billing</li>
</ul>

<h3>🍸 Bar Inventory (Stock Layer)</h3>
<ul>
<li>Managed via <b>Inventory Collection</b></li>
<li>Real-time stock tracking</li>
<li>Automatic stock deduction</li>
</ul>

<h3>🔄 Unified Billing Engine</h3>
<ul>
<li>Merges Menu + Inventory dynamically</li>
<li>Single-order multi-category billing</li>
<li>Optimized for low latency</li>
</ul>

<hr/>

<h2>💎 Premium UI/UX</h2>
<ul>
<li>Glassmorphism UI (blur + transparency)</li>
<li>Fixed grid (130px) for product images</li>
<li>Hover zoom effects</li>
<li>Light/Dark themes</li>
<li>Mobile optimized settlement UI</li>
</ul>

<hr/>

<h2>⚡ Key Production Features</h2>

<ul>
<li><b>Atomic Bill Numbering:</b> Redis INCR (no duplicates)</li>
<li><b>Atomic Stock Deduction:</b> MongoDB bulkWrite</li>
<li><b>System Resilience:</b> In-memory DB fallback</li>
<li><b>Visual Assets:</b> imageUrl support</li>
<li><b>Automation:</b> Node-Cron scheduling</li>
</ul>

<hr/>

<h2>🔐 Security & RBAC</h2>

<table>
<tr><th>Role</th><th>Level</th><th>Access</th></tr>
<tr><td>Admin</td><td>L3</td><td>Full control</td></tr>
<tr><td>Manager</td><td>L2</td><td>Operations</td></tr>
<tr><td>Staff</td><td>L1</td><td>Billing only</td></tr>
</table>

<ul>
<li>JWT Authentication</li>
<li>Role isolation</li>
<li>OTP recovery system</li>
</ul>

<hr/>

<h2>🧪 E2E & Performance Test Report</h2>

<p>
A complete <b>End-to-End (E2E) + Stress Testing Audit</b> was conducted to validate production readiness.
</p>

<table width="100%">
<tr>
  <th align="left">Test Category</th>
  <th align="left">Status</th>
  <th align="left">Description</th>
</tr>

<tr>
<td><b>E2E Order Flow</b></td>
<td><nobr>PASS ✅</nobr></td>
<td>Full cycle tested (Login → Order → Billing → Settlement → Stock Update)</td>
</tr>

<tr>
<td><b>Authentication & RBAC</b></td>
<td><nobr>PASS ✅</nobr></td>
<td>Role restrictions verified (Manager blocked from Admin actions)</td>
</tr>

<tr>
<td><b>Inventory Consistency</b></td>
<td><nobr>PASS ✅</nobr></td>
<td>No stock mismatch under concurrent billing</td>
</tr>

<tr>
<td><b>Atomic Operations</b></td>
<td><nobr>PASS ✅</nobr></td>
<td>Redis bill generation + MongoDB bulkWrite verified</td>
</tr>

<tr>
<td><b>Concurrency Stress Test</b></td>
<td><nobr>PASS ✅</nobr></td>
<td>Handled 100+ parallel orders without failure</td>
</tr>

<tr>
<td><b>Load Testing</b></td>
<td><nobr>PASS ✅</nobr></td>
<td>Simulated 7,500 virtual users using Artillery</td>
</tr>

<tr>
<td><b>Latency Benchmark</b></td>
<td><nobr>PASS ✅</nobr></td>
<td>Average response time maintained under high load</td>
</tr>

<tr>
<td><b>UI Stability</b></td>
<td><nobr>PASS ✅</nobr></td>
<td>No UI crashes or lag during rapid billing</td>
</tr>

</table>
<p>
<b>Result:</b> System is <b>production-ready</b> with stable performance under real-world restaurant load conditions.
</p>

<hr/>

<h2>🛠️ Tech Stack</h2>

<ul>
<li><b>Frontend:</b> React 18, Vite</li>
<li><b>Backend:</b> Node.js, Express</li>
<li><b>Database:</b> MongoDB Atlas</li>
<li><b>Caching:</b> Upstash Redis</li>
<li><b>Testing:</b> Jest, Supertest, Artillery</li>
</ul>

<hr/>

<h2>🚀 Deployment (Render)</h2>

<pre>
Build: npm run build
Start: npm start
</pre>

<pre>
CLOUD_MONGO_URI=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
JWT_SECRET=
ADMIN_EMAIL=
VITE_API_URL=
</pre>

<hr/>

<h2>💻 Local Development</h2>

<pre>
npm install
cp .env.example .env
npm run dev
</pre>

<hr/>

<h2>🏁 Final Verdict</h2>

<p>
This system is a <b>production-grade ERP solution</b> demonstrating:
</p>

<ul>
<li>Advanced system design</li>
<li>High concurrency handling</li>
<li>Secure backend architecture</li>
<li>Professional UI/UX</li>
</ul>

<p><b>Built for real-world restaurant operations with speed and reliability.</b></p>

</div>
