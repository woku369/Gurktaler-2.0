import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Products from './pages/Products'
import Recipes from './pages/Recipes'
import Notes from './pages/Notes'
import Contacts from './pages/Contacts'
import Research from './pages/Research'
import Settings from './pages/Settings'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="products" element={<Products />} />
                <Route path="recipes" element={<Recipes />} />
                <Route path="notes" element={<Notes />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="research" element={<Research />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    )
}

export default App
