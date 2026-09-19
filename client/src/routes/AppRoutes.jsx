import { Route, Routes } from 'react-router-dom';
import ArchitecturePlaceholder from '../pages/ArchitecturePlaceholder';

function AppRoutes() {
  return (
    <Routes>
      <Route path="*" element={<ArchitecturePlaceholder />} />
    </Routes>
  );
}

export default AppRoutes;
