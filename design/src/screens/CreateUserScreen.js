import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';

export default function CreateUserScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const location = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const fromUserListingPage =
    location.state &&
    location.state.from === '/admin/userlist' &&
    userInfo &&
    userInfo.isAdmin !== false;

  if (!fromUserListingPage) {
    navigate('/');
    return null;
  }

  const submitCreateUserHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_HOST}/api/users/createUser`,
        {
          params: {
            name: name,
            email: email,
            password: password,
            isAdmin: isAdmin,
          },
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success(data.message);
    } catch (err) {
      toast.error(getError(err));
    }
  };
  return (
    <div className="container small-container">
      <Helmet>
        <title>Create User</title>
      </Helmet>
      <h1 className="my-3">Create User</h1>
      <form>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group class="mb-3" controlId="isAdmin">
          <Form.Label>Is Admin</Form.Label>
          <Form.Control
            as="select"
            value={isAdmin}
            onChange={(e) => setIsAdmin(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Form.Control>
        </Form.Group>
        <div className="mb-3">
          <Button
            type="button"
            variant="primary"
            onClick={(e) => submitCreateUserHandler(e)}
          >
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
