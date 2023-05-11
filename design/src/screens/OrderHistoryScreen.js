import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { FormControl, Container } from 'react-bootstrap';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, orders: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_DELIVERY_STATUS_REQUEST':
      return { ...state, loading: true };
    case 'UPDATE_DELIVERY_STATUS_SUCCESS':
      return { ...state, loading: false, orders: action.payload };
    case 'UPDATE_DELIVERY_STATUS_FAIL':
      return { ...state, loading: false };
    case 'FILTER_DATA_REQUEST':
      return { ...state, loading: true };
    case 'FILTER_DATA_SUCCESS':
      return {
        ...state,
        loading: false,
        orders: action.payload.orders,
        page: action.payload.page,
        pages: action.payload.pages,
      };
    case 'FILTER_DATA_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

const statuses = [
  { value: true, text: 'DELIVERED' },
  { value: false, text: 'NOT DELIVERED' },
];
export default function OrderHistoryScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, orders, page, pages }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: '',
      pages: 0,
      page: 0,
    }
  );

  const [toRedirectToOrder, setToRedirectToOrder] = useState(false);
  const [targetedOrderId, setTargetedOrderId] = useState('');

  const [idSearch, setIdSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [minDateSearch, setMinDateSearch] = useState('');
  const [maxDateSearch, setMaxDateSearch] = useState('');
  const [minPriceSearch, setMinPriceSearch] = useState('');
  const [maxPriceSearch, setMaxPriceSearch] = useState('');
  const [paidStatusSearch, setPaidStatusSearch] = useState('all');
  const [deliveryStatusSearch, setDeliveryStatusSearch] = useState('all');

  useEffect(() => {
    if (toRedirectToOrder) {
      navigate(`/order/${targetedOrderId}`);
    }
  }, [navigate, targetedOrderId, toRedirectToOrder]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_HOST}/api/orders/mine`,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
      }
    };
    fetchData();
  }, [userInfo]);

  const handleStatusChange = async (targetId, newStatus) => {
    dispatch({ type: 'UPDATE_DELIVERY_STATUS_REQUEST' });
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_HOST}/api/orders/updateDeliveryStatus`,
        {
          id: targetId,
          deliveryStatus: newStatus,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );

      const updatedData = orders.map((item) => {
        if (item._id === data.order._id) {
          return { ...item, isDelivered: data.order.isDelivered };
        }
        return item;
      });

      dispatch({
        type: 'UPDATE_DELIVERY_STATUS_SUCCESS',
        payload: updatedData,
      });
      toast.info(data.message);
    } catch (err) {
      dispatch({ type: 'UPDATE_DELIVERY_STATUS_FAIL' });
      toast.error(getError(err));
    }
  };

  const handleSearchFilter = async (p, event) => {
    event.preventDefault();
    dispatch({ type: 'FILTER_DATA_REQUEST' });
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_HOST}/api/orders/searchOrderList`,
        {
          params: {
            id: idSearch,
            name: nameSearch,
            minDate: minDateSearch,
            maxDate: maxDateSearch,
            minPrice: minPriceSearch,
            maxPrice: maxPriceSearch,
            paidStatus: paidStatusSearch,
            deliveryStatus: deliveryStatusSearch,
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
        <title>
          {userInfo && userInfo.isAdmin === true
            ? 'Order List'
            : 'Order History'}
        </title>
      </Helmet>
      <h1>
        {userInfo && userInfo.isAdmin === true ? 'Order List' : 'Order History'}
      </h1>
      {userInfo && userInfo.isAdmin === true ? (
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
                  <Form.Label>Date From:</Form.Label>
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
            <Form.Group controlId="priceRange">
              <Row>
                <Col md={6}>
                  <Form.Label>Total Price From:</Form.Label>
                  <FormControl
                    type="number"
                    placeholder="Min. Price"
                    value={minPriceSearch}
                    onChange={(e) => setMinPriceSearch(e.target.value)}
                  ></FormControl>
                </Col>
                <Col md={6}>
                  <Form.Label> To </Form.Label>
                  <FormControl
                    type="number"
                    placeholder="Max. Price"
                    value={maxPriceSearch}
                    onChange={(e) => setMaxPriceSearch(e.target.value)}
                  />
                </Col>
              </Row>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group controlId="paidStatus">
                  <Form.Label>Paid Status</Form.Label>
                  <FormControl
                    as="select"
                    value={paidStatusSearch}
                    onChange={(e) => setPaidStatusSearch(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="true">Paid</option>
                    <option value="false">Not Paid</option>
                  </FormControl>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="deliveryStatus">
                  <Form.Label>Delivery Status</Form.Label>
                  <FormControl
                    as="select"
                    value={deliveryStatusSearch}
                    onChange={(e) => setDeliveryStatusSearch(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="true">Delivered</option>
                    <option value="false">Not Delivered</option>
                  </FormControl>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Button
                  type="button"
                  onClick={(e) => handleSearchFilter(1, e)}
                  style={{ marginTop: '10px' }}
                >
                  Search
                </Button>
              </Col>
            </Row>
          </Container>
        </Form>
      ) : null}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              {userInfo && userInfo.isAdmin === true ? <th>NAME</th> : null}
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERY STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders !== null ? (
              orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  {userInfo && userInfo.isAdmin === true ? (
                    <td>{order.user.name}</td>
                  ) : null}
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>{order.totalPrice.toFixed(2)}</td>
                  <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                  <td>
                    {userInfo &&
                    userInfo.isAdmin === true &&
                    order.isPaid === true ? (
                      <DropdownButton
                        title={
                          order.isDelivered
                            ? statuses[0].text
                            : statuses[1].text
                        }
                        onSelect={(newStatus) =>
                          handleStatusChange(order._id, newStatus)
                        }
                      >
                        {statuses.map((status) => (
                          <Dropdown.Item
                            key={status.value}
                            eventKey={status.value}
                          >
                            {status.text}
                          </Dropdown.Item>
                        ))}
                      </DropdownButton>
                    ) : order.isDelivered ? (
                      'Delivered at ' + order.deliveredAt.substring(0, 10)
                    ) : (
                      'Not Delivered'
                    )}
                  </td>
                  <td>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => {
                        setTargetedOrderId(`${order._id}`);
                        setToRedirectToOrder(true);
                      }}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No result found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {pages > 1
        ? [...Array(pages).keys()].map((x) => (
            <Button
              className={Number(page) === x + 1 ? 'text-bold' : ''}
              variant="light"
              onClick={(e) => handleSearchFilter(x + 1, e)}
            >
              {x + 1}
            </Button>
          ))
        : null}
    </div>
  );
}
