import React from 'react'
import Navigation from './Navigation'
import { InstanceinfoTable, DatabaseinfoTable } from './MaterialTable'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

const App = () => {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/instanceinfo" element={<InstanceinfoTable />} />
        <Route path="/databaseinfo" element={<DatabaseinfoTable />} />
      </Routes>
    </Router>
  )
}

export default App
