import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { FormControl, Container } from 'react-bootstrap';

import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FILTER_DATA_REQUEST':
      return { ...state };
    case 'FILTER_DATA_SUCCESS':
      return {
        ...state,
        users: action.payload.users,
        page: action.payload.page,
        pages: action.payload.pages,
      };
    case 'FILTER_DATA_FAIL':
      return { ...state };
    default:
      return state;
  }
};

const adminStatuses = [
  { value: true, text: 'YES' },
  { value: false, text: 'NO' },
];
export default function UserListScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ users, page, pages }, dispatch] = useReducer(reducer, {
    pages: 0,
    page: 0,
  });

  const [toRedirectToCreateUser, setToRedirectToCreateUser] = useState(false);

  const [idSearch, setIdSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [minDateSearch, setMinDateSearch] = useState('');
  const [maxDateSearch, setMaxDateSearch] = useState('');
  const [isAdminStatusSearch, setIsAdminStatusSearch] = useState('all');

  useEffect(() => {
    if (toRedirectToCreateUser) {
      navigate(`/admin/createuser`, { state: { from: location.pathname } });
    }
  }, [location.pathname, navigate, toRedirectToCreateUser]);

  const handleSearchFilter = async (p, event) => {
    event.preventDefault();
    dispatch({ type: 'FILTER_DATA_REQUEST' });
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_HOST}/api/users/searchUserList`,
        {
          params: {
            id: idSearch,
            name: nameSearch,
            email: emailSearch,
            minDate: minDateSearch,
            maxDate: maxDateSearch,
            isAdminStatus: isAdminStatusSearch,
            pageNo: p,
          },
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'FILTER_DATA_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FILTER_DATA_FAIL' });
      toast.error(getError(err));
    }
  };
  return (
    <div>
      <Helmet>
        <title>User List</title>
      </Helmet>
      <h1>User list</h1>
      <Form>
        <Container>
          <Row>
            <Col md={6}>
              <Form.Group className="" controlId="idSearch">
                <Form.Label>Search By ID</Form.Label>
                <FormControl
                  type="text"
                  placeholder="Enter ID"
                  value={idSearch}
                  onChange={(e) => setIdSearch(e.target.value)}
                ></FormControl>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="nameSearch">
                <Form.Label>Search By Name</Form.Label>
                <FormControl
                  type="text"
                  placeholder="Enter Name"
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                ></FormControl>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group controlId="dateRange">
            <Row>
              <Col md={6}>
                <Form.Label>Created Date From:</Form.Label>
                <FormControl
                  type="date"
                  placeholder=""
                  value={minDateSearch}
                  onChange={(e) => setMinDateSearch(e.target.value)}
                ></FormControl>
              </Col>
              <Col md={6}>
                <Form.Label> To </Form.Label>
                <FormControl
                  type="date"
                  placeholder=""
                  value={maxDateSearch}
                  onChange={(e) => setMaxDateSearch(e.target.value)}
                />
              </Col>
            </Row>
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group controlId="emailSearch">
                <Form.Label>Search By Email</Form.Label>
                <FormControl
                  type="email"
                  placeholder="Enter Email"
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                ></FormControl>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="isAdminStatus">
                <Form.Label>Is Admin</Form.Label>
                <FormControl
                  as="select"
                  value={isAdminStatusSearch}
                  onChange={(e) => setIsAdminStatusSearch(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </FormControl>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Button
                type="button"
                onClick={(event) => handleSearchFilter(1, event)}
                style={{ marginTop: '10px' }}
              >
                Search
              </Button>
            </Col>
            <Col>
              <Button
                type="button"
                onClick={() => setToRedirectToCreateUser(true)}
                style={{ marginTop: '10px' }}
              >
                Add New User
              </Button>
            </Col>
          </Row>
        </Container>
      </Form>
      {
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>DATE CREATED</th>
              <th>EMAIL</th>
              <th>IS ADMIN</th>
            </tr>
          </thead>
          <tbody>
            {users !== undefined && users !== null ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.name}</td>
                  <td>{user.createdAt.substring(0, 10)}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.isAdmin
                      ? adminStatuses[0].text
                      : adminStatuses[1].text}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No result found</td>
              </tr>
            )}
          </tbody>
        </table>
      }
      {pages > 1
        ? [...Array(pages).keys()].map((x) => (
            <Button
              className={Number(page) === x + 1 ? 'text-bold' : ''}
              variant="light"
              onClick={(event) => handleSearchFilter(x + 1, event)}
            >
              {x + 1}
            </Button>
          ))
        : null}
    </div>
  );
}
