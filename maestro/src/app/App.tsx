import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { SessionProvider } from '@/context/SessionContext'
import { AppRoutes } from '@/app/routes'

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#181818',
          borderRadius: 100,
          fontFamily: 'var(--font-display)',
        },
      }}
    >
      <SessionProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SessionProvider>
    </ConfigProvider>
  )
}
