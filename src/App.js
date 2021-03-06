import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { BrowserRouter } from 'react-router-dom'
import { Context } from '.'
import AppRouter from './Components/AppRouter'
import { check } from './http/user.api'

const App = observer(() => {
  const { user } = useContext(Context)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    check().then(() => {
      if (localStorage.getItem('token')) {
        user.setUser(true)
        user.setIsAuth(true)
      }
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Spinner animation={'grow'} />
  }

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
})

export default App