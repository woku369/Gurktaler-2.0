import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Products from "./pages/Products";
import Recipes from "./pages/Recipes";
import Ingredients from "./pages/Ingredients";
import Containers from "./pages/Containers";
import Notes from "./pages/Notes";
import Contacts from "./pages/Contacts";
import Research from "./pages/Research";
import Tags from "./pages/Tags";
import GlobalSearch from "./pages/GlobalSearch";
import AIAssistant from "./pages/AIAssistant";
import Documentation from "./pages/Documentation";
import Settings from "./pages/Settings";
import DesignPreview from "./pages/DesignPreview";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="products" element={<Products />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="ingredients" element={<Ingredients />} />
        <Route path="containers" element={<Containers />} />
        <Route path="notes" element={<Notes />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="research" element={<Research />} />
        <Route path="tags" element={<Tags />} />
        <Route path="search" element={<GlobalSearch />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="documentation" element={<Documentation />} />
        <Route path="settings" element={<Settings />} />
        <Route path="design-preview" element={<DesignPreview />} />
      </Route>
    </Routes>
  );
}

export default App;
