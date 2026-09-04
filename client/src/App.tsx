import { Outlet } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f6fb] text-slate-900">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar />

        <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default App
