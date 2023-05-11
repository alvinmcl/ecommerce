import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';

export default function CreateProductScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const location = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [countInStock, setCountInStock] = useState(0);
  const [rating, setRating] = useState(0);
  const [numReviews, setNumReviews] = useState(0);

  const [image, setImage] = useState('');
  const [tempImage, setTempImage] = useState(null);

  const fromProductListingPage =
    location.state &&
    location.state.from === '/admin/productlist' &&
    userInfo &&
    userInfo.isAdmin !== false;

  if (!fromProductListingPage) {
    navigate('/');
    return null;
  }

  const submitCreateProductHandler = async (e) => {
    e.preventDefault();
    try {
      var canProceed = true;

      if (
        isNaN(price) ||
        isNaN(countInStock) ||
        isNaN(rating) ||
        isNaN(numReviews)
      ) {
        toast.error('Invalid Number');
        canProceed = false;
      }
      if (price <= 0) {
        toast.error('Please enter a Price');
        canProceed = false;
      }
      if (countInStock < 0) {
        toast.error('Invalid Stock Count');
        canProceed = false;
      }
      if (rating < 0 || rating > 5) {
        toast.error('Invalid Rating');
        canProceed = false;
      }
      if (numReviews < 0) {
        toast.error('Invalid Review Count');
        canProceed = false;
      }
      if (canProceed) {
        const { data } = await axios
          .post(
            `${process.env.REACT_APP_API_HOST}/api/products/createProduct`,
            {
              params: {
                name: name,
                slug: slug,
                brand: brand,
                category: category,
                description: description,
                price: price,
                countInStock: countInStock,
                rating: rating,
                numReviews: numReviews,
                image: image,
              },
            },
            {
              headers: { Authorization: `Bearer ${userInfo.token}` },
            }
          )
          .then((response) => {
            if (response.status === 200) {
              toast.success(data.message);
            } else if (response.status > 200) {
              toast.error(data.message);
            }
          });
      } else {
      }
    } catch (err) {
      toast.error(getError(err));
    }
  };

  async function imageHandler(event) {
    var file = event.target.files[0];
    setTempImage(file);
  }

  const uploadImageHandler = async (event) => {
    try {
      const data = new FormData();
      data.append('file', tempImage);

      const tempData = await axios.post(
        `${process.env.REACT_APP_API_HOST}/api/products/uploadImage`,
        data,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      if (tempData) {
        toast.success(tempData.data.message);
        var tempImagePath = tempData.data.file.path;
        setImage(tempImagePath.substring(tempImagePath.indexOf('\\images')));
      }
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div className="container small-container">
      <Helmet>
        <title>Create Product</title>
      </Helmet>
      <h1 className="my-3">Create Product</h1>
      <form>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3" controlId="slug">
          <Form.Label>Slug</Form.Label>
          <Form.Control
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3" controlId="brand">
          <Form.Label>Brand</Form.Label>
          <Form.Control
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3" controlId="category">
          <Form.Label>Category</Form.Label>
          <Form.Control
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3" controlId="price">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            min={0.01}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3" controlId="countInStock">
          <Form.Label>Stock Count</Form.Label>
          <Form.Control
            type="number"
            min={0}
            value={countInStock}
            onChange={(e) => setCountInStock(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3" controlId="rating">
          <Form.Label>Rating</Form.Label>
          <Form.Control
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3" controlId="numReviews">
          <Form.Label>No. of Reviews</Form.Label>
          <Form.Control
            type="number"
            min={1}
            value={numReviews}
            onChange={(e) => setNumReviews(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3" controlId="Image">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control type="file" onChange={imageHandler}></Form.Control>
          <Button type="button" onClick={uploadImageHandler}>
            Upload
          </Button>
        </Form.Group>

        <div className="mb-3">
          <Button
            type="button"
            variant="primary"
            onClick={(e) => submitCreateProductHandler(e)}
          >
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
