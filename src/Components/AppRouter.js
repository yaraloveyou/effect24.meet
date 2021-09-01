import React, { useContext } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { authRoutes, publicRoutes } from '../routes'
import { Context } from '../index'

const AppRouter = () => {
    const { user } = useContext(Context)
    console.log(user)
    return (
        <Switch>
            {user.isAuth && authRoutes.map(({ path, Component }) =>
                <Route key={path} path={path} component={Component} />
            )}
            {publicRoutes.map(({ path, Component }) =>
                <Route key={path} path={path} component={Component} />
            )}
            {user.isAuth === true? <Redirect to={'/home'}/> : <Redirect to={'/login'}/>}
        </Switch>
    )
}

export default AppRouter