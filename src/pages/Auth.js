import { observer } from 'mobx-react-lite'
import React, { useContext, useState, useEffect } from 'react'
import { Container, Form } from "react-bootstrap"
import Card from "react-bootstrap/Card"
import Button from "react-bootstrap/Button"
import Row from "react-bootstrap/Row"
import { NavLink, useLocation, useHistory } from 'react-router-dom'
import { Context } from '..'
import { registration, login } from '../http/user.api'

const Auth = observer(() => {
    const { user } = useContext(Context)
    const location = useLocation()
    const isLogin = location.pathname === '/login'
    const history = useHistory()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [usernameDirty, setUsernameDirty] = useState(false)
    const [passwordDirty, setPasswordDirty] = useState(false)

    const [usernameError, setUsernameError] = useState('Имя пользователя не может быть пустым')
    const [passwordError, setPasswordError] = useState('Пароль не может быть пустым')

    const [formValid, setFormValid] = useState(false)

    useEffect(() => {
        if (usernameError || passwordError) {
            setFormValid(true)
        } else  {
            setFormValid(true)
        }
    }, [usernameError, passwordError])

    const blurHandler = (event) => {
        if (isLogin !== '/login') {
            switch (event.target.name) {
                case 'username':
                    setUsernameDirty(true)
                    break;
                case 'password':
                    setPasswordDirty(true)
                    break;
            }
        }
    }

    const usernameHandler = (event) => {
        setUsername(event.target.value)
        if (isLogin !== '/login') {
            if (username.length < 3 || username.value > 16) {
                setUsernameError('Имя пользователя должно быть 4-16 знаков')
                if (!username) {
                    setUsernameError('Пароль не может быть пустым')
                }
            } else {
                setUsernameError('')
            }
        }
    }

    const passwordHandler = (event) => {
        setPassword(event.target.value)
        if (isLogin !== '/login') {
            if (password.length < 6 || password.value > 16) {
                setPasswordError('Пароль должен быть 6-16 знаков')
                if (!password) {
                    setPasswordError('Пароль не может быть пустым')
                }
            } else {
                setPasswordError('')
            }
        }
    }

    const click = async () => {
        try {
            let data
            if (isLogin) {
                data = await login(username, password)
            } else {
                data = await registration(username, password)
            }
            console.log(data)
            user.setUser(user)
            user.setIsAuth(true)
            history.push('/home')
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <Container
            className="d-flex justify-content-center align-items-center"
            style={{
                height: window.innerHeight - 10,
            }}
        >
            <Card style={{ width: 500 }} className="p-5">
                <h2 className="m-auto">{isLogin ? 'Авторизация' : "Регистрация"}</h2>
                <Form className="d-flex flex-column">
                    {(usernameDirty && usernameError) && <div style={{ color: 'red' }}>{usernameError}</div>}
                    <Form.Control
                        className="mb-3"
                        name="username"
                        placeholder="Логин"
                        value={username}
                        onBlur={e => blurHandler(e)}
                        onChange={e => usernameHandler(e)}
                    />
                    {(passwordDirty && passwordError) && <div style={{ color: 'red' }}>{passwordError}</div>}
                    <Form.Control
                        className="mb-3"
                        name="password"
                        placeholder="Пароль"
                        value={password}
                        onBlur={e => blurHandler(e)}
                        onChange={e => passwordHandler(e)}
                        type="password"
                    />
                    <Row className="d-flex justify-content-between mt-3 pl-3 pr-3">
                        {isLogin ?
                            <div>
                                Нет аккаунта? <NavLink to='signup'>Зарегистрируйтесь.</NavLink>
                            </div>
                            :
                            <div>
                                Есть аккаунт? <NavLink to='/login'>Войдите.</NavLink>
                            </div>
                        }
                        <Button
                            variant={"outline-success"}
                            onClick={click}
                            disabled={!formValid}
                        >
                            {isLogin ? 'Войти' : 'Регистрация'}
                        </Button>
                    </Row>
                </Form>
            </Card>
        </Container>
    )
})

export default Auth