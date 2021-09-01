import React, { useContext } from 'react';
import { Context } from "../index";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { Button } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import Container from "react-bootstrap/Container";
import { useHistory } from 'react-router-dom'

const NavBar = observer(() => {
    const { user } = useContext(Context)
    const history = useHistory()

    const logout = () => {
        user.setUser({})
        user.setIsAuth(false)
        localStorage.removeItem('token')
    }

    return (
        <Navbar bg="light" variant="light">
            <Container>
                <h2 className='ml-0' style={{ color: 'gray' }}>Effect24.Meet</h2>
                {user.isAuth ?
                    <Nav className="ml-auto" style={{ color: 'gray' }}>
                        <Button
                            variant={"outline-dark"}
                            onClick={() => {
                                logout()
                                history.push('/login')
                            }}
                            className="ml-0"
                        >
                            Выйти
                        </Button>
                    </Nav>
                    : <div></div>
                }
            </Container>
        </Navbar>
    )
})

export default NavBar
