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
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
      };
    case 'FILTER_DATA_FAIL':
      return { ...state };
    default:
      return state;
  }
};

export default function ProductListScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ products, page, pages }, dispatch] = useReducer(reducer, {
    pages: 0,
    page: 0,
  });

  const [toRedirectToCreateProduct, setToRedirectToCreateProduct] =
    useState(false);

  const [toRedirectToProduct, setToRedirectToProduct] = useState(false);
  const [targetedProductSlug, setTargetedProductSlug] = useState('');

  const [idSearch, setIdSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [minDateSearch, setMinDateSearch] = useState('');
  const [maxDateSearch, setMaxDateSearch] = useState('');
  const [minPriceSearch, setMinPriceSearch] = useState('');
  const [maxPriceSearch, setMaxPriceSearch] = useState('');

  useEffect(() => {
    if (toRedirectToProduct) {
      navigate(`/product/${targetedProductSlug}`);
    }
  }, [navigate, targetedProductSlug, toRedirectToProduct]);

  useEffect(() => {
    if (toRedirectToCreateProduct) {
      navigate(`/admin/createproduct`, { state: { from: location.pathname } });
    }
  }, [location.pathname, navigate, toRedirectToCreateProduct]);

  const handleSearchFilter = async (p, event) => {
    event.preventDefault();
    dispatch({ type: 'FILTER_DATA_REQUEST' });
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_HOST}/api/products/searchProductList`,
        {
          params: {
            id: idSearch,
            name: nameSearch,
            brand: brandSearch,
            category: categorySearch,
            minDate: minDateSearch,
            maxDate: maxDateSearch,
            minPrice: minPriceSearch,
            maxPrice: maxPriceSearch,
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
          <Row>
            <Col md={6}>
              <Form.Group className="" controlId="brandSearch">
                <Form.Label>Search By Brand</Form.Label>
                <FormControl
                  type="text"
                  placeholder="Enter Brand"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                ></FormControl>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="categorySearch">
                <Form.Label>Search By Category</Form.Label>
                <FormControl
                  type="text"
                  placeholder="Enter Category"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
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
          <Form.Group controlId="priceRange">
            <Row>
              <Col md={6}>
                <Form.Label>Total Price From:</Form.Label>
                <FormControl
                  type="number"
                  step="0.01"
                  min={0.01}
                  placeholder="Min. Price"
                  value={minPriceSearch}
                  onChange={(e) => setMinPriceSearch(e.target.value)}
                ></FormControl>
              </Col>
              <Col md={6}>
                <Form.Label> To </Form.Label>
                <FormControl
                  type="number"
                  step="0.01"
                  min={0.01}
                  placeholder="Max. Price"
                  value={maxPriceSearch}
                  onChange={(e) => setMaxPriceSearch(e.target.value)}
                />
              </Col>
            </Row>
          </Form.Group>

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
                onClick={() => setToRedirectToCreateProduct(true)}
                style={{ marginTop: '10px' }}
              >
                Add New Product
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
              <th>BRAND</th>
              <th>CATEGORY</th>
              <th>DATE CREATED</th>
              <th>PRICE</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {products !== undefined && products !== null ? (
              products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{product.category}</td>
                  <td>{product.createdAt.substring(0, 10)}</td>
                  <td>{product.price}</td>
                  <td>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => {
                        setTargetedProductSlug(`${product.slug}`);
                        setToRedirectToProduct(true);
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
