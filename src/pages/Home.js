import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import Button from "react-bootstrap/Button"
import Card from "react-bootstrap/Card"
import Modal from "react-bootstrap/Modal"
import { Container, Form } from "react-bootstrap"
import { useHistory } from 'react-router-dom'
import NavBar from '../Components/NavBar'

const Home = observer(() => {
    const [room, setRoom] = useState('')
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const history = useHistory()

    const uuid4 = () => {
        return 'xxx-xxxx-xxx'.replace(/[xy]/g, function (c) {
            // eslint-disable-next-line
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const uuid = uuid4()
    return (
        <>
            <NavBar />
            <Modal show={show} onHide={handleClose} animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Ссылка на вашу конференцию</Modal.Title>
                </Modal.Header>
                <Modal.Body>Скопируйте эту ссылку или код и поделитись с теми, кого хотите пригласить. Сохраните ее, если планируете встречу позже.</Modal.Body>
                <Modal.Footer>
                    <Form style={{
                        width: 450
                    }} className="d-flex flex-column">
                        <Form.Control
                            className="mt-3"
                            value={'localhost:8080/conference/' + uuid}
                            readOnly
                        />
                        <Form.Control
                            className="mt-3"
                            value={uuid}
                            readOnly
                        />
                        <Button className="mt-2" variant="outline-success" onClick={handleClose}>
                            Закрыть
                        </Button>
                    </Form>
                </Modal.Footer>
            </Modal>
            <Container
                className="d-flex justify-content-center align-items-center">
                <Card style={{ width: 500 }} className="p-5">
                    <Form className="d-flex flex-column">
                        <Button variant="outline-success" onClick={handleShow}>
                            Новая конференция
                        </Button>
                        <Form.Control
                            className="mt-3"
                            placeholder="Код конференции"
                            value={room}
                            onChange={e => setRoom(e.target.value)}
                        />
                        <Button
                            variant={"outline-success"}
                            onClick={() => history.push(`/conference/${room}`)}
                        >
                            Войти
                        </Button>
                    </Form>
                </Card>
            </Container>
        </>
    )
})

export default Home