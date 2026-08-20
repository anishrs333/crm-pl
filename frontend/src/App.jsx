import React from 'react'
import './App.css'

function App() {
  const modules = [
    { name: 'Lead Management', desc: 'Capture, score, and convert prospective leads' },
    { name: 'Customer Management', desc: 'Manage 360-degree customer records and contacts' },
    { name: 'Opportunities & Sales', desc: 'Visual Kanban pipeline and deal tracking' },
    { name: 'Quotation Management', desc: 'Build, calculate, and dispatch formal price quotes' },
    { name: 'Product Catalogue', desc: 'Manage inventory, services, and price lists' },
    { name: 'Task Management', desc: 'Organize team follow-ups and action items' },
    { name: 'Reports & Analytics', desc: 'Real-time sales velocity and conversion metrics' },
  ]

  return (
    <div className="app-container">
      <header className="header">
        <h1>PL Soft Tech Solutions - CRM</h1>
        <p>Enterprise Customer Relationship Management Platform</p>
      </header>

      <main>
        <div className="module-grid">
          {modules.map((mod) => (
            <div key={mod.name} className="module-card">
              <h3>{mod.name}</h3>
              <p>{mod.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
